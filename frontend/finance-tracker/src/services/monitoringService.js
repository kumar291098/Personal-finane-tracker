import { API_BASE_URL } from '../config/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Please log in again to view monitoring data.');
  }

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

const fetchJson = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.protected ? getAuthHeaders() : {}),
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  return response.json();
};

export const monitoringService = {
  getHealth: () => fetchJson('/actuator/health'),
  getMetric: (name, tags = []) => {
    const query = tags.length ? `?${tags.map(tag => `tag=${encodeURIComponent(tag)}`).join('&')}` : '';
    return fetchJson(`/actuator/metrics/${name}${query}`, { protected: true });
  }
};
