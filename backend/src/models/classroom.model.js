const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  building: { type: String },
  room: { type: String },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  accuracyMeters: { type: Number, default: 15 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Classroom', classroomSchema);
