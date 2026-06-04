const mongoose = require('mongoose');

const resumeSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    fileUrl: {
      type: String,
      required: true,
    },
    resumeText: {
      type: String,
      default: '',
    },
    score: {
      type: Number,
      required: true,
      default: 0,
    },
    feedback: {
      type: [String],
      default: [],
    },
    parsedData: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const Resume = mongoose.model('Resume', resumeSchema);

module.exports = Resume;
