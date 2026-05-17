import { API_BASE_URL } from '../config/api';

const headers = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`
});

const readResponse = async (response, fallback) => {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || fallback);
  }

  return response.json();
};

export const fetchProfile = async (token) => {
  const response = await fetch(`${API_BASE_URL}/profile`, {
    headers: headers(token)
  });

  return readResponse(response, 'Unable to load profile.');
};

export const updateProfile = async (token, profile) => {
  const response = await fetch(`${API_BASE_URL}/profile`, {
    method: 'PATCH',
    headers: headers(token),
    body: JSON.stringify(profile)
  });

  return readResponse(response, 'Unable to update profile.');
};

export const requestProfileUpdateOtp = async (token, profile) => {
  const response = await fetch(`${API_BASE_URL}/profile/request-update-otp`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify(profile)
  });

  return readResponse(response, 'Unable to send profile OTP.');
};

export const verifyProfileUpdateOtp = async (token, otp) => {
  const response = await fetch(`${API_BASE_URL}/profile/verify-update-otp`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({ otp })
  });

  return readResponse(response, 'Unable to verify profile OTP.');
};
