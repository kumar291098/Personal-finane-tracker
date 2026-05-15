import React, { useState, useContext } from 'react';
import { useAuth } from '../../context/AuthContext';

const TransactionForm = ({ transaction, onCancel, onSubmit }) => {
  const { token, user } = useAuth();
  const userId = user?.id; // ✅ get userId from user object

  const [formData, setFormData] = useState({
    description: transaction?.description || '',
    type: transaction?.type || 'EXPENSE',
    amount: transaction?.amount || '',
    category: transaction?.category || '',
    transactionDate: transaction?.transactionDate 
      ? new Date(transaction.transactionDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...transaction,
      ...formData,
      amount: typeof formData.amount === 'string' 
        ? parseFloat(formData.amount) 
        : formData.amount,
      userId // ✅ pass userId from context
    });
  };


  return (
    <div className="transaction-form">
      <h2>{transaction ? 'Edit Transaction' : 'Add New Transaction'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="type">Type:</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
          >
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount:</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            step="0.01"
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category:</label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="transactionDate">Date:</label>
          <input
            type="date"
            id="transactionDate"
            name="transactionDate"
            value={formData.transactionDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel}>Cancel</button>
          <button type="submit">Save Transaction</button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;