const express = require('express');
const Classroom = require('../models/classroom.model');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Create classroom (admin only)
router.post('/', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const { name, building, room, latitude, longitude, accuracyMeters } = req.body;
    if (!name || latitude == null || longitude == null) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const classroom = new Classroom({ name, building, room, latitude, longitude, accuracyMeters, createdBy: req.user.id });
    await classroom.save();
    res.status(201).json({ success: true, classroom });
  } catch (err) {
    console.error('Error creating classroom:', err);
    res.status(500).json({ success: false, message: 'Failed to create classroom' });
  }
});

// Update classroom (admin only)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const updates = req.body;
    const classroom = await Classroom.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!classroom) return res.status(404).json({ message: 'Classroom not found' });
    res.json({ success: true, classroom });
  } catch (err) {
    console.error('Error updating classroom:', err);
    res.status(500).json({ success: false, message: 'Failed to update classroom' });
  }
});

// Get classroom by id
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) return res.status(404).json({ message: 'Classroom not found' });
    res.json({ success: true, classroom });
  } catch (err) {
    console.error('Error fetching classroom:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch classroom' });
  }
});

// List classrooms (admin)
router.get('/', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const list = await Classroom.find().sort({ name: 1 });
    res.json({ success: true, data: list });
  } catch (err) {
    console.error('Error listing classrooms:', err);
    res.status(500).json({ success: false, message: 'Failed to list classrooms' });
  }
});

module.exports = router;
