const asyncHandler = require('express-async-handler');
const { GoogleGenAI } = require('@google/genai');
const Roadmap = require('../models/Roadmap');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// @desc    Generate a new roadmap
// @route   POST /api/roadmap/generate
// @access  Private
const generateRoadmap = asyncHandler(async (req, res) => {
  const { targetRole } = req.body;

  if (!targetRole) {
    res.status(400);
    throw new Error('Please provide a target role');
  }

  try {
    const prompt = `You are an expert career counselor. Create a 4-step actionable learning roadmap for a student who wants to become a "${targetRole}".
Do NOT wrap the response in markdown blocks like \`\`\`json. Return ONLY raw JSON.

Structure:
[
  {
    "title": "Month 1: Step Title",
    "description": "2-3 sentences explaining what to learn and build.",
    "isCompleted": false
  },
  {
    "title": "Month 2: Step Title",
    "description": "2-3 sentences explaining what to learn and build.",
    "isCompleted": false
  },
  {
    "title": "Month 3: Step Title",
    "description": "2-3 sentences explaining what to learn and build.",
    "isCompleted": false
  },
  {
    "title": "Month 4: Step Title",
    "description": "2-3 sentences explaining what to learn and build.",
    "isCompleted": false
  }
]`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    const textResponse = response.text;
    const cleanedText = textResponse.replace(/```json\n?/g, '').replace(/```/g, '').trim();
    const steps = JSON.parse(cleanedText);

    // Delete existing roadmap for this user if it exists
    await Roadmap.findOneAndDelete({ user: req.user._id });

    // Save new roadmap
    const roadmap = await Roadmap.create({
      user: req.user._id,
      targetRole,
      steps
    });

    res.status(201).json(roadmap);
  } catch (error) {
    console.error("Roadmap Generation Error:", error);
    res.status(500);
    throw new Error('Failed to generate roadmap using AI');
  }
});

// @desc    Get user's roadmap
// @route   GET /api/roadmap
// @access  Private
const getRoadmap = asyncHandler(async (req, res) => {
  const roadmap = await Roadmap.findOne({ user: req.user._id });
  if (roadmap) {
    res.json(roadmap);
  } else {
    res.status(404);
    throw new Error('Roadmap not found');
  }
});

// @desc    Update roadmap step status
// @route   PUT /api/roadmap/:id/step/:stepId
// @access  Private
const updateStepStatus = asyncHandler(async (req, res) => {
  const { isCompleted } = req.body;
  const roadmap = await Roadmap.findById(req.params.id);

  if (roadmap) {
    if (roadmap.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized');
    }

    const step = roadmap.steps.id(req.params.stepId);
    if (step) {
      step.isCompleted = isCompleted;
      await roadmap.save();
      res.json(roadmap);
    } else {
      res.status(404);
      throw new Error('Step not found');
    }
  } else {
    res.status(404);
    throw new Error('Roadmap not found');
  }
});

module.exports = {
  generateRoadmap,
  getRoadmap,
  updateStepStatus,
};
