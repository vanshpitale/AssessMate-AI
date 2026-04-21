const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyBmahVEdnNuzzkPf_WKd4-oseWKo0LooOs');

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

async function evaluateWithGemini({ imageParts, questions }, retryCount = 0) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    let strictModifier = "";
    if (retryCount > 0) {
      strictModifier = "\nREMEMBER: OUTPUT ONLY JSON. DO NOT include any text, markdown, or explanation outside of the JSON structure.";
    }

    const prompt = `You are an expert exam evaluator.

Evaluate the student's handwritten answer sheet image.

Use the provided questions and model answers:
${JSON.stringify(questions, null, 2)}

Scoring Criteria:
- Concept understanding
- Coverage of key points
- Accuracy
- Clarity

IMPORTANT RULES:
- Do NOT hallucinate missing content
- Only evaluate what is visible
- Be fair and consistent

Return ONLY valid JSON in this format:

{
  "overallScore": number,
  "overallMax": number,
  "confidence": number,
  "questions": [
    {
      "id": "Q1",
      "score": number,
      "max": number,
      "confidence": number,
      "feedback": "string"
    }
  ]
}

No markdown.
No explanation outside JSON.${strictModifier}`;

    const result = await model.generateContent([
        prompt,
        ...imageParts
    ]);

    const text = result.response.text();
    return extractJSON(text);

  } catch (error) {
    if (retryCount < 1) {
      console.log('Gemini generation or JSON parsing failed, retrying once...', error.message);
      return evaluateWithGemini({ imageParts, questions }, retryCount + 1);
    }
    throw error;
  }
}

module.exports = {
  evaluateWithGemini,
  fileToGenerativePart,
  getMimeType
};
