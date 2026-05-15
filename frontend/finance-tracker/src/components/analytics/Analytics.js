import React, { useEffect, useState } from 'react';
import { CalendarDays, Flag, TrendingDown, TrendingUp } from 'lucide-react';
import { transactionService } from '../../services/transactionService';
import StatsCard from '../shared/StatsCard';
import { formatCurrency } from '../../utils/transactionUtils';
import './Analytics.css';

const defaultGoal = {
  title: 'Monthly Savings',
  targetAmount: '',
  targetDate: ''
};

const periodOptions = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Last 7 Days' },
  { value: 'month', label: 'Last Month' },
  { value: 'year', label: 'Last Year' },
  { value: 'custom', label: 'Custom Range' },
  { value: 'all', label: 'All Time' }
];

const Analytics = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [incomeFilter, setIncomeFilter] = useState({
    period: 'month',
    startDate: '',
    endDate: ''
  });
  const [expenseFilter, setExpenseFilter] = useState({
    period: 'month',
    startDate: '',
    endDate: ''
  });
  const readSavedGoal = () => {
    try {
      const savedGoal = localStorage.getItem('financeGoal');
      return savedGoal ? { ...defaultGoal, ...JSON.parse(savedGoal) } : defaultGoal;
    } catch (error) {
      return defaultGoal;
    }
  };
  const [goal, setGoal] = useState(readSavedGoal);

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    const refreshAnalyticsData = () => {
      setGoal(readSavedGoal());
      fetchTransactions();
    };

    window.addEventListener('focus', refreshAnalyticsData);
    window.addEventListener('storage', refreshAnalyticsData);

    return () => {
      window.removeEventListener('focus', refreshAnalyticsData);
      window.removeEventListener('storage', refreshAnalyticsData);
    };
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

  const getStartOfToday = () => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const getDateRange = (filter) => {
    const now = new Date();
    const startDate = getStartOfToday();

    switch (filter.period) {
      case 'today':
        return { startDate, endDate: new Date() };
      case 'week':
        startDate.setDate(now.getDate() - 7);
        return { startDate, endDate: new Date() };
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        return { startDate, endDate: new Date() };
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        return { startDate, endDate: new Date() };
      case 'custom':
        return {
          startDate: filter.startDate ? new Date(`${filter.startDate}T00:00:00`) : new Date(0),
          endDate: filter.endDate ? new Date(`${filter.endDate}T23:59:59`) : new Date()
        };
      default:
        return { startDate: new Date(0), endDate: new Date() };
    }
  };

  const getTotal = (items) => items.reduce((sum, transaction) => sum + transaction.amount, 0);

  const filterTransactionsByRange = (type, filter) => {
    const { startDate, endDate } = getDateRange(filter);
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.transactionDate);
      return transaction.type === type &&
        transactionDate >= startDate &&
        transactionDate <= endDate;
    });
  };

  const updateFilter = (type, field, value) => {
    const setter = type === 'income' ? setIncomeFilter : setExpenseFilter;
    setter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getAnalytics = () => {
    const incomeTransactions = filterTransactionsByRange('INCOME', incomeFilter);
    const expenseTransactions = filterTransactionsByRange('EXPENSE', expenseFilter);
    const periodTransactions = [...incomeTransactions, ...expenseTransactions];

    const income = getTotal(incomeTransactions);
    const expenses = getTotal(expenseTransactions);
    const allIncome = getTotal(transactions.filter(transaction => transaction.type === 'INCOME'));
    const allExpenses = getTotal(transactions.filter(transaction => transaction.type === 'EXPENSE'));
    const achievedAmount = Math.max(allIncome - allExpenses, 0);
    const targetAmount = Number(goal.targetAmount) || 0;
    const goalProgress = targetAmount > 0
      ? Math.min((achievedAmount / targetAmount) * 100, 100)
      : 0;

    const categoryBreakdown = periodTransactions.reduce((acc, transaction) => {
      if (!acc[transaction.category]) {
        acc[transaction.category] = { income: 0, expense: 0, count: 0 };
      }

      if (transaction.type === 'INCOME') {
        acc[transaction.category].income += transaction.amount;
      } else {
        acc[transaction.category].expense += transaction.amount;
      }

      acc[transaction.category].count += 1;
      return acc;
    }, {});

    return {
      income,
      expenses,
      balance: income - expenses,
      transactionCount: periodTransactions.length,
      incomeCount: incomeTransactions.length,
      expenseCount: expenseTransactions.length,
      categoryBreakdown,
      avgTransaction: periodTransactions.length > 0
        ? (income + expenses) / periodTransactions.length
        : 0,
      goal: {
        targetAmount,
        achievedAmount,
        remainingAmount: Math.max(targetAmount - achievedAmount, 0),
        progress: goalProgress
      }
    };
  };

  const analytics = getAnalytics();

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div className="header-content">
          <h1 className="page-title">Analytics & Reports</h1>
          <p className="page-subtitle">
            Track income, expenses, date ranges, and progress toward your goal.
          </p>
        </div>
      </div>

      <div className="tracking-controls">
        <div className="filter-card income-filter">
          <div className="filter-heading">
            <span><TrendingUp size={18} /></span>
            <div>
              <h3>Income Filter</h3>
              <p>{analytics.incomeCount} income records</p>
            </div>
          </div>
          <select
            value={incomeFilter.period}
            onChange={(event) => updateFilter('income', 'period', event.target.value)}
            className="period-select"
          >
            {periodOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          {incomeFilter.period === 'custom' && (
            <div className="custom-range">
              <label>
                From
                <input
                  type="date"
                  value={incomeFilter.startDate}
                  onChange={(event) => updateFilter('income', 'startDate', event.target.value)}
                />
              </label>
              <label>
                To
                <input
                  type="date"
                  value={incomeFilter.endDate}
                  onChange={(event) => updateFilter('income', 'endDate', event.target.value)}
                />
              </label>
            </div>
          )}
        </div>

        <div className="filter-card expense-filter">
          <div className="filter-heading">
            <span><TrendingDown size={18} /></span>
            <div>
              <h3>Expense Filter</h3>
              <p>{analytics.expenseCount} expense records</p>
            </div>
          </div>
          <select
            value={expenseFilter.period}
            onChange={(event) => updateFilter('expense', 'period', event.target.value)}
            className="period-select"
          >
            {periodOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          {expenseFilter.period === 'custom' && (
            <div className="custom-range">
              <label>
                From
                <input
                  type="date"
                  value={expenseFilter.startDate}
                  onChange={(event) => updateFilter('expense', 'startDate', event.target.value)}
                />
              </label>
              <label>
                To
                <input
                  type="date"
                  value={expenseFilter.endDate}
                  onChange={(event) => updateFilter('expense', 'endDate', event.target.value)}
                />
              </label>
            </div>
          )}
        </div>

        <div className="goal-progress-card">
          <div className="filter-heading">
            <span><Flag size={18} /></span>
            <div>
              <h3>{goal.title || 'Financial Goal'}</h3>
              <p>{goal.targetDate ? `Target date ${goal.targetDate}` : 'Set a goal from Dashboard'}</p>
            </div>
          </div>
          <div className="goal-progress-values">
            <span>{formatCurrency(analytics.goal.achievedAmount)} achieved</span>
            <strong>{analytics.goal.progress.toFixed(0)}%</strong>
          </div>
          <div className="goal-progress-track">
            <div className="goal-progress-fill" style={{ width: `${analytics.goal.progress}%` }} />
          </div>
          <div className="goal-progress-footer">
            <span>Goal: {analytics.goal.targetAmount ? formatCurrency(analytics.goal.targetAmount) : 'Not set'}</span>
            <span>Left: {analytics.goal.targetAmount ? formatCurrency(analytics.goal.remainingAmount) : formatCurrency(0)}</span>
          </div>
        </div>
      </div>

      <div className="analytics-stats">
        <StatsCard
          title="Total Income"
          value={analytics.income}
          icon="📈"
          type="success"
          trend="up"
          subtitle="Using income filter"
        />
        <StatsCard
          title="Total Expenses"
          value={analytics.expenses}
          icon="📉"
          type="error"
          trend="down"
          subtitle="Using expense filter"
        />
        <StatsCard
          title="Net Balance"
          value={analytics.balance}
          icon="💰"
          type={analytics.balance >= 0 ? 'success' : 'error'}
          trend={analytics.balance >= 0 ? 'up' : 'down'}
          subtitle="Filtered income - expenses"
        />
        <StatsCard
          title="Avg Transaction"
          value={analytics.avgTransaction}
          icon="📊"
          type="primary"
          subtitle="Average amount"
        />
      </div>

      <div className="analytics-content">
        <div className="category-breakdown">
          <h3 className="section-title"><CalendarDays size={20} /> Category Breakdown</h3>
          <div className="category-list">
            {Object.keys(analytics.categoryBreakdown).length === 0 ? (
              <div className="empty-analytics">
                No transactions found for the selected filters.
              </div>
            ) : (
              Object.entries(analytics.categoryBreakdown).map(([category, data]) => (
                <div key={category} className="category-item">
                  <div className="category-info">
                    <span className="category-name">{category}</span>
                    <span className="category-count">{data.count} transactions</span>
                  </div>
                  <div className="category-amounts">
                    {data.income > 0 && (
                      <span className="income-amount">
                        +{formatCurrency(data.income)}
                      </span>
                    )}
                    {data.expense > 0 && (
                      <span className="expense-amount">
                        -{formatCurrency(data.expense)}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="insights-section">
          <h3 className="section-title">Financial Insights</h3>
          <div className="insights-grid">
            <div className="insight-card">
              <span className="insight-icon">💡</span>
              <div className="insight-content">
                <h4>Spending Pattern</h4>
                <p>
                  {analytics.expenses > analytics.income
                    ? "You're spending more than you earn for these filters. Try narrowing expenses by week or category."
                    : "Your filtered income is ahead of expenses for this view."
                  }
                </p>
              </div>
            </div>

            <div className="insight-card">
              <span className="insight-icon">📊</span>
              <div className="insight-content">
                <h4>Transaction Frequency</h4>
                <p>
                  This view includes {analytics.transactionCount} transactions:
                  {' '}{analytics.incomeCount} income and {analytics.expenseCount} expense.
                </p>
              </div>
            </div>

            <div className="insight-card">
              <span className="insight-icon">🎯</span>
              <div className="insight-content">
                <h4>Goal Progress</h4>
                <p>
                  {analytics.goal.targetAmount > 0
                    ? `You have achieved ${analytics.goal.progress.toFixed(1)}% of your goal with ${formatCurrency(analytics.goal.remainingAmount)} remaining.`
                    : "Set a goal from the dashboard to track achieved vs target progress here."
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
