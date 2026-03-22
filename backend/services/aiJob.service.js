const axios = require('axios');

/**
 * Service to call the Python AI microservice for evaluation.
 * @param {string} evaluationId - The ID of the evaluation document
 * @param {Array<string>} fileUrls - Array of file paths or URLs
 */
const triggerAIEvaluation = async (evaluationId, fileUrls) => {
  try {
    const aiEndpoint = process.env.AI_SERVICE_URL || 'http://localhost:8000/evaluate';
    
    const payload = {
      evaluationId,
      files: fileUrls
    };

    console.log(`Triggering AI Job for Evaluation: ${evaluationId}`);
    
    // Call the AI Microservice
    // The microservice is expected to process asynchronously and might return
    // { results: [ { sheetId, aiScore, confidence, feedback } ] }
    // OR it might invoke a webhook back to our Node.js server to give results.
    // For this implementation, we are assuming it returns immediately or we just
    // handle it within standard timeouts.
    
    const response = await axios.post(aiEndpoint, payload, {
      timeout: 60000 // 60s timeout for demo; in prod use message queues instead
    });

    return response.data;
  } catch (error) {
    console.error('AI Job Service Error:', error.message);
    throw error;
  }
};

module.exports = {
  triggerAIEvaluation
};
