const mongoose = require('mongoose');

const challengeSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['quiz', 'action'],
      required: true,
    },
    points: {
      type: Number,
      default: 10,
    },
    // For quiz type challenges
    options: {
      type: [String],
      default: [],
    },
    correctAnswer: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Challenge = mongoose.model('Challenge', challengeSchema);

module.exports = Challenge;
