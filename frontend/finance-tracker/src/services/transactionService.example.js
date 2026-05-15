// Example usage of the updated transactionService
// This file shows how to use the new service without passing userId and token

import { transactionService } from './transactionService';

// Example 1: Get all transactions for logged-in user
async function getAllTransactions() {
  try {
    const transactions = await transactionService.getUserTransactions();
    console.log('User transactions:', transactions);
    return transactions;
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Example 2: Create a new transaction
async function createNewTransaction() {
  try {
    const newTransaction = {
      description: 'Grocery shopping',
      type: 'EXPENSE',
      amount: 150.50,
      category: 'Food',
      transactionDate: '2024-01-15'
    };
    
    const created = await transactionService.createTransaction(newTransaction);
    console.log('Created transaction:', created);
    return created;
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Example 3: Update a transaction
async function updateTransaction(id) {
  try {
    const updatedData = {
      description: 'Updated grocery shopping',
      type: 'EXPENSE',
      amount: 160.75,
      category: 'Food',
      transactionDate: '2024-01-15'
    };
    
    const updated = await transactionService.updateTransaction(id, updatedData);
    console.log('Updated transaction:', updated);
    return updated;
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Example 4: Delete a transaction
async function deleteTransaction(id) {
  try {
    const result = await transactionService.deleteTransaction(id);
    console.log('Deleted transaction:', result);
    return result;
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Example 5: Get transaction statistics
async function getStats() {
  try {
    const stats = await transactionService.getTransactionStats();
    console.log('Transaction stats:', stats);
    return stats;
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Example 6: Get transactions by date range
async function getTransactionsByDateRange() {
  try {
    const transactions = await transactionService.getTransactionsByDateRange(
      '2024-01-01',
      '2024-01-31'
    );
    console.log('January transactions:', transactions);
    return transactions;
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Export examples for use in components
export const transactionExamples = {
  getAllTransactions,
  createNewTransaction,
  updateTransaction,
  deleteTransaction,
  getStats,
  getTransactionsByDateRange
};
