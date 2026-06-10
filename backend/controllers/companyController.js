const asyncHandler = require('express-async-handler');
const companies = require('../data/companies');
const User = require('../models/User');

// @desc    Get all companies
// @route   GET /api/companies
// @access  Private
const getCompanies = asyncHandler(async (req, res) => {
  res.json(companies);
});

// @desc    Get company by ID
// @route   GET /api/companies/:id
// @access  Private
const getCompanyById = asyncHandler(async (req, res) => {
  const company = companies.find((c) => c.id === req.params.id);

  if (company) {
    res.json(company);
  } else {
    res.status(404);
    throw new Error('Company not found');
  }
});

// @desc    Get user match score for a specific company
// @route   GET /api/companies/:id/match
// @access  Private
const getCompanyMatchScore = asyncHandler(async (req, res) => {
  const company = companies.find((c) => c.id === req.params.id);
  
  if (!company) {
    res.status(404);
    throw new Error('Company not found');
  }

  const user = await User.findById(req.user._id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const userOverallScore = user.readinessProfile?.overallScore || 0;
  
  // Calculate match percentage based on company difficulty
  // If user score > company difficulty, match is 100%. Otherwise it's proportional.
  let matchPercentage = 0;
  if (userOverallScore >= company.difficultyScore) {
    matchPercentage = 100;
  } else {
    // Give them a base score, plus the ratio of their score to difficulty
    // E.g. user 50, diff 90 -> 50/90 = 55%
    matchPercentage = Math.round((userOverallScore / company.difficultyScore) * 100);
  }

  // Generate some simple insights based on data
  const insights = [];
  if (user.readinessProfile?.dsaScore < 60 && company.recommendedDSA.length > 0) {
    insights.push(`Your DSA score is low. ${company.name} heavily focuses on ${company.recommendedDSA[0]} and ${company.recommendedDSA[1] || 'Algorithms'}.`);
  }
  if (user.readinessProfile?.averageInterviewScore < 70) {
    insights.push(`Improve your mock interview performance before facing ${company.name}'s rigorous workflow.`);
  }
  if (userOverallScore >= company.difficultyScore) {
    insights.push(`Your profile looks highly competitive for ${company.name}. Keep practicing to maintain this edge!`);
  } else if (matchPercentage > 75) {
    insights.push(`You are very close to the standard required by ${company.name}. Focus on your weakest areas.`);
  } else {
    insights.push(`You need significant preparation to reach the standard expected by ${company.name}. Start with foundational DSA and resume building.`);
  }

  res.json({
    matchPercentage,
    insights,
    userScore: userOverallScore,
    companyDifficulty: company.difficultyScore
  });
});

module.exports = {
  getCompanies,
  getCompanyById,
  getCompanyMatchScore
};
