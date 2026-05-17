import { API_BASE_URL } from '../config/api';

const authHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`
});

export const fetchSubscriptionPlan = async (token) => {
  const response = await fetch(`${API_BASE_URL}/subscription/plan`, {
    headers: authHeaders(token)
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Unable to load subscription plan.');
  }

  return response.json();
};

export const createSubscriptionOrder = async (token) => {
  const response = await fetch(`${API_BASE_URL}/subscription/orders`, {
    method: 'POST',
    headers: authHeaders(token)
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Unable to start payment.');
  }

  return response.json();
};

export const verifySubscriptionPayment = async (token, paymentResponse) => {
  const response = await fetch(`${API_BASE_URL}/subscription/verify`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(paymentResponse)
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Unable to verify payment.');
  }

  return response.json();
};

export const submitManualUpiPayment = async (token, reference) => {
  const response = await fetch(`${API_BASE_URL}/subscription/manual-requests`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ reference })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Unable to submit payment reference.');
  }

  return response.json();
};

export const fetchDemoSubscriptionReference = async () => {
  const apiRoot = API_BASE_URL.replace(/\/api$/, '');
  const response = await fetch(`${apiRoot}/api/public/subscription/demo-reference`);

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Unable to generate demo reference.');
  }

  return response.json();
};
