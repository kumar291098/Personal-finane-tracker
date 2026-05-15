import React, { useState, useEffect } from 'react';
import './Transactions.css';
import { transactionService } from '../../services/transactionService';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';

const Transactions = ({ token, userId }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchTransactions();
    }
  }, [token, userId]);

  const fetchTransactions = async () => {
    try {
      const data = await transactionService.getUserTransactions(userId, token);
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await transactionService.deleteTransaction(id, token, userId);
      setTransactions(transactions.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingTransaction(null);
    setShowForm(true);
  };

  const handleFormSubmit = async (transaction) => {
    try {
      let savedTransaction;
      if (editingTransaction) {
        const transactionToSend = {
          ...transaction,
          userId: userId,  // Ensure userId is included for updates too
          amount: typeof transaction.amount === 'string' 
            ? parseFloat(transaction.amount) 
            : transaction.amount
        };
        savedTransaction = await transactionService.updateTransaction(
          transaction.id, 
          transactionToSend, 
          token
        );
        setTransactions(transactions.map(t => 
          t.id === savedTransaction.id ? savedTransaction : t
        ));
      } else {
        const transactionToSend = {
          ...transaction,
          userId: userId,  // Ensure userId is always included
          amount: typeof transaction.amount === 'string' 
            ? parseFloat(transaction.amount) 
            : transaction.amount
        };
        console.log('Sending transaction:', transactionToSend); // Debug log
        savedTransaction = await transactionService.createTransaction(transactionToSend, token);
        setTransactions([...transactions, savedTransaction]);
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Error: ' + error.message); // Better error handling
    }
    setShowForm(false);
  };

  return (
    <div className="transactions">
      <div className="transactions-header">
        <h1>Transactions</h1>
        <button className="add-button" onClick={handleAddNew}>Add Transaction</button>
      </div>

      {showForm && (
        <TransactionForm 
          transaction={editingTransaction} 
          onCancel={() => setShowForm(false)} 
          onSubmit={handleFormSubmit}
        />
      )}

      {loading ? (
        <p>Loading transactions...</p>
      ) : (
        <TransactionList 
          transactions={transactions}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default Transactions;