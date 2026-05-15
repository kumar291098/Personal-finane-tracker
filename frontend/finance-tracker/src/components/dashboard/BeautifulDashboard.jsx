import React, { useState, useEffect } from 'react';
import { transactionService } from '../../services/transactionService';
import './BeautifulDashboard.css';

const BeautifulDashboard = ({ token, username, userId }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    loadTransactions();
  }, [token, userId]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await transactionService.getUserTransactions(userId, token);
      setTransactions(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
      setError('Failed to load transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (transactionId) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await transactionService.deleteTransaction(transactionId, token, userId);
        loadTransactions();
      } catch (error) {
        console.error('Error deleting transaction:', error);
        setError('Failed to delete transaction. Please try again.');
      }
    }
  };

  const getFilteredTransactions = () => {
    let filtered = [...transactions];

    if (filter !== 'all') {
      filtered = filtered.filter(t => t.type === filter);
    }

    if (dateRange !== 'all') {
      const now = new Date();
      const rangeDate = new Date();
      
      switch (dateRange) {
        case 'week':
          rangeDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          rangeDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          rangeDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          return filtered;
      }

      filtered = filtered.filter(t => 
        new Date(t.transactionDate) >= rangeDate
      );
    }

    return filtered.sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));
  };

  const filteredTransactions = getFilteredTransactions();

  const calculateMetrics = () => {
    const income = filteredTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const expenses = filteredTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const balance = income - expenses;

    const categoryTotals = filteredTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((acc, t) => {
        const category = t.category || 'Other';
        acc[category] = (acc[category] || 0) + t.amount;
        return acc;
      }, {});

    return { income, expenses, balance, categoryTotals };
  };

  const { income, expenses, balance, categoryTotals } = calculateMetrics();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your financial dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <div className="error-message">
          <h3>Oops! Something went wrong</h3>
          <p>{error}</p>
          <button onClick={loadTransactions} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="beautiful-dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Financial Dashboard</h1>
          <p className="welcome-text">Welcome back, <span className="username">{username}</span>!</p>
          <p className="subtitle">Track your income and expenses in one place</p>
        </div>
        
        <div className="quick-stats">
          <div className="stat-item">
            <span className="stat-label">Total Transactions</span>
            <span className="stat-value">{filteredTransactions.length}</span>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Filter by type:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Transactions</option>
            <option value="INCOME">Income Only</option>
            <option value="EXPENSE">Expenses Only</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Time period:</label>
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="all">All Time</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      <div className="summary-cards">
        <div className="summary-card income-card">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h3>Total Income</h3>
            <p className="amount">{formatCurrency(income)}</p>
            <span className="trend positive">↗</span>
          </div>
        </div>

        <div className="summary-card expense-card">
          <div className="card-icon">💸</div>
          <div className="card-content">
            <h3>Total Expenses</h3>
            <p className="amount">{formatCurrency(expenses)}</p>
            <span className="trend negative">↘</span>
          </div>
        </div>

        <div className="summary-card balance-card">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <h3>Net Balance</h3>
            <p className={`amount ${balance >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(balance)}
            </p>
            <span className={`trend ${balance >= 0 ? 'positive' : 'negative'}`}>
              {balance >= 0 ? '↗' : '↘'}
            </span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="transactions-section">
          <div className="section-header">
            <h2>Recent Transactions</h2>
            <button 
              className="refresh-btn"
              onClick={loadTransactions}
              title="Refresh transactions"
            >
              🔄
            </button>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📈</div>
              <h3>No transactions found</h3>
              <p>Start by adding your first transaction to see your financial overview</p>
            </div>
          ) : (
            <div className="transactions-table-container">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.slice(0, 10).map(transaction => (
                    <tr key={transaction.id} className={`transaction-row ${transaction.type.toLowerCase()}`}>
                      <td className="description">
                        <span className="desc-text">{transaction.description}</span>
                      </td>
                      <td className="category">
                        <span className="category-badge">{transaction.category || 'Other'}</span>
                      </td>
                      <td className="type">
                        <span className={`type-badge ${transaction.type.toLowerCase()}`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className={`amount ${transaction.type.toLowerCase()}`}>
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="date">{formatDate(transaction.transactionDate)}</td>
                      <td className="actions">
                        <button 
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(transaction.id)}
                          title="Delete transaction"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredTransactions.length > 10 && (
                <div className="view-more">
                  <p>Showing 10 of {filteredTransactions.length} transactions</p>
                </div>
              )}
            </div>
          )}
        </div>

        {Object.keys(categoryTotals).length > 0 && (
          <div className="insights-section">
            <h3>Expense Breakdown</h3>
            <div className="category-list">
              {Object.entries(categoryTotals)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount]) => (
                  <div key={category} className="category-item">
                    <span className="category-name">{category}</span>
                    <span className="category-amount">{formatCurrency(amount)}</span>
                    <div className="category-bar">
                      <div 
                        className="category-fill"
                        style={{ 
                          width: `${(amount / Math.max(...Object.values(categoryTotals))) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BeautifulDashboard;
