const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper to convert local file to inline data
const fileToGenerativePart = (filePath, mimeType) => {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
      mimeType
    },
  };
};

const extractJSON = (text) => {
  try {
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      const jsonString = text.slice(firstBrace, lastBrace + 1);
      return JSON.parse(jsonString);
    }
    return JSON.parse(text);
  } catch (error) {
    throw new Error('Failed to parse JSON from Gemini response: ' + error.message);
  }
};

const getMimeType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.heic') return 'image/heic';
  if (ext === '.heif') return 'image/heif';
  if (ext === '.pdf') return 'application/pdf'; // Note: PDFs take a different path usually, keeping it for Gemini 1.5 support
  return 'image/png'; // Default guess
};

const normalizeAndValidate = (resultObj, expectedQuestions, totalMarks) => {
  if (!resultObj || typeof resultObj !== 'object') {
    throw new Error('Gemini response is not a valid object');
  }

  // Normalize overall fields
  resultObj.overallScore = Number(resultObj.overallScore);
  resultObj.overallMax = Number(resultObj.overallMax);
  resultObj.confidence = Number(resultObj.confidence);

  if (isNaN(resultObj.overallScore) || resultObj.overallScore < 0) {
    throw new Error('overallScore must be a valid non-negative number');
  }

  if (isNaN(resultObj.overallMax) || resultObj.overallMax !== totalMarks) {
    throw new Error(`overallMax mismatch: expected ${totalMarks}, got ${resultObj.overallMax}`);
  }

  if (isNaN(resultObj.confidence) || resultObj.confidence < 0 || resultObj.confidence > 1) {
    throw new Error('confidence must be a number between 0 and 1');
  }

  if (!Array.isArray(resultObj.questions)) {
    throw new Error('questions must be an array');
  }

  const expectedMap = new Map();
  expectedQuestions.forEach(q => {
    expectedMap.set(q.id, q);
  });

  const returnedIds = new Set();
  let calculatedScore = 0;

  for (const qRes of resultObj.questions) {
    if (!qRes.id) {
      throw new Error('A question is missing its ID');
    }

    if (returnedIds.has(qRes.id)) {
      throw new Error(`Duplicate question ID returned: ${qRes.id}`);
    }
    returnedIds.add(qRes.id);

    const originalQ = expectedMap.get(qRes.id);
    if (!originalQ) {
      throw new Error(`Unexpected question ID returned: ${qRes.id}`);
    }

    // Normalize and validate score
    qRes.score = Number(qRes.score);
    if (isNaN(qRes.score) || qRes.score < 0 || qRes.score > originalQ.max) {
      throw new Error(`Invalid score for question ${qRes.id}: must be between 0 and ${originalQ.max}, got ${qRes.score}`);
    }

    // Normalize and validate max marks
    qRes.max = Number(qRes.max);
    if (isNaN(qRes.max) || qRes.max !== originalQ.max) {
      throw new Error(`Max marks mismatch for question ${qRes.id}: expected ${originalQ.max}, got ${qRes.max}`);
    }

    // Normalize and validate confidence
    qRes.confidence = Number(qRes.confidence);
    if (isNaN(qRes.confidence) || qRes.confidence < 0 || qRes.confidence > 1) {
      throw new Error(`Invalid confidence for question ${qRes.id}: must be between 0 and 1, got ${qRes.confidence}`);
    }

    // Validate feedback
    if (typeof qRes.feedback !== 'string' || qRes.feedback.trim() === '') {
      throw new Error(`Invalid feedback for question ${qRes.id}: must be a non-empty string`);
    }

    calculatedScore += qRes.score;
  }

  // Verify all expected question IDs are returned
  for (const expectedQ of expectedQuestions) {
    if (!returnedIds.has(expectedQ.id)) {
      throw new Error(`Missing expected question ID: ${expectedQ.id}`);
    }
  }

  // Verify overallScore equals sum of question scores
  if (Math.abs(resultObj.overallScore - calculatedScore) > 0.01) {
    throw new Error(`overallScore mismatch: sum of scores is ${calculatedScore}, but overallScore is ${resultObj.overallScore}`);
  }

  return resultObj;
};

async function evaluateWithGemini({ imageParts, questions, totalMarks }, retryCount = 0) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    let strictModifier = "";
    if (retryCount > 0) {
      strictModifier = "\nREMEMBER: OUTPUT ONLY JSON. DO NOT include any text, markdown, or explanation outside of the JSON structure.";
    }

const prompt = `
You are an experienced, empathetic teacher with 15+ years of grading experience across all academic levels. You are evaluating a student's handwritten answer sheet. Your goal is to grade EXACTLY as a seasoned human teacher would — fair, insightful, and encouraging while being academically rigorous.

Questions and Model Answers (use these as reference, not as a rigid checklist):
${JSON.stringify(questions, null, 2)}

════════════════════════════════════════
🧑‍🏫 TEACHER MINDSET — READ CAREFULLY
════════════════════════════════════════

You are NOT a pattern-matcher. You are a THINKER. Ask yourself:
  "Does this student understand the concept?"
  "If I were marking this in a real classroom, what would I give?"

A real teacher:
  ✓ Reads the student's intent, not just their words
  ✓ Rewards conceptual clarity even with imperfect phrasing
  ✓ Gives partial credit for partially correct answers
  ✓ Recognizes when a student explains something correctly in their own words
  ✓ Does NOT penalize minor spelling/grammar errors
  ✓ Does NOT demand word-for-word match with the model answer
  ✓ Distinguishes between a student who "almost got it" vs. one who is completely off-track
  ✓ Is consistent — same quality of answer always gets same marks

════════════════════════════════════════
📐 MARKS ALLOCATION FRAMEWORK
════════════════════════════════════════

Use this scale as internal guidance (do NOT include this in output):

  100% marks  → Answer is complete, accurate, and covers all key points.
                May use different wording than model answer — that's fine.

  75–99%      → Mostly correct. Minor omissions or slight inaccuracies.
                Core concept is clearly understood.

  50–74%      → Partially correct. Key ideas present but incomplete.
                Missing 1–2 important points, or explanation is shallow.

  25–49%      → Some relevant content but significant gaps.
                Shows awareness of the topic but misses the core concept.

  1–24%       → Very weak. Only a passing mention of the topic.
                Mostly off-track but shows minimal awareness.

  0%          → Blank, completely irrelevant, or nonsensical answer.

Always award marks in realistic increments (whole or half marks only).
Never give 0 unless the answer is truly blank or completely wrong.
Never give full marks unless the answer genuinely deserves them.

════════════════════════════════════════
🔍 EVALUATION CRITERIA (per question)
════════════════════════════════════════

For each answer, internally assess:
  1. Conceptual Accuracy    — Does the student understand the core idea?
  2. Completeness           — Are the key points covered?
  3. Relevance              — Is the answer on-topic?
  4. Clarity                — Is the explanation coherent and logical?
  5. Depth (if applicable)  — For long-answer questions, is there sufficient elaboration?

Weigh these based on the question type:
  - MCQ / Short answer  → Accuracy and relevance matter most
  - Long answer / Essay → Conceptual depth and completeness matter most
  - Definition          → Precision matters, but paraphrasing is acceptable

════════════════════════════════════════
✍️ HANDWRITING INTERPRETATION RULES
════════════════════════════════════════

If handwriting is difficult to read:
  ✓ Use context clues from surrounding words to interpret unclear letters
  ✓ Consider the most plausible word given the subject matter
  ✓ Do NOT skip or penalize an answer because of poor handwriting alone
  ✗ Do NOT invent content that isn't visible
  ✗ Do NOT assume entire sentences that aren't written

If an answer is partially cut off or unclear, evaluate only what is visible and note it in feedback.

════════════════════════════════════════
💬 FEEDBACK WRITING GUIDE
════════════════════════════════════════

Feedback must sound like a real teacher wrote it — warm, specific, and constructive.

  ✓ Mention what the student got RIGHT first
  ✓ Then point out what was missing or could be improved
  ✓ Be specific (e.g., "You explained X well but missed Y")
  ✓ Avoid generic phrases like "Good job" or "Incorrect"
  ✓ Keep it concise (1–3 sentences per question)
  ✓ Match the tone to the score — encouraging for partial credit, direct for low scores

Examples of good feedback:
  → "You correctly identified the main concept but didn't explain the mechanism — that cost you a mark."
  → "Clear understanding of the topic. Just missed mentioning the second key point."
  → "The answer is on the right track but too vague — more specific details were needed here."
  → "Mostly correct! The explanation is a little unclear but the core idea is right."

════════════════════════════════════════
⚠️ ABSOLUTE RULES (never violate these)
════════════════════════════════════════

  1. Only evaluate content that is VISIBLE in the image(s)
  2. NEVER hallucinate or assume answers that aren't written
  3. NEVER give marks based on what the student "probably meant" without visible evidence
  4. Be CONSISTENT — identical quality answers must receive identical marks
  5. Scores must add up correctly (sum of question scores = overallScore)
  6. Confidence reflects legibility + interpretability, NOT whether the answer is correct
  7. Multi-page support: The inputs represent pages of a single student's answer sheet. Consider all pages in order (1, 2, ..., N). An answer to a question may start on one page and continue on subsequent pages. Do NOT treat each page as an independent student sheet. Do not award marks for information not actually visible in the page images.

${strictModifier}

════════════════════════════════════════
📊 OUTPUT FORMAT — STRICT JSON ONLY
════════════════════════════════════════

Return ONLY valid JSON. No markdown. No explanation. No text outside the JSON object.

{
  "overallScore": number,
  "overallMax": number,
  "confidence": number,
  "gradingSummary": "1–2 sentence overall impression of the student's performance, written like a teacher's remark",
  "questions": [
    {
      "id": "Q1",
      "score": number,
      "max": number,
      "confidence": number,
      "feedback": "Specific, human-like teacher comment (1–3 sentences)"
    }
  ]
}

Field rules:
  - overallScore      → Sum of all question scores (must match exactly)
  - overallMax        → Sum of all question max marks
  - confidence        → 0.0–1.0. How clearly was the sheet readable and interpretable overall?
  - gradingSummary    → A brief, natural overall remark (e.g., "The student shows a solid grasp of the basics but needs to work on elaborating key concepts.")
  - score             → Realistic mark based on framework above
  - feedback          → Never generic. Always specific to this student's actual answer.
  - question confidence → 0.0–1.0 per question based on legibility of that specific answer

${strictModifier}`;

    const result = await model.generateContent([
        prompt,
        ...imageParts
    ]);

    const text = result.response.text();
    const resultObj = extractJSON(text);
    return normalizeAndValidate(resultObj, questions, totalMarks);

  } catch (error) {
    if (retryCount < 2) {
      console.log(`[Gemini retry] Attempt ${retryCount + 1} failed: ${error.message}. Retrying...`);
      return evaluateWithGemini({ imageParts, questions, totalMarks }, retryCount + 1);
    }
    throw error;
  }
}

module.exports = {
  evaluateWithGemini,
  fileToGenerativePart,
  getMimeType
};
