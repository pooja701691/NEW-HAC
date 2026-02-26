import api from './api';

export const attendanceAPI = {
  // Teacher endpoints
  enterClassroom: async (teacherLocation) => {
    const response = await api.post('/attendance/enter-classroom', teacherLocation);
    return response.data;
  },

  exitClassroom: async () => {
    const response = await api.post('/attendance/exit-classroom');
    return response.data;
  },

  getActiveSession: async () => {
    const response = await api.get('/attendance/active-session');
    return response.data;
  },

  generateQR: async () => {
    const response = await api.post('/attendance/generate-qr');
    return response.data;
  },

  updateSessionLocation: async (payload) => {
    const response = await api.post('/attendance/update-session-location', payload);
    return response.data;
  },

  // Student endpoints
  markAttendance: async (locationData) => {
    const response = await api.post('/attendance/mark-attendance', locationData);
    return response.data;
  },

  getAttendanceHistory: async () => {
    const response = await api.get('/attendance/history');
    return response.data;
  },

  getAttendanceStatus: async () => {
    const response = await api.get('/attendance/status');
    return response.data;
  },
};