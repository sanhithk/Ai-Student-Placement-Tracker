const asyncHandler = require('express-async-handler');
const Resume = require('../models/Resume.js');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// @desc    Generate a Proof-of-Work project idea
// @route   POST /api/pow/generate
// @access  Private
const generatePoWProject = asyncHandler(async (req, res) => {
  const { jobDescription, companyName } = req.body;

  if (!jobDescription) {
    res.status(400);
    throw new Error('Job description is required');
  }

  // 1. Get user's latest resume
  const resume = await Resume.findOne({ user: req.user._id }).sort({ createdAt: -1 });
  let userSkills = [];
  if (resume && resume.parsedData && resume.parsedData.skillsExtracted) {
    userSkills = resume.parsedData.skillsExtracted;
  }

  // 2. Build the prompt for Gemini
  const prompt = `You are a career strategist and senior software engineer. A candidate wants to build a "Proof of Work" (PoW) mini-project to bypass the ATS and send directly to a recruiter/hiring manager for a specific job.

Company: ${companyName || 'Unknown Company'}
Job Description:
${jobDescription.substring(0, 3000)}

Candidate's current skills: ${userSkills.length > 0 ? userSkills.join(', ') : 'General software engineering skills'}

Generate a micro-project idea that:
1. Directly solves a problem or demonstrates a skill required in the job description.
2. Uses some of the candidate's existing skills mixed with the job's required tech stack.
3. Can be built in under 3 hours.

Respond strictly in JSON format matching this structure exactly (DO NOT wrap in markdown, just output raw JSON):
{
  "projectTitle": "Name of the project",
  "description": "Why this project proves value for this specific role (1-2 sentences)",
  "techStack": ["Tech1", "Tech2", "Tech3"],
  "architectureSteps": [
    "Step 1: description",
    "Step 2: description",
    "Step 3: description"
  ],
  "recruiterMessage": "A short, professional, and slightly confident cold message to send to the recruiter upon completion, mentioning what was built and how it relates to the job posting."
}`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    // Clean potential markdown blocks
    const cleanedText = response.text.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
    const powData = JSON.parse(cleanedText);
    
    res.json(powData);
  } catch (error) {
    console.error("Gemini PoW Generation Error:", error);
    res.status(500);
    throw new Error('Failed to generate Proof of Work project');
  }
});

module.exports = {
  generatePoWProject,
};
