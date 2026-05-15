import React, { useState, useEffect } from 'react';
import { transactionService } from '../../services/transactionService';
import StatsCard from '../shared/StatsCard';
import { formatCurrency } from '../../utils/transactionUtils';
import './Analytics.css';

const Analytics = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

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

  const getAnalytics = () => {
    const now = new Date();
    let startDate = new Date();
    
    switch (selectedPeriod) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(0); // All time
    }

    const periodTransactions = transactions.filter(t => 
      new Date(t.transactionDate) >= startDate
    );

    const income = periodTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = periodTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    const categoryBreakdown = periodTransactions.reduce((acc, t) => {
      if (!acc[t.category]) {
        acc[t.category] = { income: 0, expense: 0, count: 0 };
      }
      if (t.type === 'INCOME') {
        acc[t.category].income += t.amount;
      } else {
        acc[t.category].expense += t.amount;
      }
      acc[t.category].count += 1;
      return acc;
    }, {});

    return {
      income,
      expenses,
      balance: income - expenses,
      transactionCount: periodTransactions.length,
      categoryBreakdown,
      avgTransaction: periodTransactions.length > 0 ? 
        (income + expenses) / periodTransactions.length : 0
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
            Detailed insights into your financial patterns
          </p>
        </div>
        
        <div className="period-selector">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="period-select"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      <div className="analytics-stats">
        <StatsCard
          title="Total Income"
          value={analytics.income}
          icon="📈"
          type="success"
          trend="up"
          subtitle={`For selected period`}
        />
        <StatsCard
          title="Total Expenses"
          value={analytics.expenses}
          icon="📉"
          type="error"
          trend="down"
          subtitle={`For selected period`}
        />
        <StatsCard
          title="Net Balance"
          value={analytics.balance}
          icon="💰"
          type={analytics.balance >= 0 ? 'success' : 'error'}
          trend={analytics.balance >= 0 ? 'up' : 'down'}
          subtitle="Income - Expenses"
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
          <h3 className="section-title">Category Breakdown</h3>
          <div className="category-list">
            {Object.entries(analytics.categoryBreakdown).map(([category, data]) => (
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
            ))}
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
                    ? "You're spending more than you earn. Consider reviewing your expenses."
                    : "Great job! You're saving money this period."
                  }
                </p>
              </div>
            </div>
            
            <div className="insight-card">
              <span className="insight-icon">📊</span>
              <div className="insight-content">
                <h4>Transaction Frequency</h4>
                <p>
                  You've made {analytics.transactionCount} transactions in this period.
                  {analytics.transactionCount > 50 && " That's quite active!"}
                </p>
              </div>
            </div>
            
            <div className="insight-card">
              <span className="insight-icon">🎯</span>
              <div className="insight-content">
                <h4>Savings Rate</h4>
                <p>
                  {analytics.income > 0 
                    ? `You're saving ${((analytics.balance / analytics.income) * 100).toFixed(1)}% of your income.`
                    : "Add some income transactions to see your savings rate."
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
