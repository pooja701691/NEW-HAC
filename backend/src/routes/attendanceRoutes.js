// routes/attendanceRoutes.js
const express = require('express');
const QRCode = require('qrcode');
const Attendance = require('../models/attendance.model');
const Classroom = require('../models/classroom.model');
const { verifyToken } = require('../middleware/auth');
const { haversineDistance } = require('../utils/distance');
const {
  createAttendanceSession,
  endAttendanceSession,
  getActiveSession,
  isValidSession,
  markAttendance,
  hasMarkedAttendance,
  createDynamicQR,
  validateQRToken,
  getSessionById,
  updateSessionLocation,
  DEFAULT_CLASSROOM_LAT,
  DEFAULT_CLASSROOM_LON,
  ALLOWED_RADIUS
} = require('../utils/sessionManager');

const router = express.Router();

// POST /enter-classroom - Teacher enters classroom and creates session
router.post('/enter-classroom', verifyToken, async (req, res) => {
  try {
    const { classroomId, teacherLat, teacherLon } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only teachers/admins can start sessions' });
    }

    if (!classroomId) {
      return res.status(400).json({ success: false, message: 'classroomId is required' });
    }

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ success: false, message: 'Classroom not found' });
    }

    if (teacherLat == null || teacherLon == null) {
      return res.status(400).json({ success: false, message: 'Teacher location (latitude, longitude) is required' });
    }

    // Validate proximity between teacher reported location and stored classroom location
    const distance = haversineDistance(teacherLat, teacherLon, classroom.latitude, classroom.longitude);
    const allowed = Math.max(ALLOWED_RADIUS, classroom.accuracyMeters || 15);
    if (distance > allowed) {
      return res.status(400).json({ success: false, message: `You are ${distance.toFixed(1)}m away from the classroom. Move closer to start session.` });
    }

    // Create session using classroom authoritative coordinates and reference the classroomId
    const createResult = createAttendanceSession(classroom.latitude, classroom.longitude, classroomId);
    // If a session is already active, return that info instead of auto-ending it
    if (createResult.alreadyActive) {
      return res.status(200).json({
        success: true,
        message: 'A classroom session is already active. End it before starting a new one.',
        sessionId: createResult.sessionId,
        qrData: createResult.qrData,
        expiresAt: createResult.expiresAt || null
      });
    }
    const { sessionId, qrData, expiresAt } = createResult;

    // Generate QR code as base64 string
    const qrCodeDataURL = await QRCode.toDataURL(qrData);

    res.json({
      success: true,
      sessionId,
      qrCode: qrCodeDataURL,
      expiresAt,
      classroomLat: classroom.latitude,
      classroomLon: classroom.longitude,
      classroomId,
      message: 'Classroom session started successfully'
    });
  } catch (error) {
    console.error('Error creating classroom session:', error);
    res.status(500).json({ success: false, message: 'Failed to start classroom session' });
  }
});

// POST /exit-classroom - Teacher exits classroom and ends session
router.post('/exit-classroom', (req, res) => {
  try {
    const activeSession = getActiveSession();

    if (!activeSession) {
      return res.status(400).json({
        success: false,
        message: 'No active classroom session found'
      });
    }

    const ended = endAttendanceSession(activeSession.sessionId);

    if (!ended) {
      return res.status(400).json({
        success: false,
        message: 'Failed to end classroom session'
      });
    }

    res.json({
      success: true,
      message: 'Classroom session ended successfully'
    });
  } catch (error) {
    console.error('Error ending classroom session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end classroom session'
    });
  }
});

// POST /update-session-location - Teacher updates location for the active session
router.post('/update-session-location', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only teachers/admins can update session location' });
    }

    const { teacherLat, teacherLon } = req.body;
    if (teacherLat == null || teacherLon == null) {
      return res.status(400).json({ success: false, message: 'teacherLat and teacherLon are required' });
    }

    const active = getActiveSession();
    if (!active) return res.status(400).json({ success: false, message: 'No active session to update' });

    const ok = updateSessionLocation(active.sessionId, teacherLat, teacherLon);
    if (!ok) return res.status(500).json({ success: false, message: 'Failed to update session location' });

    res.json({ success: true, message: 'Session location updated successfully' });
  } catch (err) {
    console.error('Error updating session location:', err);
    res.status(500).json({ success: false, message: 'Failed to update session location' });
  }
});

// POST /generate-qr - Generate a short-lived QR token for the active session (30s)
router.post('/generate-qr', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Only admins can generate QR' });

    const activeSession = getActiveSession();
    if (!activeSession) return res.status(400).json({ success: false, message: 'No active session' });

    const { qrToken, expiresAt } = createDynamicQR(activeSession.sessionId, 30);
    if (!qrToken) return res.status(500).json({ success: false, message: 'Failed to create QR token' });

    const qrCodeDataURL = await QRCode.toDataURL(qrToken);
    res.json({ success: true, qrToken, qrCode: qrCodeDataURL, expiresAt });
  } catch (err) {
    console.error('Error generating QR:', err);
    res.status(500).json({ success: false, message: 'Failed to generate QR' });
  }
});

// GET /active-session - Get current active session info
router.get('/active-session', (req, res) => {
  try {
    const activeSession = getActiveSession();

    if (!activeSession) {
      return res.json({
        success: true,
        active: false,
        message: 'No active classroom session'
      });
    }

    res.json({
      success: true,
      active: true,
      sessionId: activeSession.sessionId,
      classroomLat: activeSession.teacherLat,
      classroomLon: activeSession.teacherLon,
      expiresAt: activeSession.expiresAt
    });
  } catch (error) {
    console.error('Error getting active session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get active session'
    });
  }
});

// POST /mark-attendance
router.post('/mark-attendance', verifyToken, async (req, res) => {
  try {
    const { latitude, longitude, sessionId, qrToken } = req.body;

    // Validate required fields
    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'Missing required fields: latitude, longitude' });
    }

    // Determine sessionId either from qrToken (preferred) or active session
    let targetSessionId = null;

    if (qrToken) {
      const valid = validateQRToken(qrToken);
      if (!valid) {
        return res.status(400).json({ success: false, message: 'Invalid or expired QR token' });
      }
      targetSessionId = valid.sessionId;
    } else if (sessionId) {
      targetSessionId = sessionId;
    } else {
      const activeSession = getActiveSession();
      if (!activeSession) return res.status(400).json({ success: false, message: 'No active classroom session found' });
      targetSessionId = activeSession.sessionId;
    }

    // Validate session exists and not expired
    const sessionData = getSessionById(targetSessionId);
    if (!sessionData || !sessionData.isActive) {
      return res.status(400).json({ success: false, message: 'Session not found or inactive' });
    }
    if (Date.now() > sessionData.expiresAt) {
      return res.status(400).json({ success: false, message: 'Session has expired' });
    }

    // Get user id
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

    // Check if user already marked attendance for this session
    const existingAttendance = await Attendance.findOne({ userId, sessionId: targetSessionId });
    if (existingAttendance) {
      return res.status(400).json({ success: false, message: 'Attendance already marked for this session' });
    }

    // Determine classroom coordinates: prefer classroomId if present
    let classroomLat = sessionData.teacherLat;
    let classroomLon = sessionData.teacherLon;
    let allowedRadius = ALLOWED_RADIUS;
    if (sessionData.classroomId) {
      const classroom = await Classroom.findById(sessionData.classroomId);
      if (classroom) {
        classroomLat = classroom.latitude;
        classroomLon = classroom.longitude;
        allowedRadius = Math.max(ALLOWED_RADIUS, classroom.accuracyMeters || ALLOWED_RADIUS);
      }
    }

    // Calculate distance
    const distance = haversineDistance(latitude, longitude, classroomLat, classroomLon);
    if (distance > allowedRadius) {
      return res.status(400).json({ success: false, message: `You are ${distance.toFixed(1)} meters from the classroom. Please move closer to mark attendance.` });
    }

    // Create attendance record
    const attendance = new Attendance({ userId, sessionId: targetSessionId, timestamp: new Date(), location: { latitude, longitude }, distance, status: 'present' });
    await attendance.save();

    res.json({ success: true, message: 'Attendance marked successfully', distance: distance.toFixed(1), timestamp: attendance.timestamp });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ success: false, message: 'Failed to mark attendance' });
  }
});

// GET /history - Get attendance history for authenticated user
router.get('/history', verifyToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const attendanceRecords = await Attendance.find({ userId })
      .sort({ timestamp: -1 })
      .populate('userId', 'name email');

    res.json({
      success: true,
      data: attendanceRecords
    });
  } catch (error) {
    console.error('Error fetching attendance history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance history'
    });
  }
});

// GET /status - Get current attendance status
router.get('/status', verifyToken, (req, res) => {
  try {
    const activeSession = getActiveSession();

    res.json({
      success: true,
      activeSession: activeSession ? {
        sessionId: activeSession.sessionId,
        expiresAt: activeSession.expiresAt,
        classroomLat: activeSession.teacherLat,
        classroomLon: activeSession.teacherLon
      } : null
    });
  } catch (error) {
    console.error('Error getting attendance status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get attendance status'
    });
  }
});

module.exports = router;