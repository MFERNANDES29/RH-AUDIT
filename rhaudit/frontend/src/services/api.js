import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('rh_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('rh_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  me:    ()     => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
}

export const usersAPI = {
  list:   ()       => api.get('/users'),
  create: (data)   => api.post('/users', data),
  update: (id, d)  => api.put(`/users/${id}`, d),
  remove: (id)     => api.delete(`/users/${id}`),
}

export const colaboradoresAPI = {
  list:   (params) => api.get('/colaboradores', { params }),
  get:    (id)     => api.get(`/colaboradores/${id}`),
  update: (id, d)  => api.put(`/colaboradores/${id}`, d),
}

export const importacaoAPI = {
  upload:    (formData) => api.post('/importacao/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  historico: (comp_id)  => api.get('/importacao/historico', { params: { competencia_id: comp_id } }),
}

export const inconsistenciasAPI = {
  list:   (params) => api.get('/inconsistencias', { params }),
  tratar: (id, d)  => api.put(`/inconsistencias/${id}`, d),
}

export const lancamentosAPI = {
  list:    (comp_id) => api.get('/lancamentos', { params: { competencia_id: comp_id } }),
  criar:   (data)    => api.post('/lancamentos', data),
  aprovar: (id)      => api.put(`/lancamentos/${id}/aprovar`),
  cancelar:(id)      => api.put(`/lancamentos/${id}/cancelar`),
}

export const consolidacaoAPI = {
  gerar:      (comp_id)        => api.post(`/consolidacao/${comp_id}/gerar`),
  aprovarN1:  (comp_id, obs)   => api.post(`/consolidacao/${comp_id}/aprovar-n1`, null, { params: { obs } }),
  aprovarN2:  (comp_id, obs)   => api.post(`/consolidacao/${comp_id}/aprovar-n2`, null, { params: { obs } }),
  exportarXlsx:(comp_id)       => api.get(`/consolidacao/${comp_id}/exportar-xlsx`, { responseType: 'blob' }),
  exportarPdf: (comp_id)       => api.get(`/consolidacao/${comp_id}/exportar-pdf`,  { responseType: 'blob' }),
}

export default api
