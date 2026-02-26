// utils/sessionManager.js
const { v4: uuidv4 } = require('uuid');

// In-memory storage for sessions and attendance
const sessions = new Map(); // sessionId -> { timestamp, qrData, expiresAt, teacherLat, teacherLon, isActive }
const attendance = new Map(); // sessionId -> Set of studentIds
const qrcodes = new Map(); // qrToken -> { sessionId, expiresAt }

// Default classroom coordinates (fallback)
const DEFAULT_CLASSROOM_LAT = 37.7749; // Example: San Francisco
const DEFAULT_CLASSROOM_LON = -122.4194;
const ALLOWED_RADIUS = 15; // meters

// Active session tracking
let activeSession = null;

/**
 * Generate a new session ID
 * @returns {string} Unique session ID
 */
function generateSessionId() {
  return uuidv4();
}

/**
 * Create a new attendance session when teacher enters classroom
 * @param {number} teacherLat - Teacher's latitude
 * @param {number} teacherLon - Teacher's longitude
 * @returns {Object} { sessionId, qrData, expiresAt }
 */
function createAttendanceSession(teacherLat, teacherLon, classroomId = null) {
  // If there's already an active session, return it instead of auto-ending it.
  if (activeSession) {
    const existing = sessions.get(activeSession);
    return {
      sessionId: activeSession,
      qrData: existing?.qrData,
      expiresAt: existing?.expiresAt || null,
      alreadyActive: true
    };
  }

  const sessionId = generateSessionId();
  const timestamp = Date.now();
  // By default do not set a forced expiry; teacher controls end of session explicitly.
  const expiresAt = null;
  const qrData = JSON.stringify({ sessionId, timestamp });

  const sessionData = {
    timestamp,
    expiresAt,
    qrData,
    // store classroom reference coordinates (authoritative)
    teacherLat: parseFloat(teacherLat),
    teacherLon: parseFloat(teacherLon),
    classroomId: classroomId,
    isActive: true
  };

  sessions.set(sessionId, sessionData);
  activeSession = sessionId;

  return { sessionId, qrData, expiresAt };
}

/**
 * Create a short-lived dynamic QR token for a session
 * @param {string} sessionId
 * @param {number} ttlSeconds
 * @returns {Object} { qrToken, expiresAt }
 */
function createDynamicQR(sessionId, ttlSeconds = 30) {
  if (!sessions.has(sessionId)) return null;
  const qrToken = uuidv4();
  const expiresAt = Date.now() + ttlSeconds * 1000;
  qrcodes.set(qrToken, { sessionId, expiresAt });
  return { qrToken, expiresAt };
}

/**
 * Validate a dynamic QR token and return associated sessionId if valid
 * @param {string} qrToken
 * @returns {Object|null} { sessionId }
 */
function validateQRToken(qrToken) {
  const entry = qrcodes.get(qrToken);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    qrcodes.delete(qrToken);
    return null;
  }
  return { sessionId: entry.sessionId };
}

/**
 * Get session data by id
 */
function getSessionById(sessionId) {
  if (!sessions.has(sessionId)) return null;
  return sessions.get(sessionId);
}

/**
 * Update teacher/location coordinates for an active session
 */
function updateSessionLocation(sessionId, teacherLat, teacherLon) {
  if (!sessions.has(sessionId)) return false;
  const session = sessions.get(sessionId);
  session.teacherLat = parseFloat(teacherLat);
  session.teacherLon = parseFloat(teacherLon);
  sessions.set(sessionId, session);
  return true;
}

/**
 * End the current attendance session
 * @param {string} sessionId
 * @returns {boolean} True if ended successfully
 */
function endAttendanceSession(sessionId) {
  const session = sessions.get(sessionId);
  if (session) {
    session.isActive = false;
    if (activeSession === sessionId) {
      activeSession = null;
    }
    return true;
  }
  return false;
}

/**
 * Get active session details
 * @returns {Object|null} Active session data or null
 */
function getActiveSession() {
  if (!activeSession) return null;
  const session = sessions.get(activeSession);
  if (!session || !session.isActive) return null;
  return {
    sessionId: activeSession,
    teacherLat: session.teacherLat,
    teacherLon: session.teacherLon,
    classroomId: session.classroomId || null,
    expiresAt: session.expiresAt,
    qrData: session.qrData
  };
}

/**
 * Validate a QR session
 * @param {string} sessionId
 * @returns {boolean} True if valid and not expired
 */
function isValidSession(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return false;
  // If expiresAt is set, enforce it; otherwise session is valid until teacher ends it
  if (session.expiresAt && Date.now() > session.expiresAt) return false;
  if (!session.isActive) return false;
  return true;
}

/**
 * Mark attendance for a student in a session
 * @param {string} sessionId
 * @param {string} studentId
 * @param {number} studentLat
 * @param {number} studentLon
 * @returns {Object} { success, message, distance? }
 */
function markAttendance(sessionId, studentId, studentLat, studentLon) {
  if (!isValidSession(sessionId)) {
    return { success: false, message: 'Invalid or expired session' };
  }

  if (hasMarkedAttendance(sessionId, studentId)) {
    return { success: false, message: 'Attendance already marked for this session' };
  }

  const session = sessions.get(sessionId);
  const distance = haversineDistance(session.teacherLat, session.teacherLon, studentLat, studentLon);

  if (distance > ALLOWED_RADIUS) {
    return { success: false, message: `Outside classroom range. Distance: ${distance.toFixed(2)}m` };
  }

  if (!attendance.has(sessionId)) {
    attendance.set(sessionId, new Set());
  }

  const students = attendance.get(sessionId);
  students.add(studentId);

  return { success: true, message: 'Attendance marked successfully', distance: distance.toFixed(2) };
}

/**
 * Check if student already marked attendance for session
 * @param {string} sessionId
 * @param {string} studentId
 * @returns {boolean}
 */
function hasMarkedAttendance(sessionId, studentId) {
  if (!attendance.has(sessionId)) return false;
  return attendance.get(sessionId).has(studentId);
}

module.exports = {
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
};