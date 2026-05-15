import React from 'react';
import { formatCurrency } from '../../utils/transactionUtils';
import './TransactionList.css';

const TransactionList = ({ 
  transactions, 
  onEdit, 
  onDelete, 
  sortBy, 
  sortOrder, 
  onSort 
}) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'Asia/Kolkata'
    });
  };

  const formatAmount = (amount, type) => {
    const formatted = formatCurrency(amount);
    
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

  const getSortIcon = (field) => {
    if (sortBy !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div className="transaction-list-empty">
        <div className="empty-icon">📝</div>
        <h3>No transactions found</h3>
        <p>Try adjusting your filters or add some transactions.</p>
      </div>
    );
  }

  return (
    <div className="transaction-list">
      {/* Desktop Table View */}
      <div className="transaction-table-container">
        <table className="transaction-table">
          <thead>
            <tr>
              <th>
                <button 
                  className="sort-header"
                  onClick={() => onSort('date')}
                >
                  Date {getSortIcon('date')}
                </button>
              </th>
              <th>
                <button 
                  className="sort-header"
                  onClick={() => onSort('description')}
                >
                  Description {getSortIcon('description')}
                </button>
              </th>
              <th>
                <button 
                  className="sort-header"
                  onClick={() => onSort('category')}
                >
                  Category {getSortIcon('category')}
                </button>
              </th>
              <th>
                <button 
                  className="sort-header"
                  onClick={() => onSort('amount')}
                >
                  Amount {getSortIcon('amount')}
                </button>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr 
                key={transaction.id} 
                className={`transaction-row ${transaction.type.toLowerCase()}`}
              >
                <td className="date-cell">
                  {formatDate(transaction.transactionDate)}
                </td>
                <td className="description-cell">
                  <div className="description-content">
                    <span className="category-icon">
                      {getCategoryIcon(transaction.category)}
                    </span>
                    <span className="description-text">
                      {transaction.description}
                    </span>
                  </div>
                </td>
                <td className="category-cell">
                  <span className={`category-badge ${transaction.type.toLowerCase()}`}>
                    {transaction.category}
                  </span>
                </td>
                <td className={`amount-cell ${transaction.type.toLowerCase()}`}>
                  {formatAmount(transaction.amount, transaction.type)}
                </td>
                <td className="actions-cell">
                  <div className="action-buttons">
                    <button 
                      className="action-btn edit-btn"
                      onClick={() => onEdit(transaction)}
                      title="Edit transaction"
                    >
                      ✏️
                    </button>
                    <button 
                      className="action-btn delete-btn"
                      onClick={() => onDelete(transaction.id)}
                      title="Delete transaction"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="transaction-cards">
        {transactions.map((transaction) => (
          <div 
            key={transaction.id} 
            className={`transaction-card ${transaction.type.toLowerCase()}`}
          >
            <div className="card-header">
              <div className="card-icon">
                {getCategoryIcon(transaction.category)}
              </div>
              <div className="card-info">
                <div className="card-description">
                  {transaction.description}
                </div>
                <div className="card-date">
                  {formatDate(transaction.transactionDate)}
                </div>
              </div>
              <div className={`card-amount ${transaction.type.toLowerCase()}`}>
                {formatAmount(transaction.amount, transaction.type)}
              </div>
            </div>
            
            <div className="card-body">
              <div className="card-category">
                <span className={`category-badge ${transaction.type.toLowerCase()}`}>
                  {transaction.category}
                </span>
              </div>
              
              <div className="card-actions">
                <button 
                  className="action-btn edit-btn"
                  onClick={() => onEdit(transaction)}
                >
                  <span>✏️</span>
                  Edit
                </button>
                <button 
                  className="action-btn delete-btn"
                  onClick={() => onDelete(transaction.id)}
                >
                  <span>🗑️</span>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionList;
