const asyncHandler = require('express-async-handler');
const Challenge = require('../models/Challenge');
const User = require('../models/User');

// @desc    Get daily challenge
// @route   GET /api/challenges/daily
// @access  Private
const getDailyChallenge = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastChallengeDate = user.lastChallengeDate ? new Date(user.lastChallengeDate) : null;
  if (lastChallengeDate) lastChallengeDate.setHours(0, 0, 0, 0);

  const hasCompletedToday = lastChallengeDate && lastChallengeDate.getTime() === today.getTime();

  if (hasCompletedToday) {
    return res.json({ hasCompletedToday: true });
  }

  // Find a challenge the user hasn't completed
  const completedChallengeIds = user.completedChallenges.map(c => c.challenge);
  
  // Use aggregation to get a random challenge
  const challenges = await Challenge.aggregate([
    { $match: { _id: { $nin: completedChallengeIds }, isActive: true } },
    { $sample: { size: 1 } }
  ]);

  if (challenges.length === 0) {
    // If they completed all, give them a random one anyway just for fun
    const fallback = await Challenge.aggregate([
      { $match: { isActive: true } },
      { $sample: { size: 1 } }
    ]);
    if (fallback.length === 0) {
      return res.status(404).json({ message: 'No challenges available' });
    }
    return res.json({ hasCompletedToday: false, challenge: fallback[0] });
  }

  res.json({ hasCompletedToday: false, challenge: challenges[0] });
});

// @desc    Complete a challenge
// @route   POST /api/challenges/:id/complete
// @access  Private
const completeChallenge = asyncHandler(async (req, res) => {
  const challengeId = req.params.id;
  const user = await User.findById(req.user._id);
  const challenge = await Challenge.findById(challengeId);

  if (!user || !challenge) {
    res.status(404);
    throw new Error('User or Challenge not found');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastChallengeDate = user.lastChallengeDate ? new Date(user.lastChallengeDate) : null;
  const lastDateAtMidnight = lastChallengeDate ? new Date(lastChallengeDate) : null;
  if (lastDateAtMidnight) lastDateAtMidnight.setHours(0, 0, 0, 0);

  // Check if already completed today
  if (lastDateAtMidnight && lastDateAtMidnight.getTime() === today.getTime()) {
    res.status(400);
    throw new Error('You have already completed a challenge today');
  }

  // Calculate Streak
  let newStreak = 1;
  if (lastDateAtMidnight) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastDateAtMidnight.getTime() === yesterday.getTime()) {
      newStreak = user.currentStreak + 1;
    }
  }

  user.currentStreak = newStreak;
  if (newStreak > user.highestStreak) {
    user.highestStreak = newStreak;
  }

  // Update Points
  user.points += challenge.points;

  // Update Completed Challenges & Date
  user.lastChallengeDate = new Date();
  user.completedChallenges.push({ challenge: challenge._id });

  // Badges Logic
  const newBadges = [];
  if (newStreak === 3 && !user.badges.includes('3_day_streak')) {
    user.badges.push('3_day_streak');
    newBadges.push('3_day_streak');
  }
  if (newStreak === 7 && !user.badges.includes('7_day_streak')) {
    user.badges.push('7_day_streak');
    newBadges.push('7_day_streak');
  }
  if (newStreak === 30 && !user.badges.includes('30_day_streak')) {
    user.badges.push('30_day_streak');
    newBadges.push('30_day_streak');
  }
  if (user.completedChallenges.length === 1 && !user.badges.includes('first_challenge')) {
    user.badges.push('first_challenge');
    newBadges.push('first_challenge');
  }

  await user.save();

  res.json({
    message: 'Challenge completed successfully!',
    pointsAwarded: challenge.points,
    totalPoints: user.points,
    currentStreak: user.currentStreak,
    newBadges
  });
});

// @desc    Get leaderboard
// @route   GET /api/challenges/leaderboard
// @access  Private
const getLeaderboard = asyncHandler(async (req, res) => {
  const users = await User.find({})
    .sort({ points: -1, highestStreak: -1 })
    .limit(10)
    .select('name points currentStreak highestStreak badges');

  res.json(users);
});

module.exports = {
  getDailyChallenge,
  completeChallenge,
  getLeaderboard
};
