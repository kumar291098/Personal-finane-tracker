import { API_BASE_URL } from '../config/api';

const authHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`
});

export const fetchUsersForAccess = async (token) => {
  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    headers: authHeaders(token)
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Unable to load users.');
  }

  return response.json();
};

export const updateUserAccess = async (token, userId, accessLevel) => {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/access`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ accessLevel })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Unable to update access.');
  }

  return response.json();
};

export const fetchAccessPolicies = async (token) => {
  const response = await fetch(`${API_BASE_URL}/admin/access-policies`, {
    headers: authHeaders(token)
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Unable to load page access.');
  }

  return response.json();
};

export const updateAccessPolicy = async (token, accessLevel, allowedPages) => {
  const response = await fetch(`${API_BASE_URL}/admin/access-policies/${accessLevel}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ allowedPages })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Unable to update page access.');
  }

  return response.json();
};
