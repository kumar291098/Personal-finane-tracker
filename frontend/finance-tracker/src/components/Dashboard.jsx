import React, { useState } from 'react';
import { DollarSign, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { transactionService } from '../services/transactionService';
import TransactionForm from './TransactionForm';
import StatsCard from './StatsCard';
import TransactionList from './TransactionList';
import { useTransactions } from '../hooks/useTransactions';
import { useMessage } from '../hooks/useMessage';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user, token, logout } = useAuth();
  console.log('User:', user);
  console.log('Token:', token);
  const { transactions, setTransactions, loading, error, fetchTransactions } = useTransactions(user, token);
  const { success, error: messageError, showMessage } = useMessage();
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  
  useEffect(() => {
    console.log('User:', user);
    console.log('Token:', token);
    fetchTransactions();
  }, []);

  const handleAddTransaction = async (transactionData) => {
    console.log("User ID:", user?.id, "Token:", token); // Debug log
    try {
      const newTransaction = await transactionService.createTransaction(
        { ...transactionData, userId: user.id },
        token
      );
      setTransactions(prev => [...prev, newTransaction]);
      showMessage('Transaction added successfully!');
    } catch (err) {
      showMessage('Failed to add transaction. Please try again.', 'error');
      console.error('Add error:', err);
    }
  };

  const handleEditTransaction = async (transactionData) => {
    try {
      const updatedTransaction = await transactionService.updateTransaction(
        editingTransaction.id,
        { ...transactionData, userId: user.id },
        token
      );
      setTransactions(prev => 
        prev.map(t => t.id === editingTransaction.id ? updatedTransaction : t)
      );
      setEditingTransaction(null);
      showMessage('Transaction updated successfully!');
    } catch (err) {
      showMessage('Failed to update transaction. Please try again.', 'error');
      console.error('Update error:', err);
    }
  };

  const handleDeleteTransaction = async (id) => {
    const transaction = transactions.find(t => t.id === id);
    const confirmMessage = `Are you sure you want to delete "${transaction?.description}"?`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      await transactionService.deleteTransaction(id, token, user.id);
      setTransactions(prev => prev.filter(t => t.id !== id));
      showMessage('Transaction deleted successfully!');
    } catch (err) {
      showMessage('Failed to delete transaction. Please try again.', 'error');
      console.error('Delete error:', err);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo-container">
            <DollarSign size={28} color="#4f46e5" />
            <h1 className="dashboard-title">Finance Tracker</h1>
          </div>
          <div className="user-section">
            <span className="welcome-text">Welcome, {user.username}!</span>
            <button onClick={logout} className="logout-button">
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {(error || messageError) && <div className="error">{error || messageError}</div>}
        {success && <div className="success">{success}</div>}

        <StatsCard transactions={transactions} />

        <TransactionForm
          onSubmit={editingTransaction ? handleEditTransaction : handleAddTransaction}
          editingTransaction={editingTransaction}
          onCancel={() => setEditingTransaction(null)}
        />

        <TransactionList
          transactions={transactions}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterType={filterType}
          setFilterType={setFilterType}
          onEdit={setEditingTransaction}
          onDelete={handleDeleteTransaction}
        />
      </div>
    </div>
  );
};

export default Dashboard;