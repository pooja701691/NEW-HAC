export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  ATTENDANCE: '/attendance',
  QUIZ: '/quiz',
  NOTES: '/notes',
  LEADERBOARD: '/leaderboard',
};

export const USER_ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin',
};

export const QUIZ_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
};

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
};