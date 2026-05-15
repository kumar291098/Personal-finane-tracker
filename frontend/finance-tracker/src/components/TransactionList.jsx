import React, { useState, useEffect } from 'react';
import { Edit, Trash2, List, Search } from 'lucide-react';
import { formatDate, formatCurrency } from '../utils/transactionUtils';

const TransactionList = ({ 
  transactions, 
  searchTerm, 
  setSearchTerm, 
  filterType, 
  setFilterType, 
  onEdit, 
  onDelete 
}) => {
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  useEffect(() => {
    let filtered = [...transactions];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'ALL') {
      filtered = filtered.filter(transaction => transaction.type === filterType);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));

    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, filterType]);

  return (
    <div className="transactions-section">
      <h2 className="section-title">
        <List size={20} className="section-title-icon" />
        Transaction History
      </h2>

      <div className="filter-bar">
        <div className="search-input-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select
          className="filter-select"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="ALL">All Transactions</option>
          <option value="INCOME">Income Only</option>
          <option value="EXPENSE">Expenses Only</option>
        </select>
      </div>
      
      {filteredTransactions.length === 0 ? (
        <div className="empty-state">
          {transactions.length === 0 ? (
            <>
              <div className="empty-state-icon">
                <Search size={64} color="#d1d5db" />
              </div>
              <h3>No transactions yet</h3>
              <p>Start tracking your finances by adding your first transaction above!</p>
            </>
          ) : (
            <>
              <div className="empty-state-icon">
                <Search size={64} color="#d1d5db" />
              </div>
              <h3>No matching transactions</h3>
              <p>Try adjusting your search terms or filters.</p>
            </>
          )}
        </div>
      ) : (
        <div className="transactions-list">
          {filteredTransactions.map((transaction) => (
            <div key={transaction.id} className="transaction-card">
              <div className="transaction-info">
                <h4 className="transaction-description">
                  {transaction.description}
                </h4>
                <div className="transaction-meta">
                  <span className="transaction-category">
                    {transaction.category}
                  </span>
                  <span className="transaction-date">
                    {formatDate(transaction.transaction_date)}
                  </span>
                </div>
              </div>
              
              <div className="transaction-amount">
                <span className={`amount-text ${transaction.type === 'INCOME' ? 'income' : 'expense'}`}>
                  {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                </span>
                
                <div className="transaction-actions">
                  <button
                    onClick={() => onEdit(transaction)}
                    className="action-button edit"
                    title="Edit transaction"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(transaction.id)}
                    className="action-button delete"
                    title="Delete transaction"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionList;