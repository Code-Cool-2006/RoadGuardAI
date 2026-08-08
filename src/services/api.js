export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://roadguardai-vhjx.onrender.com';

// Generic fetch wrapper with automatic JWT injection
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('roadguard_jwt_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorJson;
    try {
      errorJson = JSON.parse(errorText);
    } catch {
      errorJson = { error: errorText || `HTTP ${response.status} error` };
    }
    throw new Error(errorJson.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth
  login: async (email, password) => {
    const data = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      localStorage.setItem('roadguard_jwt_token', data.token);
    }
    return data;
  },

  logout: () => {
    localStorage.removeItem('roadguard_jwt_token');
  },

  // Users & RBAC Accounts
  getUsers: () => request('/api/users'),
  createAccount: (payload) =>
    request('/api/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Work Orders
  getWorkOrders: () => request('/api/work-orders'),
  createWorkOrder: (payload) =>
    request('/api/work-orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateWorkOrderStatus: (id, status) =>
    request(`/api/work-orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Complaints
  getComplaints: () => request('/api/complaints'),
  getComplaintById: (id) => request(`/api/complaints/${id}`),
  submitComplaint: (payload) =>
    request('/api/complaints', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Conflicts & PostGIS Algorithms
  getConflicts: () => request('/api/conflicts'),
  getConflictRecommendation: (id) => request(`/api/conflicts/${id}/recommendation`),

  // Notices
  getNotices: () => request('/api/notices'),
  publishNotice: (payload) =>
    request('/api/notices', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Health
  checkHealth: () => request('/health'),
};
