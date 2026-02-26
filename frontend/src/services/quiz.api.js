import api from './api';

export const quizAPI = {
  // Upload PDF and create quiz
  uploadPDF: async (formData) => {
    const response = await api.post('/quiz/upload-pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Get list of available quizzes
  listQuizzes: async () => {
    const response = await api.get('/quiz/list');
    return response.data;
  },

  // Get a specific quiz
  getQuiz: async (quizId) => {
    const response = await api.get(`/quiz/${quizId}`);
    return response.data;
  },

  // Submit quiz answers
  submitQuiz: async (quizId, answers) => {
    const response = await api.post(`/quiz/${quizId}/submit`, { answers });
    return response.data;
  },

  // Get quiz history
  getHistory: async () => {
    const response = await api.get('/quiz/results/history');
    return response.data;
  },

  getQuizResults: async (quizId) => {
    const response = await api.get(`/quiz/${quizId}/results`);
    return response.data;
  },

  getAvailableQuizzes: async () => {
    const response = await api.get('/quiz/available');
    return response.data;
  },
};