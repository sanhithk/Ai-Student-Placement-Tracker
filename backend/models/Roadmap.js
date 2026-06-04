const mongoose = require('mongoose');

const stepSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  }
});

const roadmapSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  targetRole: {
    type: String,
    required: true,
  },
  steps: [stepSchema]
}, {
  timestamps: true,
});

module.exports = mongoose.model('Roadmap', roadmapSchema);
