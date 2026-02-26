const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sessionId: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  location: {
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
  },
  distance: {
    type: Number, // distance from classroom in meters
    required: true,
  },
  status: {
    type: String,
    enum: ['present', 'late', 'absent'],
    default: 'present',
  },
}, {
  timestamps: true,
});

// Index for efficient queries
attendanceSchema.index({ userId: 1, sessionId: 1 }, { unique: true });
attendanceSchema.index({ sessionId: 1 });
attendanceSchema.index({ timestamp: -1 });

module.exports = mongoose.model('Attendance', attendanceSchema);