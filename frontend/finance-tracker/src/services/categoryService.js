import { API_BASE_URL } from '../config/api';

const getAuthData = () => {
  const userStr = localStorage.getItem('user');
  const token = localStorage.getItem('token');

  if (!userStr || !token) {
    throw new Error('No authentication data found');
  }

  return { user: JSON.parse(userStr), token };
};

const getAuthHeaders = () => {
  const { token } = getAuthData();
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

const parseError = async (response, fallback) => {
  const errorText = await response.text();
  return new Error(`${fallback}: ${response.status}${errorText ? ` - ${errorText}` : ''}`);
};

export const categoryService = {
  getCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw await parseError(response, 'Failed to fetch categories');
    }

    return response.json();
  },

  createCategory: async (category) => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(category)
    });

    if (!response.ok) {
      throw await parseError(response, 'Failed to create category');
    }

    return response.json();
  },

  updateCategory: async (id, category) => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(category)
    });

    if (!response.ok) {
      throw await parseError(response, 'Failed to update category');
    }

    return response.json();
  },

  deleteCategory: async (id) => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw await parseError(response, 'Failed to delete category');
    }

    return response.text();
  }
};
