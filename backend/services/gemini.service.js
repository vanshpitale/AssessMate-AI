const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in backend environment variables');
  }
  return new GoogleGenerativeAI(apiKey);
};

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
    throw new Error('Gemini response is not a valid JSON object');
  }

  if (!Array.isArray(resultObj.questions)) {
    throw new Error('questions field in Gemini response must be an array');
  }

  const expectedMap = new Map();
  let expectedTotal = 0;
  expectedQuestions.forEach(q => {
    expectedMap.set(q.id, q);
    expectedTotal += Number(q.max) || 0;
  });

  const returnedIds = new Set();
  let calculatedScore = 0;
  const validatedQuestions = [];

  for (const qRes of resultObj.questions) {
    if (!qRes || typeof qRes !== 'object') {
      throw new Error('Each question entry must be an object');
    }

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

    // Strict score validation — no silent clamping
    const scoreNum = Number(qRes.score);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > originalQ.max) {
      throw new Error(`Invalid score for question ${qRes.id}: must be between 0 and ${originalQ.max}, got ${qRes.score}`);
    }

    // Max marks validation
    const maxNum = Number(qRes.max);
    if (isNaN(maxNum) || maxNum !== originalQ.max) {
      throw new Error(`Max marks mismatch for question ${qRes.id}: expected ${originalQ.max}, got ${qRes.max}`);
    }

    // Confidence validation (0.0 to 1.0)
    let confNum = Number(qRes.confidence);
    if (isNaN(confNum) || confNum < 0 || confNum > 1) {
      throw new Error(`Invalid confidence for question ${qRes.id}: must be a number between 0 and 1, got ${qRes.confidence}`);
    }

    // Feedback validation
    if (typeof qRes.feedback !== 'string' || qRes.feedback.trim() === '') {
      throw new Error(`Invalid feedback for question ${qRes.id}: must be a non-empty string`);
    }

    calculatedScore += scoreNum;
    validatedQuestions.push({
      id: qRes.id,
      score: scoreNum,
      max: maxNum,
      confidence: confNum,
      feedback: qRes.feedback.trim()
    });
  }

  // Verify all expected question IDs are present
  for (const expectedQ of expectedQuestions) {
    if (!returnedIds.has(expectedQ.id)) {
      throw new Error(`Missing expected question ID: ${expectedQ.id}`);
    }
  }

  // Preserve question order matching expectedQuestions
  validatedQuestions.sort((a, b) => {
    const idxA = expectedQuestions.findIndex(q => q.id === a.id);
    const idxB = expectedQuestions.findIndex(q => q.id === b.id);
    return idxA - idxB;
  });

  // Backend authoritative overall score and max calculation (Step 14)
  const finalTotalMarks = totalMarks || expectedTotal;
  const overallScore = Math.round(calculatedScore * 100) / 100;

  // Validate or calculate overall confidence
  let overallConfidence = Number(resultObj.confidence);
  if (isNaN(overallConfidence) || overallConfidence < 0 || overallConfidence > 1) {
    const sumConf = validatedQuestions.reduce((sum, q) => sum + q.confidence, 0);
    overallConfidence = Math.round((sumConf / (validatedQuestions.length || 1)) * 100) / 100;
  }

  const gradingSummary = typeof resultObj.gradingSummary === 'string' && resultObj.gradingSummary.trim() !== ''
    ? resultObj.gradingSummary.trim()
    : 'Evaluation completed.';

  return {
    overallScore,
    overallMax: finalTotalMarks,
    confidence: overallConfidence,
    gradingSummary,
    questions: validatedQuestions
  };
};

async function evaluateWithGemini({ imageParts, questions, totalMarks }, retryCount = 0, lastError = null) {
  try {
    const defaultModel = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
    const chosenModel = (retryCount > 0 && lastError && (lastError.message.includes('429') || lastError.message.includes('503') || lastError.message.includes('quota')))
      ? (defaultModel === "gemini-3.5-flash-lite" ? "gemini-3.5-flash" : "gemini-3.5-flash-lite")
      : defaultModel;

    const model = getGenAI().getGenerativeModel({ model: chosenModel });

    let correctiveSection = "";
    if (retryCount > 0 && lastError) {
      correctiveSection = `
════════════════════════════════════════
🚨 RETRY ATTEMPT ${retryCount + 1} OF 3 — FIX PREVIOUS VALIDATION ERROR:
"${lastError.message}"
════════════════════════════════════════
You MUST satisfy all validation criteria:
1. Return ONLY pure JSON matching the exact schema below.
2. Include ALL expected question IDs: ${questions.map(q => q.id).join(', ')}.
3. Do NOT invent extra question IDs.
4. Question score MUST be between 0 and that question's max mark. NEVER exceed max marks.
5. Confidence must be between 0.0 and 1.0 reflecting handwriting legibility.
6. Feedback must be a meaningful, non-empty comment.
`;
    }

const prompt = `
You are a senior, fair, and meticulous human academic examiner evaluating a student's handwritten answer sheet.
Your core principle: "Give exactly the marks the student deserves — neither less nor more."

${correctiveSection}

Questions, Maximum Marks, and Model Answers:
${JSON.stringify(questions, null, 2)}

════════════════════════════════════════
🧑‍🏫 EXAMINER PRINCIPLES & MARKING RULES
════════════════════════════════════════

1. CONCEPTUAL GRADING:
   - Award full marks when the answer is conceptually complete and accurate.
   - Accept equivalent wording, different phrasing, or student's own explanation that conveys the correct concept. Do NOT require exact word-for-word match with the model answer.
   - Award partial marks when the answer is partially correct or covers some key points.
   - Award zero or minimal marks for completely incorrect, irrelevant, or blank answers.
   - Do NOT reward an answer merely because it attempted the question if the content is wrong.
   - Do NOT penalize minor spelling or grammatical errors if the meaning is clear and correct.
   - Never award more than the maximum marks allocated for any question.

2. MULTI-PAGE CONTINUITY:
   - All input pages belong to the same student's answer sheet in sequential order (Page 1, Page 2, ..., Page N).
   - An answer may start on one page and continue onto subsequent pages. Look across all pages to evaluate the complete answer before grading a question.
   - Do NOT treat each page as an independent student.

3. LEGIBILITY & CONFIDENCE (CRITICAL):
   - Only evaluate what is genuinely visible in the images.
   - NEVER hallucinate, invent, or assume unreadable or missing content.
   - "confidence" (0.0 to 1.0) represents visual legibility and clarity of handwriting:
     * High confidence (0.85 – 1.0): Clearly readable handwriting.
     * Medium confidence (0.60 – 0.84): Minor handwriting difficulties or faint writing, but decipherable.
     * Low confidence (0.0 – 0.59): Severely unclear handwriting, blurs, or partially cut-off sections.
   - Confidence does NOT reflect whether the student's answer is correct or incorrect. A completely wrong answer that is clearly written has high confidence (1.0). A correct answer that is barely legible has low confidence.

4. CONCISE TEACHER FEEDBACK:
   - Provide 1–2 sentences of specific, constructive feedback per question.
   - State what was correct and what was missing or inaccurate.
   - Do not use chain-of-thought or lengthy internal reasoning.

════════════════════════════════════════
📊 OUTPUT FORMAT — STRICT RAW JSON ONLY
════════════════════════════════════════

Return ONLY a valid JSON object. Do NOT wrap in markdown \`\`\`json. Do NOT include any intro or outro text.

{
  "overallScore": number,
  "overallMax": number,
  "confidence": number,
  "gradingSummary": "1–2 sentence overall remark on the student's performance",
  "questions": [
    {
      "id": "Q1",
      "score": number,
      "max": number,
      "confidence": number,
      "feedback": "Concise teacher comment on this answer"
    }
  ]
}`;

    const result = await model.generateContent([
      prompt,
      ...imageParts
    ]);

    const text = result.response.text();
    const resultObj = extractJSON(text);
    return normalizeAndValidate(resultObj, questions, totalMarks);

  } catch (error) {
    if (retryCount < 2) {
      let delayMs = (retryCount + 1) * 2500;
      if (error.message && (error.message.includes('429') || error.message.includes('quota') || error.message.includes('Too Many Requests'))) {
        delayMs = 12000; // Rate limit window cooldown
      }
      console.log(`[Gemini retry] Attempt ${retryCount + 1} failed: ${error.message}. Retrying in ${delayMs}ms...`);
      await new Promise(res => setTimeout(res, delayMs));
      return evaluateWithGemini({ imageParts, questions, totalMarks }, retryCount + 1, error);
    }
    console.error(`[Gemini failure] All 3 attempts failed: ${error.message}`);
    throw new Error(`Gemini evaluation failed after 3 attempts: ${error.message}`);
  }
}

module.exports = {
  evaluateWithGemini,
  normalizeAndValidate,
  fileToGenerativePart,
  getMimeType,
  extractJSON
};
