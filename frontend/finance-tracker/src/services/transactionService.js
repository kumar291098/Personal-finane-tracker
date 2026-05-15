import { getISTDateString } from '../utils/transactionUtils';

import { API_BASE_URL } from '../config/api';

// Utility function to get auth data
const getAuthData = () => {
  const userStr = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  
  if (!userStr || !token) {
    throw new Error('No authentication data found');
  }
  
  const user = JSON.parse(userStr);
  return { user, token };
};

// Utility function to get auth headers
const getAuthHeaders = () => {
  const { token } = getAuthData();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const transactionService = {
  // Fetch all transactions for the logged-in user
  getUserTransactions: async () => {
    try {
      const { user, token } = getAuthData();
      const response = await fetch(`${API_BASE_URL}/transactions/user/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch transactions: ${response.status} - ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },
  
  // Create a new transaction
  createTransaction: async (transaction) => {
    try {
      const { user, token } = getAuthData();
      
      const payload = {
        description: transaction.description,
        type: transaction.type,
        amount: parseFloat(transaction.amount),
        category: transaction.category || 'General',
        categoryId: transaction.categoryId || (transaction.type === 'INCOME' ? 1 : 2),
        transactionDate: transaction.transactionDate || getISTDateString(),
        userId: user.id
      };
      
      console.log('Creating transaction with payload:', payload);
      console.log('Using token:', token ? 'Token present' : 'No token');
      console.log('User info:', user);

      const response = await fetch(`${API_BASE_URL}/transactions/add`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to create transaction: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Transaction created successfully:', result);
      return result;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  },
  
  // Update an existing transaction
  updateTransaction: async (id, transaction) => {
    try {
      const { user } = getAuthData();
      
      const payload = {
        description: transaction.description,
        type: transaction.type,
        amount: parseFloat(transaction.amount),
        category: transaction.category || 'General',
        categoryId: transaction.categoryId || (transaction.type === 'INCOME' ? 1 : 2),
        transactionDate: transaction.transactionDate,
        userId: user.id
      };
      
      const response = await fetch(`${API_BASE_URL}/transactions/update/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update transaction: ${response.status} - ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  },
  
  // Delete a transaction
  deleteTransaction: async (id) => {
    try {
      const { user } = getAuthData();
      
      const response = await fetch(`${API_BASE_URL}/transactions/delete/${id}?userId=${user.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete transaction: ${response.status} - ${errorText}`);
      }
      
      return await response.text();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  },
  
  // Get transaction by ID
  getTransactionById: async (id) => {
    try {
      const { user } = getAuthData();
      
      const response = await fetch(`${API_BASE_URL}/transactions/${id}?userId=${user.id}`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch transaction: ${response.status} - ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw error;
    }
  },
  
  // Get transactions by date range
  getTransactionsByDateRange: async (startDate, endDate) => {
    try {
      const { user, token } = getAuthData();
      
      const response = await fetch(
        `${API_BASE_URL}/transactions/user/${user.id}/date-range?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch transactions by date range: ${response.status} - ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching transactions by date range:', error);
      throw error;
    }
  },
  
  // Get transaction statistics
  getTransactionStats: async () => {
    try {
      const { user, token } = getAuthData();
      
      const response = await fetch(`${API_BASE_URL}/transactions/user/${user.id}/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch transaction stats: ${response.status} - ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching transaction stats:', error);
      throw error;
    }
  }
};

// Backward compatibility methods (optional)
export const createTransactionService = {
  getUserTransactions: (userId, token) => transactionService.getUserTransactions(),
  createTransaction: (transaction, token) => transactionService.createTransaction(transaction),
  updateTransaction: (id, transaction, token) => transactionService.updateTransaction(id, transaction),
  deleteTransaction: (id, token, userId) => transactionService.deleteTransaction(id)
};
