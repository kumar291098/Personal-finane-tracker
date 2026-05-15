import React, { useCallback, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { transactionService } from '../../services/transactionService';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';
import StatsCard from '../shared/StatsCard';
import './Transactions.css';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filters, setFilters] = useState({
    type: 'ALL',
    category: 'ALL',
    dateRange: 'ALL',
    search: ''
  });
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await transactionService.getUserTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...transactions];

    // Filter by type
    if (filters.type !== 'ALL') {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    // Filter by category
    if (filters.category !== 'ALL') {
      filtered = filtered.filter(t => t.category === filters.category);
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchLower) ||
        t.category.toLowerCase().includes(searchLower)
      );
    }

    // Filter by date range
    if (filters.dateRange !== 'ALL') {
      const now = new Date();
      const startDate = new Date();
      
      switch (filters.dateRange) {
        case 'TODAY':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'WEEK':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'MONTH':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'YEAR':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          break;
      }
      
      if (filters.dateRange !== 'ALL') {
        filtered = filtered.filter(t => new Date(t.transactionDate) >= startDate);
      }
    }

    // Sort transactions
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        case 'description':
          aValue = a.description;
          bValue = b.description;
          break;
        default: // date
          aValue = new Date(a.transactionDate);
          bValue = new Date(b.transactionDate);
          break;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredTransactions(filtered);
  }, [filters, sortBy, sortOrder, transactions]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleTransactionSuccess = () => {
    fetchTransactions();
    setShowForm(false);
    setEditingTransaction(null);
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleDelete = async (transactionId) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await transactionService.deleteTransaction(transactionId);
        fetchTransactions();
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };

  const getStats = () => {
    const income = filteredTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = filteredTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      income,
      expenses,
      balance: income - expenses,
      count: filteredTransactions.length
    };
  };

  const getUniqueCategories = () => {
    const categories = [...new Set(transactions.map(t => t.category))];
    return categories.sort();
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="transactions-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="transactions-page">
      {/* Header */}
      <div className="transactions-header">
        <div className="header-content">
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">
            Manage and track all your financial transactions
          </p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          <span>➕</span>
          Add Transaction
        </button>
      </div>

      {/* Stats Cards */}
      <div className="transactions-stats">
        <StatsCard
          title="Filtered Income"
          value={stats.income}
          icon="📈"
          type="success"
          trend="up"
          subtitle="From filtered results"
        />
        <StatsCard
          title="Filtered Expenses"
          value={stats.expenses}
          icon="📉"
          type="error"
          trend="down"
          subtitle="From filtered results"
        />
        <StatsCard
          title="Net Amount"
          value={stats.balance}
          icon="💰"
          type={stats.balance >= 0 ? 'success' : 'error'}
          trend={stats.balance >= 0 ? 'up' : 'down'}
          subtitle="Income - Expenses"
        />
        <StatsCard
          title="Transactions"
          value={stats.count}
          icon="📊"
          type="primary"
          subtitle="Matching filters"
          isCount={true}
        />
      </div>

      {/* Filters and Search */}
      <div className="transactions-controls">
        <div className="search-section">
          <div className="search-box">
            <span className="search-icon" aria-hidden="true"><Search size={18} /></span>
            <input
              type="text"
              placeholder="Search transactions..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="filters-section">
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="filter-select"
          >
            <option value="ALL">All Types</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="filter-select"
          >
            <option value="ALL">All Categories</option>
            {getUniqueCategories().map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="filter-select"
          >
            <option value="ALL">All Time</option>
            <option value="TODAY">Today</option>
            <option value="WEEK">Last 7 Days</option>
            <option value="MONTH">Last Month</option>
            <option value="YEAR">Last Year</option>
          </select>

          <button
            className="btn btn-secondary"
            onClick={() => setFilters({
              type: 'ALL',
              category: 'ALL',
              dateRange: 'ALL',
              search: ''
            })}
          >
            Clear Filters
          </button>
        </div>

        <div className="sort-section">
          <label className="sort-label">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="date">Date</option>
            <option value="amount">Amount</option>
            <option value="category">Category</option>
            <option value="description">Description</option>
          </select>
          <button
            className="sort-order-btn"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Transaction List */}
      <div className="transactions-content">
        {filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No transactions found</h3>
            <p>
              {transactions.length === 0 
                ? "You haven't added any transactions yet."
                : "No transactions match your current filters."
              }
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              Add Your First Transaction
            </button>
          </div>
        ) : (
          <TransactionList
            transactions={filteredTransactions}
            onEdit={handleEdit}
            onDelete={handleDelete}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
        )}
      </div>

      {/* Transaction Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => {
          setShowForm(false);
          setEditingTransaction(null);
        }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}</h3>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowForm(false);
                  setEditingTransaction(null);
                }}
              >
                ✕
              </button>
            </div>
            <TransactionForm 
              transaction={editingTransaction}
              onSuccess={handleTransactionSuccess}
              onCancel={() => {
                setShowForm(false);
                setEditingTransaction(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
