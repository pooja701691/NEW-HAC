import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, CheckCircle, XCircle, Loader, Play, Square, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { attendanceAPI } from '../services/attendance.api';
import { classroomAPI } from '../services/classroom.api';
import StudentScanner from '../components/StudentScanner';

const Attendance = () => {
  const { user, sessionInfo } = useAuth();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState(null);
  const [qrTTL, setQrTTL] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [qrToken, setQrToken] = useState(null);
  const [qrExpiresAt, setQrExpiresAt] = useState(null);
  const [qrAutoRefresh, setQrAutoRefresh] = useState(false);
  const [qrIntervalId, setQrIntervalId] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => {
          setError('Unable to retrieve location');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser');
    }

    // For teachers, session info comes from login
    // For students, check for active session
    if (user?.role === 'admin' && sessionInfo) {
      setActiveSession({
        sessionId: sessionInfo.sessionId,
        expiresAt: sessionInfo.expiresAt,
        classroomLat: sessionInfo.classroomLat,
        classroomId: sessionInfo.classroomId || null,
        classroomLon: sessionInfo.classroomLon,
      });
      setQrCode(sessionInfo.qrCode);
      if (sessionInfo.isNew) {
        setStatus('session-auto-created');
      }
    } else if (user?.role !== 'admin') {
      // Students check for active session
      checkActiveSession();
    }

    // If teacher, fetch classrooms to choose from
    if (user?.role === 'admin') {
      (async () => {
        try {
          const res = await classroomAPI.list();
          setClassrooms(res.data || []);
          if (res.data && res.data.length > 0) setSelectedClassroomId(res.data[0]._id);
        } catch (e) {
          console.error('Failed to load classrooms', e);
        }
      })();
    }
  }, [user, sessionInfo]);

  // QR TTL countdown
  useEffect(() => {
    if (!qrExpiresAt) {
      setQrTTL(null);
      return;
    }
    const update = () => {
      const diff = Math.max(0, Math.floor((new Date(qrExpiresAt).getTime() - Date.now()) / 1000));
      setQrTTL(diff);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [qrExpiresAt]);

  const getActiveClassroomName = () => {
    if (!activeSession) return null;
    const id = activeSession.classroomId || selectedClassroomId || null;
    if (!id) return null;
    const c = classrooms.find((x) => x._id === id);
    if (c) return `${c.name || c.building || ''}${c.room ? ' - ' + c.room : ''}`.trim();
    return `Class ${id.slice(0, 6)}`;
  };

  const checkActiveSession = async () => {
    try {
      const response = await attendanceAPI.getActiveSession();
      setActiveSession(response.active ? response : null);
    } catch (error) {
      console.error('Error checking active session:', error);
    }
  };

  const handleEnterClassroom = async () => {
    if (!location) {
      setError('Location not available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // If an active session exists, this action should update teacher location instead
      if (activeSession) {
        const res = await attendanceAPI.updateSessionLocation({ teacherLat: location.latitude, teacherLon: location.longitude });
        if (res.success) {
          setStatus('session-started');
        } else {
          setError(res.message || 'Failed to update session location');
        }
        setLoading(false);
        return;
      }

      // Starting a new session requires a selected classroom
      if (!selectedClassroomId) {
        setError('Please select a classroom to start session');
        setLoading(false);
        return;
      }

      const response = await attendanceAPI.enterClassroom({
        teacherLat: location.latitude,
        teacherLon: location.longitude,
        classroomId: selectedClassroomId
      });

      setActiveSession({
        sessionId: response.sessionId,
        expiresAt: response.expiresAt,
        classroomLat: response.classroomLat,
        classroomLon: response.classroomLon,
      });
      setQrCode(response.qrCode);
      setStatus('session-started');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to start classroom session');
    } finally {
      setLoading(false);
    }
  };

  const handleExitClassroom = async () => {
    setLoading(true);
    setError(null);

    try {
      await attendanceAPI.exitClassroom();
      setActiveSession(null);
      setQrCode(null);
      setStatus('session-ended');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to end classroom session');
    } finally {
      setLoading(false);
      // stop QR auto-refresh when ending session
      if (qrIntervalId) {
        clearInterval(qrIntervalId);
        setQrIntervalId(null);
        setQrAutoRefresh(false);
      }
    }
  };

  const handleMarkAttendance = async () => {
    if (!location) {
      setError('Location not available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await attendanceAPI.markAttendance({
        latitude: location.latitude,
        longitude: location.longitude,
      });

      setStatus('success');
    } catch (error) {
      setStatus('error');
      setError(error.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  const isTeacher = user?.role === 'admin'; // Assuming admin role for teachers

  const generateQROnce = async () => {
    try {
      const res = await attendanceAPI.generateQR();
      if (res.success) {
        setQrToken(res.qrToken);
        setQrCode(res.qrCode);
        setQrExpiresAt(res.expiresAt);
      }
      return res;
    } catch (err) {
      console.error('Generate QR error', err);
      throw err;
    }
  };

  const startQRAutoRefresh = async () => {
    // generate immediately then set interval
    await generateQROnce();
    if (qrIntervalId) clearInterval(qrIntervalId);
    const id = setInterval(async () => {
      try {
        await generateQROnce();
      } catch (e) {
        console.error('Auto refresh QR failed', e);
      }
    }, 30000); // every 30s
    setQrIntervalId(id);
    setQrAutoRefresh(true);
  };

  const stopQRAutoRefresh = () => {
    if (qrIntervalId) clearInterval(qrIntervalId);
    setQrIntervalId(null);
    setQrAutoRefresh(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 p-4 flex items-center justify-center">
      <motion.div
        className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 w-full max-w-md border border-white/20"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-white text-center mb-8">
          {isTeacher ? 'Teacher Panel' : 'Mark Attendance'}
        </h2>

        <div className="flex justify-center mb-4">
          <div className={`px-3 py-1 rounded-full text-sm ${activeSession ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'}`}>
            {activeSession ? `Session Active${getActiveClassroomName() ? ' — ' + getActiveClassroomName() : ' — Teacher-controlled'}` : 'No active session'}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="text-blue-400" size={20} />
              <span className="text-white font-medium">Current Location</span>
            </div>
            {location ? (
              <div className="text-white/70 text-sm">
                <p>Latitude: {location.latitude.toFixed(6)}</p>
                <p>Longitude: {location.longitude.toFixed(6)}</p>
              </div>
            ) : (
              <p className="text-white/70 text-sm">
                {error || 'Getting location...'}
              </p>
            )}
          </div>

          {isTeacher ? (
            // Teacher Controls
            <>
              {activeSession ? (
                <div className="space-y-4">
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="text-green-400" size={20} />
                      <span className="text-green-300 font-medium">
                        {status === 'session-auto-created' ? 'Session Auto-Created' : 'Session Active'}
                      </span>
                    </div>
                    <p className="text-green-200 text-sm">
                        Expires: {activeSession.expiresAt ? new Date(activeSession.expiresAt).toLocaleTimeString() : 'No expiry (teacher-controlled)'}
                    </p>
                    {status === 'session-auto-created' && (
                      <p className="text-yellow-200 text-sm mt-2">
                        📍 Using default classroom location. Update location when you enter the classroom.
                      </p>
                    )}
                  </div>

                  {/* Classroom selector for teachers */}
                  {classrooms && classrooms.length > 0 && (
                    <div className="mt-3">
                      <label className="text-sm text-white/80 mb-1 block">Select Classroom</label>
                      <select
                        value={selectedClassroomId || ''}
                        onChange={(e) => setSelectedClassroomId(e.target.value)}
                        className="w-full p-2 rounded bg-white/5 text-white/80"
                      >
                        {classrooms.map((c) => (
                          <option key={c._id} value={c._id}>{`${c.name || c.building || c._id} ${c.room ? '- ' + c.room : ''}`}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {qrCode && (
                    <div className="bg-white/10 rounded-lg p-4">
                      <p className="text-white text-sm mb-2">QR Code for Students:</p>
                      <div className="flex flex-col gap-2">
                        <img src={qrCode} alt="Attendance QR Code" className="w-full rounded-lg" />
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-white/70">Expires at: {qrExpiresAt ? new Date(qrExpiresAt).toLocaleTimeString() : '-'}</div>
                          <div className="flex gap-2">
                            {!qrAutoRefresh ? (
                              <button onClick={startQRAutoRefresh} className="px-3 py-1 bg-blue-600 rounded text-white text-sm">Generate & Auto-Refresh</button>
                            ) : (
                              <button onClick={stopQRAutoRefresh} className="px-3 py-1 bg-gray-500 rounded text-white text-sm">Stop Auto-Refresh</button>
                            )}
                            <button onClick={generateQROnce} className="px-3 py-1 bg-green-600 rounded text-white text-sm">Generate Now</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <motion.button
                      onClick={handleEnterClassroom}
                      disabled={loading || !location}
                      className={`w-full py-3 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                        loading || !location
                          ? 'bg-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                      }`}
                      whileHover={!loading && location ? { scale: 1.02 } : {}}
                      whileTap={!loading && location ? { scale: 0.98 } : {}}
                    >
                        {loading ? (
                        <>
                          <Loader className="animate-spin" size={16} />
                          Updating Location...
                        </>
                      ) : (
                        <>
                          <Play size={16} />
                          {activeSession ? 'Update Classroom Location' : 'Start Session'}
                        </>
                      )}
                    </motion.button>

                    <motion.button
                      onClick={handleExitClassroom}
                      disabled={loading}
                      className={`w-full py-3 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                        loading
                          ? 'bg-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                      }`}
                      whileHover={!loading ? { scale: 1.02 } : {}}
                      whileTap={!loading ? { scale: 0.98 } : {}}
                    >
                      {loading ? (
                        <>
                          <Loader className="animate-spin" size={16} />
                          Ending Session...
                        </>
                      ) : (
                        <>
                          <Square size={16} />
                          End Session
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              ) : (
                <motion.button
                  onClick={handleEnterClassroom}
                  disabled={loading || !location}
                  className={`w-full py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                    loading || !location
                      ? 'bg-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                  }`}
                  whileHover={!loading && location ? { scale: 1.02 } : {}}
                  whileTap={!loading && location ? { scale: 0.98 } : {}}
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin" size={20} />
                      Starting Session...
                    </>
                  ) : (
                    <>
                      <Play size={20} />
                      Start Session
                    </>
                  )}
                </motion.button>
              )}
            </>
          ) : (
            // Student Controls
            <>
              {activeSession ? (
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-4">
                  <p className="text-green-300 text-sm">Classroom session is active. You can mark your attendance now.</p>
                </div>
              ) : (
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-4">
                  <p className="text-yellow-300 text-sm">No active classroom session. Please wait for the teacher to start the session.</p>
                </div>
              )}
              <div className="space-y-4">
                <motion.button
                  onClick={handleMarkAttendance}
                  disabled={loading || !location || !activeSession}
                  className={`w-full py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                    loading || !location || !activeSession
                      ? 'bg-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                  }`}
                  whileHover={!loading && location && activeSession ? { scale: 1.02 } : {}}
                  whileTap={!loading && location && activeSession ? { scale: 0.98 } : {}}
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin" size={20} />
                      Marking...
                    </>
                  ) : status === 'success' ? (
                    <>
                      <CheckCircle size={20} />
                      Attendance Marked
                    </>
                  ) : status === 'error' ? (
                    <>
                      <XCircle size={20} />
                      Try Again
                    </>
                  ) : (
                    'Mark Attendance'
                  )}
                </motion.button>

                <div>
                  <p className="text-sm text-white/70 mb-2">Or scan QR to auto-mark (recommended)</p>
                  <StudentScanner onMarked={(res) => { setStatus('success'); }} />
                </div>
              </div>
            </>
          )}

          {error && (
            <motion.div
              className="bg-red-500/20 border border-red-500/30 rounded-lg p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-red-300 text-sm">{error}</p>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div
              className="bg-green-500/20 border border-green-500/30 rounded-lg p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-green-300 text-sm">Attendance marked successfully!</p>
            </motion.div>
          )}

          {status === 'session-started' && (
            <motion.div
              className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-blue-300 text-sm">Classroom session started successfully!</p>
            </motion.div>
          )}

          {status === 'session-auto-created' && (
            <motion.div
              className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-purple-300 text-sm">✅ Session automatically created on login. Update location when you enter the classroom.</p>
            </motion.div>
          )}

          {status === 'session-ended' && (
            <motion.div
              className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-orange-300 text-sm">Classroom session ended successfully!</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Attendance;