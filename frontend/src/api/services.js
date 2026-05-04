import ApiClient from './client';

export const authApi = {
  login: (data) => ApiClient.post('/auth/login', data),
  register: (data) => ApiClient.post('/auth/register', data),
  getUsers: () => ApiClient.get('/auth/users'),
};

export const academicApi = {
  // Programas
  getProgramas: () => ApiClient.get('/academic/programas'),
  getPrograma: (id) => ApiClient.get(`/academic/programas/${id}`),
  createPrograma: (data) => ApiClient.post('/academic/programas', data),
  updatePrograma: (id, data) => ApiClient.put(`/academic/programas/${id}`, data),
  deletePrograma: (id) => ApiClient.delete(`/academic/programas/${id}`),
  // Asignaturas
  getAsignaturas: (programaId) => ApiClient.get(`/academic/asignaturas${programaId ? `?programaId=${programaId}` : ''}`),
  createAsignatura: (data) => ApiClient.post('/academic/asignaturas', data),
  updateAsignatura: (id, data) => ApiClient.put(`/academic/asignaturas/${id}`, data),
  deleteAsignatura: (id) => ApiClient.delete(`/academic/asignaturas/${id}`),
  // Grupos
  getGrupos: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.asignaturaId) params.set('asignaturaId', filters.asignaturaId);
    if (filters.periodo) params.set('periodo', filters.periodo);
    const qs = params.toString();
    return ApiClient.get(`/academic/grupos${qs ? `?${qs}` : ''}`);
  },
  createGrupo: (data) => ApiClient.post('/academic/grupos', data),
  updateGrupo: (id, data) => ApiClient.put(`/academic/grupos/${id}`, data),
  deleteGrupo: (id) => ApiClient.delete(`/academic/grupos/${id}`),

  getPeriodos: () => ApiClient.get('/academic/periodos'),
};

export const teacherApi = {
  getAll: () => ApiClient.get('/teachers'),
  getById: (id) => ApiClient.get(`/teachers/${id}`),
  create: (data) => ApiClient.post('/teachers', data),
  update: (id, data) => ApiClient.put(`/teachers/${id}`, data),
  delete: (id) => ApiClient.delete(`/teachers/${id}`),
  getDisponibilidad: (id) => ApiClient.get(`/teachers/${id}/disponibilidad`),
  setDisponibilidad: (id, data) => ApiClient.put(`/teachers/${id}/disponibilidad`, data),
};

export const classroomApi = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.tipo) params.set('tipo', filters.tipo);
    if (filters.edificio) params.set('edificio', filters.edificio);
    const qs = params.toString();
    return ApiClient.get(`/classrooms${qs ? `?${qs}` : ''}`);
  },
  getById: (id) => ApiClient.get(`/classrooms/${id}`),
  create: (data) => ApiClient.post('/classrooms', data),
  update: (id, data) => ApiClient.put(`/classrooms/${id}`, data),
  delete: (id) => ApiClient.delete(`/classrooms/${id}`),
};

export const scheduleEngineApi = {
  generate: (data) => ApiClient.post('/schedule-engine/generate', data),
  getStrategies: () => ApiClient.get('/schedule-engine/strategies'),
  getDetail: (id) => ApiClient.get(`/schedule-engine/${id}`),
  publish: (id) => ApiClient.put(`/schedule-engine/${id}/publish`),
};

export const scheduleViewApi = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.estado) params.set('estado', filters.estado);
    const qs = params.toString();
    return ApiClient.get(`/schedules${qs ? `?${qs}` : ''}`);
  },
  getView: (id, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.dia) params.set('dia', filters.dia);
    if (filters.docenteId) params.set('docenteId', filters.docenteId);
    const qs = params.toString();
    return ApiClient.get(`/schedules/${id}/view${qs ? `?${qs}` : ''}`);
  },
  getDocenteView: (id, docenteId) => ApiClient.get(`/schedules/${id}/docente/${docenteId}`),
  getAulaView: (id, aulaId) => ApiClient.get(`/schedules/${id}/aula/${aulaId}`),
  getStats: (id) => ApiClient.get(`/schedules/${id}/stats`),
};
