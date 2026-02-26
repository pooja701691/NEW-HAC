import api from './api';

export const leaderboardAPI = {
  getLeaderboard: async () => {
    const response = await api.get('/leaderboard');
    return response.data;
  },

  getUserRank: async () => {
    const response = await api.get('/leaderboard/rank');
    return response.data;
  },

  getLeaderboardHistory: async () => {
    const response = await api.get('/leaderboard/history');
    return response.data;
  },
};