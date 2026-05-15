import React, { useState } from 'react';
import { CalendarDays, FileText, IndianRupee } from 'lucide-react';
import { transactionService } from '../../services/transactionService';
import { getISTDateString } from '../../utils/transactionUtils';
import './TransactionForm.css';

const TransactionForm = ({ onSuccess, onCancel, transaction = null }) => {
  const [formData, setFormData] = useState({
    description: transaction?.description || '',
    type: transaction?.type || 'EXPENSE',
    amount: transaction?.amount || '',
    category: transaction?.category || '',
    categoryId: transaction?.categoryId || '',
    transactionDate: transaction?.transactionDate || getISTDateString()
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = {
    INCOME: [
      { id: 1, name: 'Salary', icon: '💼' },
      { id: 7, name: 'Freelance', icon: '💻' },
      { id: 8, name: 'Investment', icon: '📈' },
      { id: 9, name: 'Business', icon: '🏢' },
      { id: 10, name: 'Other Income', icon: '💰' }
    ],
    EXPENSE: [
      { id: 2, name: 'Food & Dining', icon: '🍔' },
      { id: 3, name: 'Transportation', icon: '🚗' },
      { id: 4, name: 'Shopping', icon: '🛍️' },
      { id: 5, name: 'Entertainment', icon: '🎬' },
      { id: 6, name: 'Utilities', icon: '⚡' },
      { id: 11, name: 'Healthcare', icon: '🏥' },
      { id: 12, name: 'Education', icon: '📚' },
      { id: 13, name: 'Travel', icon: '✈️' },
      { id: 14, name: 'Other Expense', icon: '💸' }
    ]
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Auto-select category when type changes
    if (name === 'type') {
      const defaultCategory = categories[value][0];
      setFormData(prev => ({
        ...prev,
        type: value,
        category: defaultCategory.name,
        categoryId: defaultCategory.id
      }));
    }
    
    // Update category name when categoryId changes
    if (name === 'categoryId') {
      const selectedCategory = categories[formData.type].find(cat => cat.id === parseInt(value));
      if (selectedCategory) {
        setFormData(prev => ({
          ...prev,
          categoryId: value,
          category: selectedCategory.name
        }));
      }
    }
    
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Amount must be greater than 0');
      return false;
    }
    if (!formData.category) {
      setError('Category is required');
      return false;
    }
    if (!formData.transactionDate) {
      setError('Date is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');

    try {
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        categoryId: parseInt(formData.categoryId) || (formData.type === 'INCOME' ? 1 : 2)
      };

      if (transaction) {
        await transactionService.updateTransaction(transaction.id, transactionData);
      } else {
        await transactionService.createTransaction(transactionData);
      }
      
      onSuccess && onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentCategories = () => {
    return categories[formData.type] || [];
  };

  return (
    <div className="transaction-form-container">
      <form onSubmit={handleSubmit} className="transaction-form">
        {error && (
          <div className="form-error">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {/* Transaction Type */}
        <div className="form-group">
          <label className="form-label">Transaction Type</label>
          <div className="type-selector">
            <label className={`type-option ${formData.type === 'INCOME' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="type"
                value="INCOME"
                checked={formData.type === 'INCOME'}
                onChange={handleChange}
              />
              <span className="type-icon">📈</span>
              <span className="type-label">Income</span>
            </label>
            <label className={`type-option ${formData.type === 'EXPENSE' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="type"
                value="EXPENSE"
                checked={formData.type === 'EXPENSE'}
                onChange={handleChange}
              />
              <span className="type-icon">📉</span>
              <span className="type-label">Expense</span>
            </label>
          </div>
        </div>

        {/* Amount */}
        <div className="form-group">
          <label htmlFor="amount" className="form-label">
            Amount
          </label>
          <div className="field-row">
            <span className="field-icon" aria-hidden="true"><IndianRupee size={18} /></span>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="amount-input"
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <div className="field-row">
            <span className="field-icon" aria-hidden="true"><FileText size={18} /></span>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter transaction description"
              required
            />
          </div>
        </div>

        {/* Category */}
        <div className="form-group">
          <label htmlFor="categoryId" className="form-label">
            Category
          </label>
          <div className="category-grid">
            {getCurrentCategories().map(category => (
              <label 
                key={category.id}
                className={`category-option ${parseInt(formData.categoryId) === category.id ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="categoryId"
                  value={category.id}
                  checked={parseInt(formData.categoryId) === category.id}
                  onChange={handleChange}
                />
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{category.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Date */}
        <div className="form-group">
          <label htmlFor="transactionDate" className="form-label">
            Date
          </label>
          <div className="field-row">
            <span className="field-icon" aria-hidden="true"><CalendarDays size={18} /></span>
            <input
              type="date"
              id="transactionDate"
              name="transactionDate"
              value={formData.transactionDate}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`btn ${formData.type === 'INCOME' ? 'btn-success' : 'btn-error'}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                {transaction ? 'Updating...' : 'Adding...'}
              </>
            ) : (
              <>
                <span>{formData.type === 'INCOME' ? '💰' : '💸'}</span>
                {transaction ? 'Update Transaction' : 'Add Transaction'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
