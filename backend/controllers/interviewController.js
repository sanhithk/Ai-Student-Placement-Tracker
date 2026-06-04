const asyncHandler = require('express-async-handler');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// @desc    Generate next interview question
// @route   POST /api/interview/next
// @access  Private
const generateNextQuestion = asyncHandler(async (req, res) => {
  const { topic, history } = req.body;

  if (!topic) {
    res.status(400);
    throw new Error('Please provide an interview topic');
  }

  try {
    let prompt = '';
    
    if (!history || history.length === 0) {
      prompt = `You are an expert technical interviewer conducting a mock interview on the topic: "${topic}". 
Please start the interview by introducing yourself warmly, welcoming the candidate, and asking the very first interview question. Keep it concise (2-3 sentences max). Output ONLY what the Interviewer should say.`;
    } else {
      const transcript = history.map(msg => `${msg.role === 'ai' ? 'Interviewer' : 'Candidate'}: ${msg.text}`).join('\n\n');
      prompt = `You are an expert technical interviewer conducting a mock interview on the topic: "${topic}".
Here is the conversation transcript so far:

${transcript}

Based on the Candidate's last response, briefly acknowledge or evaluate their answer (1-2 sentences), and then ask the NEXT logical interview question. 
Output ONLY what the Interviewer should say next. Do not include labels like "Interviewer:".`;
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    res.json({ text: response.text.trim() });
  } catch (error) {
    console.error("Interview API Error:", error);
    res.status(500);
    throw new Error('Failed to generate interview question');
  }
});

// @desc    Evaluate interview
// @route   POST /api/interview/evaluate
// @access  Private
const evaluateInterview = asyncHandler(async (req, res) => {
  const { topic, history } = req.body;

  try {
    const transcript = history.map(h => `${h.role === 'ai' ? 'Interviewer' : 'Candidate'}: ${h.text}`).join('\n\n');
    
    const prompt = `You are an expert technical recruiter. Review the following 5-minute mock interview transcript for the topic "${topic}".
Provide a structured JSON response evaluating the candidate's performance.
Do NOT wrap the response in markdown blocks like \`\`\`json. Return ONLY raw JSON.

Structure:
{
  "score": (number 0-100),
  "feedback": (string, 3-4 sentences of overall constructive feedback),
  "strengths": (array of 2-3 short strings),
  "improvements": (array of 2-3 short strings)
}

Transcript:
${transcript}
`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    const textResponse = response.text;
    const cleanedText = textResponse.replace(/```json\n?/g, '').replace(/```/g, '').trim();
    
    res.json(JSON.parse(cleanedText));
  } catch (error) {
    console.error("Evaluation Error:", error);
    res.status(500);
    throw new Error('Failed to evaluate interview');
  }
});

module.exports = {
  generateNextQuestion,
  evaluateInterview,
};
