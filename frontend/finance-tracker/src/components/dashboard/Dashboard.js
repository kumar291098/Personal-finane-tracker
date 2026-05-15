import React, { useCallback, useEffect, useState } from 'react';
import { BarChart3, CreditCard, Flag, Lightbulb, Plus, Target, Wallet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { transactionService } from '../../services/transactionService';
import StatsCard from '../shared/StatsCard';
import TransactionForm from '../transactions/TransactionForm';
import RecentTransactions from '../transactions/RecentTransactions';
import ExpenseChart from '../charts/ExpenseChart';
import IncomeExpenseChart from '../charts/IncomeExpenseChart';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    transactionCount: 0
  });

  const calculateStats = useCallback((transactionData) => {
    const income = transactionData
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactionData
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    setStats({
      totalIncome: income,
      totalExpenses: expenses,
      balance: income - expenses,
      transactionCount: transactionData.length
    });
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await transactionService.getUserTransactions();
      setTransactions(data);
      calculateStats(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [calculateStats]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleTransactionAdded = () => {
    fetchTransactions();
    setShowTransactionForm(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getRecentTransactions = () => {
    return transactions
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  };

  const getMonthlyData = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return transactions.filter(t => {
      const transactionDate = new Date(t.transactionDate);
      return transactionDate.getMonth() === currentMonth &&
             transactionDate.getFullYear() === currentYear;
    });
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your financial overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <p className="dashboard-kicker">Personal Finance</p>
          <h1 className="dashboard-title">
            {getGreeting()}, {user?.username}
          </h1>
          <p className="dashboard-subtitle">
            A clear view of your balance, cash flow, and recent activity.
          </p>
        </div>

        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={() => setShowTransactionForm(true)}
          >
            <Plus size={18} />
            Add Transaction
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <StatsCard
          title="Total Balance"
          value={stats.balance}
          type={stats.balance >= 0 ? 'success' : 'error'}
          trend={stats.balance >= 0 ? 'up' : 'down'}
          subtitle="Current balance"
        />
        <StatsCard
          title="Total Income"
          value={stats.totalIncome}
          type="success"
          trend="up"
          subtitle="This month"
        />
        <StatsCard
          title="Total Expenses"
          value={stats.totalExpenses}
          type="error"
          trend="down"
          subtitle="This month"
        />
        <StatsCard
          title="Transactions"
          value={stats.transactionCount}
          type="primary"
          subtitle="Total recorded"
          isCount={true}
        />
      </div>

      <div className="dashboard-grid">
        <div className="charts-section">
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Income vs Expenses</h3>
              <p className="chart-subtitle">Monthly comparison</p>
            </div>
            <IncomeExpenseChart transactions={getMonthlyData()} />
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Expense Categories</h3>
              <p className="chart-subtitle">Where your money goes</p>
            </div>
            <ExpenseChart transactions={transactions.filter(t => t.type === 'EXPENSE')} />
          </div>
        </div>

        <div className="recent-section">
          <div className="section-header">
            <h3 className="section-title">Recent Transactions</h3>
            <button className="view-all-btn">
              View All
            </button>
          </div>
          <RecentTransactions
            transactions={getRecentTransactions()}
            onRefresh={fetchTransactions}
          />
        </div>
      </div>

      <div className="quick-actions">
        <h3 className="section-title">Quick Actions</h3>
        <div className="actions-grid">
          <button className="action-card" onClick={() => setShowTransactionForm(true)}>
            <span className="action-icon"><CreditCard size={24} /></span>
            <span className="action-label">Add Expense</span>
          </button>
          <button className="action-card" onClick={() => setShowTransactionForm(true)}>
            <span className="action-icon"><Wallet size={24} /></span>
            <span className="action-label">Add Income</span>
          </button>
          <button className="action-card">
            <span className="action-icon"><BarChart3 size={24} /></span>
            <span className="action-label">View Reports</span>
          </button>
          <button className="action-card">
            <span className="action-icon"><Flag size={24} /></span>
            <span className="action-label">Set Goals</span>
          </button>
        </div>
      </div>

      <div className="tips-section">
        <h3 className="section-title"><Lightbulb size={20} /> Financial Tips</h3>
        <div className="tips-grid">
          <div className="tip-card">
            <span className="tip-icon"><Target size={18} /></span>
            <div className="tip-content">
              <h4>Set Monthly Budgets</h4>
              <p>Create spending limits for different categories to stay on track.</p>
            </div>
          </div>
          <div className="tip-card">
            <span className="tip-icon"><CreditCard size={18} /></span>
            <div className="tip-content">
              <h4>Track Daily Expenses</h4>
              <p>Record transactions immediately to maintain accurate records.</p>
            </div>
          </div>
          <div className="tip-card">
            <span className="tip-icon"><BarChart3 size={18} /></span>
            <div className="tip-content">
              <h4>Review Weekly</h4>
              <p>Check your spending patterns every week to identify trends.</p>
            </div>
          </div>
        </div>
      </div>

      {showTransactionForm && (
        <div className="modal-overlay" onClick={() => setShowTransactionForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Transaction</h3>
              <button
                className="modal-close"
                onClick={() => setShowTransactionForm(false)}
              >
                x
              </button>
            </div>
            <TransactionForm
              onSuccess={handleTransactionAdded}
              onCancel={() => setShowTransactionForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
