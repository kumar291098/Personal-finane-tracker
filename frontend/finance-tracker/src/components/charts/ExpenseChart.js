import React from 'react';
import { formatCurrency } from '../../utils/transactionUtils';
import './Charts.css';

const ExpenseChart = ({ transactions }) => {
  // Calculate category totals
  const categoryTotals = transactions.reduce((acc, transaction) => {
    const category = transaction.category || 'Other';
    acc[category] = (acc[category] || 0) + transaction.amount;
    return acc;
  }, {});

  // Sort categories by amount (descending)
  const sortedCategories = Object.entries(categoryTotals)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 6); // Show top 6 categories

  const total = sortedCategories.reduce((sum, [, amount]) => sum + amount, 0);

  const getCategoryIcon = (category) => {
    const iconMap = {
      'Food': '🍔',
      'Food & Dining': '🍔',
      'Transportation': '🚗',
      'Shopping': '🛍️',
      'Entertainment': '🎬',
      'Utilities': '⚡',
      'Healthcare': '🏥',
      'Education': '📚',
      'Donation': '🤝',
      'Grocery': '🛒',
      'Sports': '🏏',
      'Travel': '���️',
      'Other': '📝'
    };
    
    return iconMap[category] || '📝';
  };

  const getColor = (index) => {
    const colors = [
      'var(--error-500)',
      'var(--warning-500)',
      'var(--primary-500)',
      'var(--success-500)',
      'var(--secondary-500)',
      'var(--gray-500)'
    ];
    return colors[index % colors.length];
  };

  if (sortedCategories.length === 0) {
    return (
      <div className="chart-container">
        <div className="chart-empty">
          <div className="empty-icon">📊</div>
          <p>No expense data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <div className="expense-chart">
        {/* Simple Bar Chart */}
        <div className="chart-bars">
          {sortedCategories.map(([category, amount], index) => {
            const percentage = (amount / total) * 100;
            return (
              <div key={category} className="chart-bar-container">
                <div className="chart-bar-info">
                  <span className="category-icon">{getCategoryIcon(category)}</span>
                  <span className="category-name">{category}</span>
                  <span className="category-amount">
                    {formatCurrency(amount)}
                  </span>
                </div>
                <div className="chart-bar-wrapper">
                  <div 
                    className="chart-bar"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: getColor(index),
                      animationDelay: `${index * 0.1}s`
                    }}
                  />
                  <span className="percentage-label">{percentage.toFixed(1)}%</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="chart-legend">
          <div className="legend-title">Category Breakdown</div>
          <div className="legend-items">
            {sortedCategories.map(([category, amount], index) => (
              <div key={category} className="legend-item">
                <div 
                  className="legend-color"
                  style={{ backgroundColor: getColor(index) }}
                />
                <span className="legend-label">{category}</span>
                <span className="legend-value">
                  {formatCurrency(amount)}
                </span>
              </div>
            ))}
          </div>
          <div className="legend-total">
            <strong>Total: {formatCurrency(total)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseChart;
