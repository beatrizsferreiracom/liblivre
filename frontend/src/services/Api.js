import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Autenticação ───────────────────────────────────────────────
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  verifyCode: (data) => api.post('/auth/verify-code', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// ─── Livros ──────────────────────────────────────────────
export const booksApi = {
  getAll: (params) => api.get('/livros', { params }),
  getById: (id) => api.get(`/livros/${id}`),
  create: (data) => api.post('/livros', data),
  update: (id, data) => api.put(`/livros/${id}`, data),
  delete: (id) => api.delete(`/livros/${id}`),
};

// ─── Leitores ────────────────────────────────────────────
export const readersApi = {
  getAll: (params) => api.get('/leitores', { params }),
  getById: (id) => api.get(`/leitores/${id}`),
  create: (data) => api.post('/leitores', data),
  update: (id, data) => api.put(`/leitores/${id}`, data),
  deactivate: (id) => api.patch(`/leitores/${id}/desativar`),
  activate: (id) => api.patch(`/leitores/${id}/ativar`),
};

// ─── Empréstimos ──────────────────────────────────────────────
export const loansApi = {
  getAll: (params) => api.get('/emprestimos', { params }),
  getById: (id) => api.get(`/emprestimos/${id}`),
  create: (data) => api.post('/emprestimos', data),
  registerReturn: (id, data) => api.patch(`/emprestimos/${id}/devolver`, data),
};

// ─── Autores ────────────────────────────────────────────
export const authorsApi = {
  getAll: (params) => api.get('/autores', { params }),
  create: (data) => api.post('/autores', data),
  delete: (id) => api.delete(`/autores/${id}`),
};

// ─── Categorias ─────────────────────────────────────────
export const categoriesApi = {
  getAll: (params) => api.get('/categorias', { params }),
  create: (data) => api.post('/categorias', data),
  delete: (id) => api.delete(`/categorias/${id}`),
};

// ─── Perfil ─────────────────────────────────────────────
export const profileApi = {
  get: () => api.get('/perfil'),
  update: (data) => api.put('/perfil', data),
};

export default api;