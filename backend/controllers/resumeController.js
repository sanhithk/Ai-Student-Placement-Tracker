const asyncHandler = require('express-async-handler');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const pdfParse = require('pdf-parse');
const { GoogleGenAI } = require('@google/genai');
const Resume = require('../models/Resume.js');

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const analyzeResumeWithAI = async (resumeText, jobDescription) => {
  try {
    const prompt = `You are an expert ATS and technical recruiter. Analyze the following resume text and provide a structured JSON response.
Do NOT wrap the response in markdown blocks like \`\`\`json. Return ONLY raw JSON.

Structure:
{
  "score": (a number from 0 to 100 representing the ATS score),
  "feedback": (an array of 3-5 specific, actionable strings on how to improve the resume),
  ${jobDescription ? `"jdMatchScore": (a number from 0 to 100 representing how well the resume matches the provided Job Description),
  "jdFeedback": (an array of 3-5 strings highlighting missing keywords, skills, or experience from the Job Description),` : ''}
  "parsedData": {
    "skillsExtracted": (array of strings of key technical skills found),
    "recommendation": {
      "roleType": (string, e.g. "Internship", "Entry-level Job", "Mid-level Role" based on experience),
      "reasoning": (a brief sentence explaining why),
      "searchKeywords": (array of 2 strings representing job titles to search for, e.g. ["Frontend Developer Intern", "React Internship"])
    },
    "mistakes": [
      {
        "quote": (the EXACT 1-3 sentence string verbatim from the resume text that contains a mistake or bad phrasing. MUST match the text exactly so we can highlight it.),
        "issue": (short string explaining why it is bad),
        "correction": (how to write it better)
      }
    ] // provide 3-5 mistakes
  }
}

Resume Text:
"""
${resumeText.substring(0, 5000)}
"""
${jobDescription ? `
Job Description:
"""
${jobDescription.substring(0, 3000)}
"""` : ''}`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    const textResponse = response.text;
    // Clean potential markdown blocks
    const cleanedText = textResponse.replace(/```json\n?/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Gemini AI Error:", error);
    // Fallback if AI fails
    return {
      score: 75,
      feedback: ["Add more quantitative metrics.", "Ensure strong action verbs."],
      parsedData: { 
        skillsExtracted: [],
        recommendation: {
          roleType: "Internship or Entry-level Job",
          reasoning: "Unable to analyze experience level due to processing error.",
          searchKeywords: ["Software Engineer Intern", "Junior Developer"]
        },
        mistakes: []
      }
    };
  }
};

// @desc    Upload and analyze resume
// @route   POST /api/resumes/analyze
// @access  Private
const analyzeResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload a file');
  }

  const { jobDescription } = req.body;

  let fileUrl = '';
  let resumeText = '';

  try {
    // 1. Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'auto',
      folder: 'resumes',
    });
    fileUrl = result.secure_url;
    
    // 2. Parse PDF Text
    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);
    resumeText = pdfData.text;

    // 3. Remove local file
    fs.unlinkSync(req.file.path);
  } catch (error) {
    console.error('File Processing Error:', error);
    res.status(500);
    throw new Error(error.message || 'Failed to process the uploaded file. Please ensure it is a valid PDF.');
  }

  // 4. Get AI Analysis
  const aiResult = await analyzeResumeWithAI(resumeText, jobDescription);

  const resume = await Resume.create({
    user: req.user._id,
    fileUrl,
    resumeText,
    score: aiResult.score,
    feedback: aiResult.feedback,
    parsedData: aiResult.parsedData,
    jobDescription: jobDescription || '',
    jdMatchScore: aiResult.jdMatchScore || null,
  });

  res.status(201).json(resume);
});

// @desc    Get user's resume history
// @route   GET /api/resumes
// @access  Private
const getResumes = asyncHandler(async (req, res) => {
  const resumes = await Resume.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(resumes);
});

module.exports = {
  analyzeResume,
  getResumes,
};
