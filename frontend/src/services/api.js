const BASE_URL = '/api';

async function request(endpoint, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `HTTP Error ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
  // Projects
  getProjects: () => request('/projects'),
  createProject: (data) => request('/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id, data) => request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),
  pingProject: (id) => request(`/projects/${id}/ping`, { method: 'POST' }),

  // Vault
  getVault: (projectId) => request(`/vault${projectId ? `?projectId=${projectId}` : ''}`),
  createCredential: (data) => request('/vault', { method: 'POST', body: JSON.stringify(data) }),
  updateCredential: (id, data) => request(`/vault/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCredential: (id) => request(`/vault/${id}`, { method: 'DELETE' }),

  // Media
  getMedia: (projectId, type) => {
    const params = new URLSearchParams();
    if (projectId) params.append('projectId', projectId);
    if (type) params.append('type', type);
    return request(`/media?${params.toString()}`);
  },
  uploadMedia: async (formData) => {
    const res = await fetch(`${BASE_URL}/media`, {
      method: 'POST',
      body: formData // multipart
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Ошибка загрузки файла');
    return data;
  },
  deleteMedia: (id) => request(`/media/${id}`, { method: 'DELETE' }),

  // Tickets
  getTickets: (projectId, status) => {
    const params = new URLSearchParams();
    if (projectId) params.append('projectId', projectId);
    if (status) params.append('status', status);
    return request(`/tickets?${params.toString()}`);
  },
  createTicket: (data) => request('/tickets', { method: 'POST', body: JSON.stringify(data) }),
  updateTicketStatus: (id, status) => request(`/tickets/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  deleteTicket: (id) => request(`/tickets/${id}`, { method: 'DELETE' }),

  // One-Time Secrets
  createSecret: (data) => request('/secrets', { method: 'POST', body: JSON.stringify(data) }),
  getSecret: (id) => request(`/secrets/${id}`),

  // Settings & Wallpapers
  getSettings: () => request('/settings'),
  updateSettings: (data) => request('/settings', { method: 'PUT', body: JSON.stringify(data) }),
  setMasterPin: (pin, currentPin) => request('/settings/pin', { method: 'POST', body: JSON.stringify({ pin, currentPin }) }),
  verifyMasterPin: (pin) => request('/settings/pin/verify', { method: 'POST', body: JSON.stringify({ pin }) }),
  uploadWallpaper: async (formData) => {
    const res = await fetch(`${BASE_URL}/settings/wallpaper`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Ошибка загрузки обоев');
    return data;
  },

  // Integrations & Snippets
  getIntegrationGuides: (projectId) => request(`/integration/guides${projectId ? `?projectId=${projectId}` : ''}`)
};
