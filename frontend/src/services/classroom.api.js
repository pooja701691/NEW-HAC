import api from './api';

export const classroomAPI = {
  list: async () => {
    const res = await api.get('/classrooms');
    return res.data;
  },

  create: async (payload) => {
    const res = await api.post('/classrooms', payload);
    return res.data;
  },

  update: async (id, payload) => {
    const res = await api.put(`/classrooms/${id}`, payload);
    return res.data;
  },

  remove: async (id) => {
    const res = await api.delete(`/classrooms/${id}`);
    return res.data;
  },

  get: async (id) => {
    const res = await api.get(`/classrooms/${id}`);
    return res.data;
  }
};
