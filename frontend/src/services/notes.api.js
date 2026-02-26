import api from './api';

export const notesAPI = {
  uploadDocument: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/notes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getNotes: async () => {
    const response = await api.get('/notes');
    return response.data;
  },

  getNoteSummary: async (noteId) => {
    const response = await api.get(`/notes/${noteId}/summary`);
    return response.data;
  },

  downloadNote: async (noteId) => {
    const response = await api.get(`/notes/${noteId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
};