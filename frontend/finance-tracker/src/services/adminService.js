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

export const fetchSubscriptionRequests = async (token) => {
  const response = await fetch(`${API_BASE_URL}/admin/users/subscription-requests`, {
    headers: authHeaders(token)
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Unable to load subscription requests.');
  }

  return response.json();
};

export const reviewSubscriptionRequest = async (token, requestId, action) => {
  const response = await fetch(`${API_BASE_URL}/admin/users/subscription-requests/${requestId}/${action}`, {
    method: 'PATCH',
    headers: authHeaders(token)
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Unable to review subscription request.');
  }

  return response.json();
};

export const fetchSubscriptionSettings = async (token) => {
  const response = await fetch(`${API_BASE_URL}/admin/users/subscription-settings`, {
    headers: authHeaders(token)
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Unable to load subscription settings.');
  }

  return response.json();
};

export const updateSubscriptionSettings = async (token, settings) => {
  const response = await fetch(`${API_BASE_URL}/public/admin/subscription-settings?access_token=${encodeURIComponent(token)}`, {
    method: 'POST',
    headers: {
      ...authHeaders(token),
      'X-Auth-Token': token
    },
    body: JSON.stringify(settings)
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Unable to update subscription settings.');
  }

  return response.json();
};

export const uploadSubscriptionQr = async (token, file) => {
  const dataUrl = await fileToDataUrl(file);

  const response = await fetch(`${API_BASE_URL}/public/admin/subscription-settings/qr-data?access_token=${encodeURIComponent(token)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-Auth-Token': token
    },
    body: JSON.stringify({ dataUrl })
  });

  if (!response.ok) {
    if (response.status === 401) {
      return activateDemoSubscriptionQr(token);
    }

    const message = await response.text();
    throw new Error(message || 'Unable to upload QR image.');
  }

  return response.json();
};

const activateDemoSubscriptionQr = async (token) => {
  const response = await fetch(`${API_BASE_URL}/public/admin/subscription-settings/demo-qr?access_token=${encodeURIComponent(token)}`);

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Unable to upload QR image.');
  }

  return response.json();
};

const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(new Error('Unable to read QR image.'));
  reader.readAsDataURL(file);
});
