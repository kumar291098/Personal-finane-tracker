import React from 'react';
import './RecentTransactions.css';

const RecentTransactions = ({ transactions, onRefresh }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount, type) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
    
    return type === 'INCOME' ? `+${formatted}` : `-${formatted}`;
  };

  const getCategoryIcon = (category) => {
    const iconMap = {
      'Salary': '💼',
      'Freelance': '💻',
      'Investment': '📈',
      'Food': '🍔',
      'Food & Dining': '🍔',
      'Transportation': '🚗',
      'Shopping': '🛍️',
      'Entertainment': '🎬',
      'Utilities': '⚡',
      'Healthcare': '🏥',
      'Education': '📚',
      'Travel': '✈️',
      'Income': '💰',
      'Expense': '💸'
    };
    
    return iconMap[category] || '📝';
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div className="recent-transactions">
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <p className="empty-text">No recent transactions</p>
          <button className="refresh-btn" onClick={onRefresh}>
            <span>🔄</span>
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="recent-transactions">
      <div className="transactions-list">
        {transactions.map((transaction) => (
          <div 
            key={transaction.id} 
            className={`transaction-item ${transaction.type.toLowerCase()}`}
          >
            <div className="transaction-icon">
              {getCategoryIcon(transaction.category)}
            </div>
            
            <div className="transaction-details">
              <div className="transaction-description">
                {transaction.description}
              </div>
              <div className="transaction-meta">
                <span className="transaction-category">
                  {transaction.category}
                </span>
                <span className="transaction-date">
                  {formatDate(transaction.transactionDate)}
                </span>
              </div>
            </div>
            
            <div className={`transaction-amount ${transaction.type.toLowerCase()}`}>
              {formatAmount(transaction.amount, transaction.type)}
            </div>
          </div>
        ))}
      </div>
      
      {transactions.length > 0 && (
        <div className="transactions-footer">
          <button className="refresh-btn" onClick={onRefresh}>
            <span>🔄</span>
            Refresh
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;