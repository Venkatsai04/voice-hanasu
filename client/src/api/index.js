import { apiFetch } from './apiClient.js';

export const authApi = {
  login: (credentials) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (payload) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  getCurrentUser: () => apiFetch('/auth/me'),
  logout: (refreshToken) => apiFetch('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken }) })
};

export const agentsApi = {
  list: () => apiFetch('/agents'),
  get: (id) => apiFetch(`/agents/${id}`),
  generateConfig: (prompt) => apiFetch('/agents/generate-config', { method: 'POST', body: JSON.stringify({ prompt }) }),
  create: (agentData) => apiFetch('/agents', { method: 'POST', body: JSON.stringify(agentData) }),
  update: (id, agentData) => apiFetch(`/agents/${id}`, { method: 'PUT', body: JSON.stringify(agentData) }),
  delete: (id) => apiFetch(`/agents/${id}`, { method: 'DELETE' }),
  testCall: (id, payload) => apiFetch(`/agents/${id}/test-call`, { method: 'POST', body: JSON.stringify(payload) }),
  converse: (id, payload) => apiFetch(`/agents/${id}/converse`, { method: 'POST', body: JSON.stringify(payload) })
};


export const campaignsApi = {
  list: () => apiFetch('/campaigns'),
  get: (id) => apiFetch(`/campaigns/${id}`),
  create: (data) => apiFetch('/campaigns', { method: 'POST', body: JSON.stringify(data) }),
  launch: (id) => apiFetch(`/campaigns/${id}/launch`, { method: 'POST' }),
  pause: (id) => apiFetch(`/campaigns/${id}/pause`, { method: 'POST' }),
  resume: (id) => apiFetch(`/campaigns/${id}/resume`, { method: 'POST' }),
  stop: (id) => apiFetch(`/campaigns/${id}/stop`, { method: 'POST' })
};

export const leadsApi = {
  list: (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== '' && v !== 'all' && v !== 'undefined')
    );
    const query = new URLSearchParams(cleanParams).toString();
    return apiFetch(`/leads${query ? `?${query}` : ''}`);
  },
  get: (id) => apiFetch(`/leads/${id}`),
  create: (data) => apiFetch('/leads', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/leads/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`/leads/${id}`, { method: 'DELETE' }),
  previewCsv: (payload) => apiFetch('/leads/preview-csv', { method: 'POST', body: JSON.stringify(payload) }),
  bulkImport: (payload) => apiFetch('/leads/bulk-import', { method: 'POST', body: JSON.stringify(payload) })
};

export const callsApi = {
  list: (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== '' && v !== 'all' && v !== 'undefined')
    );
    const query = new URLSearchParams(cleanParams).toString();
    return apiFetch(`/calls${query ? `?${query}` : ''}`);
  },
  get: (id) => apiFetch(`/calls/${id}`),
  dial: (payload) => apiFetch('/calls/dial', { method: 'POST', body: JSON.stringify(payload) }),
  redial: (id, payload = {}) => apiFetch(`/calls/${id}/redial`, { method: 'POST', body: JSON.stringify(payload) })
};

export const analyticsApi = {
  getDashboard: (range = '30d') => apiFetch(`/analytics/dashboard?range=${range}`)
};

export const integrationsApi = {
  getSettings: () => apiFetch('/integrations'),
  updateSettings: (data) => apiFetch('/integrations', { method: 'PUT', body: JSON.stringify(data) }),
  testConnection: (provider) => apiFetch('/integrations/test-connection', { method: 'POST', body: JSON.stringify({ provider }) })
};
