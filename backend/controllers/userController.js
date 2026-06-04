const asyncHandler = require('express-async-handler');
const User = require('../models/User.js');

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = req.body.password;
    }
    
    if (req.body.leetcodeUsername !== undefined) {
      user.codingProfiles.leetcode = req.body.leetcodeUsername;
    }
    if (req.body.codeforcesUsername !== undefined) {
      user.codingProfiles.codeforces = req.body.codeforcesUsername;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      codingProfiles: updatedUser.codingProfiles,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get user coding stats
// @route   GET /api/users/coding-stats
// @access  Private
const getCodingStats = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const responseData = {
    leetcode: null,
    codeforces: null,
  };

  if (user) {
    if (user.codingProfiles?.leetcode) {
      try {
        let lcUsername = user.codingProfiles.leetcode.trim();
        // Sanitize if they pasted a full URL
        if (lcUsername.includes('leetcode.com')) {
          const parts = lcUsername.split('/').filter(Boolean);
          lcUsername = parts[parts.length - 1];
        }

        let lcData = null;
        let data1 = null;
        let data2 = null;

        // Try Vercel API first (Fastest, no sleep)
        try {
          const res1 = await fetch(`https://leetcode-api-faisalshohag.vercel.app/${lcUsername}`);
          data1 = await res1.json();
          if (data1 && data1.totalSolved !== undefined) {
            lcData = {
              username: lcUsername,
              totalSolved: data1.totalSolved,
              easySolved: data1.easySolved,
              mediumSolved: data1.mediumSolved,
              hardSolved: data1.hardSolved
            };
          }
        } catch (e) {}

        // Fallback to Alfa Render API if Vercel fails
        if (!lcData) {
          try {
            const res2 = await fetch(`https://alfa-leetcode-api.onrender.com/${lcUsername}/solved`);
            data2 = await res2.json();
            if (data2 && data2.solvedProblem !== undefined) {
              lcData = {
                username: lcUsername,
                totalSolved: data2.solvedProblem,
                easySolved: data2.easySolved,
                mediumSolved: data2.mediumSolved,
                hardSolved: data2.hardSolved
              };
            }
          } catch(e) {}
        }

        if (lcData) {
          responseData.leetcode = lcData;
        } else {
          responseData.leetcode = {
            username: lcUsername,
            totalSolved: "User Not Found",
            easySolved: "N/A",
            mediumSolved: "N/A",
            hardSolved: "N/A"
          };
        }
      } catch (e) {
        console.error("Leetcode fetch error:", e);
      }
    }

    if (user.codingProfiles?.codeforces) {
      try {
        let cfStats = { rating: 'Unrated', rank: 'N/A', maxRating: 'N/A', totalSolved: 0 };
        
        // Fetch rating/rank
        try {
          const resInfo = await fetch(`https://codeforces.com/api/user.info?handles=${user.codingProfiles.codeforces}`);
          const dataInfo = await resInfo.json();
          if (dataInfo.status === 'OK' && dataInfo.result.length > 0) {
            cfStats.rating = dataInfo.result[0].rating;
            cfStats.rank = dataInfo.result[0].rank;
            cfStats.maxRating = dataInfo.result[0].maxRating;
          }
        } catch(e) {}

        // Fetch problems solved
        try {
          const resStatus = await fetch(`https://codeforces.com/api/user.status?handle=${user.codingProfiles.codeforces}`);
          const dataStatus = await resStatus.json();
          if (dataStatus.status === 'OK') {
            const solved = new Set();
            dataStatus.result.forEach(submission => {
              if (submission.verdict === 'OK') {
                solved.add(submission.problem.name);
              }
            });
            cfStats.totalSolved = solved.size;
          }
        } catch(e) {}

        responseData.codeforces = {
          username: user.codingProfiles.codeforces,
          ...cfStats
        };
      } catch (e) {
        console.error("Codeforces fetch error:", e);
      }
    }
  }

  res.json(responseData);
});

module.exports = {
  updateUserProfile,
  getCodingStats
};
