const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { verifyToken } = require('../middleware/auth');
const { createAttendanceSession, getActiveSession } = require('../utils/sessionManager');
const QRCode = require('qrcode');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields: name, email, password' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    if (err.code === 11000) {
      res.status(400).json({ message: 'Email already exists' });
    } else {
      res.status(400).json({ message: err.message || 'Registration failed' });
    }
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    let sessionInfo = null;

    // If user is a teacher (admin), automatically handle attendance session
    if (user.role === 'admin') {
      let activeSession = getActiveSession();

      if (!activeSession) {
        // Create new session with default classroom coordinates
        // Teacher can update location when they actually enter classroom
        const defaultLat = 37.7749; // Default classroom location
        const defaultLon = -122.4194;
        const sessionData = createAttendanceSession(defaultLat, defaultLon);

        // Generate QR code for the session
        const qrCodeDataURL = await QRCode.toDataURL(sessionData.qrData);

        sessionInfo = {
          sessionId: sessionData.sessionId,
          qrCode: qrCodeDataURL,
          expiresAt: sessionData.expiresAt,
          classroomLat: defaultLat,
          classroomLon: defaultLon,
          isNew: true
        };
      } else {
        // Return existing active session info
        const qrCodeDataURL = await QRCode.toDataURL(activeSession.qrData);

        sessionInfo = {
          sessionId: activeSession.sessionId,
          qrCode: qrCodeDataURL,
          expiresAt: activeSession.expiresAt,
          classroomLat: activeSession.teacherLat,
          classroomLon: activeSession.teacherLon,
          isNew: false
        };
      }
    }

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      sessionInfo
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Protected route
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
