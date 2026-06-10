const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Resume = require('../models/Resume');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// @desc    Get user's placement readiness score
// @route   GET /api/readiness
// @access  Private
const getReadinessScore = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  // 1. Resume Score (20%)
  const latestResume = await Resume.findOne({ user: user._id }).sort({ createdAt: -1 });
  const resumeScoreRaw = latestResume ? latestResume.score : 0;
  const resumeContribution = (resumeScoreRaw / 100) * 20;

  // 2. DSA & Coding (20%)
  let dsaScoreRaw = user.completedChallenges.length * 5; 
  if (user.codingProfiles?.leetcode) dsaScoreRaw += 30;
  if (user.codingProfiles?.codeforces) dsaScoreRaw += 30;
  if (user.codingProfiles?.hackerrank) dsaScoreRaw += 20;
  dsaScoreRaw = Math.min(dsaScoreRaw, 100);
  const dsaContribution = (dsaScoreRaw / 100) * 20;

  // 3. Project Quality (15%)
  let projectScoreRaw = user.readinessProfile?.projectScore || Math.min(user.skills.length * 10, 100);
  const projectContribution = (projectScoreRaw / 100) * 15;

  // 4. Interview Readiness (25%)
  let interviewScoreRaw = user.readinessProfile?.averageInterviewScore || Math.min(user.mockInterviewsAttended * 20, 100);
  const interviewContribution = (interviewScoreRaw / 100) * 25;

  // 5. Consistency (10%)
  let consistencyScoreRaw = Math.min((user.currentStreak / 14) * 100, 100);
  const consistencyContribution = (consistencyScoreRaw / 100) * 10;

  // 6. Aptitude (10%)
  let aptitudeScoreRaw = user.readinessProfile?.aptitudeScore || 0;
  const aptitudeContribution = (aptitudeScoreRaw / 100) * 10;

  const totalScore = Math.round(
    resumeContribution + 
    dsaContribution + 
    projectContribution + 
    interviewContribution + 
    consistencyContribution + 
    aptitudeContribution
  );

  // Update DB cache
  user.readinessProfile = {
    dsaScore: dsaScoreRaw,
    aptitudeScore: aptitudeScoreRaw,
    projectScore: projectScoreRaw,
    averageInterviewScore: interviewScoreRaw,
    overallScore: totalScore
  };
  await user.save();

  res.json({
    overallScore: totalScore,
    breakdown: {
      resume: Math.round(resumeScoreRaw),
      dsa: dsaScoreRaw,
      projects: projectScoreRaw,
      interviews: interviewScoreRaw,
      consistency: Math.round(consistencyScoreRaw),
      aptitude: aptitudeScoreRaw
    }
  });
});

// @desc    Get AI Recommendations based on readiness score
// @route   POST /api/readiness/ai-recommendations
// @access  Private
const getAIRecommendations = asyncHandler(async (req, res) => {
  const { breakdown } = req.body;

  const prompt = `You are an elite Placement Coordinator. A student's current Placement Readiness Breakdown is as follows (all scores out of 100):
- Resume Score: ${breakdown.resume}
- DSA Skills: ${breakdown.dsa}
- Projects: ${breakdown.projects}
- Mock Interviews: ${breakdown.interviews}
- Consistency/Streak: ${breakdown.consistency}
- Aptitude: ${breakdown.aptitude}

Based on this data, provide EXACTLY 3 highly specific, actionable recommendations on what they should do NEXT to improve their chances of getting hired. Focus on their weakest areas.
Do NOT output markdown blocks. Output raw JSON ONLY.
Structure:
{
  "recommendations": [
    {
      "area": "Which area this targets (e.g. DSA, Resume, Aptitude)",
      "advice": "Actionable advice (1-2 sentences)",
      "urgency": "High", "Medium", or "Low"
    }
  ],
  "encouragement": "A short 1-sentence encouraging message."
}`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    const textResponse = response.text;
    const cleanedText = textResponse.replace(/```json\n?/g, '').replace(/```/g, '').trim();
    
    res.json(JSON.parse(cleanedText));
  } catch (error) {
    console.error("Gemini AI Error:", error);
    res.status(500);
    throw new Error('Failed to generate AI recommendations');
  }
});

// @desc    Update Aptitude Score
// @route   PUT /api/readiness/aptitude
// @access  Private
const updateAptitudeScore = asyncHandler(async (req, res) => {
  const { score } = req.body;
  const user = await User.findById(req.user._id);
  user.readinessProfile.aptitudeScore = score;
  await user.save();
  res.json({ message: 'Aptitude score updated' });
});

module.exports = {
  getReadinessScore,
  getAIRecommendations,
  updateAptitudeScore
};
