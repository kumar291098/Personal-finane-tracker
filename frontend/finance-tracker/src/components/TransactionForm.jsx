import React, { useState, useEffect } from 'react';
import { Plus, Edit, X } from 'lucide-react';
import '../styles/TransactionForm.css';

const TransactionForm = ({ onSubmit, editingTransaction, onCancel }) => {
  const [formData, setFormData] = useState({
    description: '',
    type: 'EXPENSE',
    amount: '',
    transaction_date: new Date().toISOString().split('T')[0],
    category: 'expense'
  });
  
  const [loading, setLoading] = useState(false);
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);

  // Common categories for suggestions
  const categoryOptions = {
    EXPENSE: ['food', 'transport', 'entertainment', 'shopping', 'bills', 'healthcare', 'education', 'other'],
    INCOME: ['salary', 'freelance', 'business', 'investment', 'bonus', 'gift', 'other']
  };

  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        description: editingTransaction.description || '',
        type: editingTransaction.type || 'EXPENSE',
        amount: editingTransaction.amount?.toString() || '',
        transaction_date: editingTransaction.transaction_date 
          ? new Date(editingTransaction.transaction_date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        category: editingTransaction.category || 'expense'
      });
    } else {
      // Reset form when not editing
      setFormData({
        description: '',
        type: 'EXPENSE',
        amount: '',
        transaction_date: new Date().toISOString().split('T')[0],
        category: 'expense'
      });
    }
  }, [editingTransaction]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      
      // Reset form only if we're adding a new transaction (not editing)
      if (!editingTransaction) {
        setFormData({
          description: '',
          type: 'EXPENSE',
          amount: '',
          transaction_date: new Date().toISOString().split('T')[0],
          category: formData.type === 'EXPENSE' ? 'expense' : 'income'
        });
      }
    } catch (error) {
      console.error('Error submitting transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Update default category when type changes
      if (name === 'type') {
        newData.category = value === 'EXPENSE' ? 'expense' : 'income';
      }
      
      return newData;
    });

    // Show category suggestions when typing in category field
    if (name === 'category') {
      setShowCategorySuggestions(value.length > 0);
    }
  };

  const handleCategorySelect = (category) => {
    setFormData(prev => ({ ...prev, category }));
    setShowCategorySuggestions(false);
  };

  const filteredCategories = categoryOptions[formData.type].filter(cat =>
    cat.toLowerCase().includes(formData.category.toLowerCase())
  );

  return (
    <div className={`form-card ${loading ? 'form-loading' : ''}`}>
      <h3 className="form-title">
        {editingTransaction ? (
          <>
            <Edit size={20} className="form-title-icon" />
            Edit Transaction
          </>
        ) : (
          <>
            <Plus size={20} className="form-title-icon" />
            Add New Transaction
          </>
        )}
      </h3>
      
      <form onSubmit={handleSubmit} className="transaction-form">
        <div className="form-row">
          <div className="input-group">
            <label className="label">Description *</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input"
              placeholder="What was this transaction for?"
              required
              disabled={loading}
              maxLength={100}
            />
          </div>
          
          <div className="input-group">
            <label className="label">Type *</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="select"
              required
              disabled={loading}
            >
              <option value="EXPENSE">💸 Expense</option>
              <option value="INCOME">💰 Income</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="input-group">
            <label className="label">Amount (₹) *</label>
            <div className="amount-input">
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="input"
                placeholder="0.00"
                step="0.01"
                min="0"
                max="999999999.99"
                required
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="input-group">
            <label className="label">Date *</label>
            <div className="date-input">
              <input
                type="date"
                name="transaction_date"
                value={formData.transaction_date}
                onChange={handleChange}
                className="input"
                required
                disabled={loading}
                max={new Date().toISOString().split('T')[0]} // Can't select future dates
              />
            </div>
          </div>
        </div>

        <div className="input-group">
          <label className="label">Category *</label>
          <div className="category-input">
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              onFocus={() => setShowCategorySuggestions(true)}
              onBlur={() => setTimeout(() => setShowCategorySuggestions(false), 200)}
              className="input"
              placeholder="Enter or select a category"
              required
              disabled={loading}
              maxLength={50}
            />
            
            {showCategorySuggestions && filteredCategories.length > 0 && (
              <div className="category-suggestions">
                {filteredCategories.map((category, index) => (
                  <div
                    key={index}
                    className="category-suggestion"
                    onClick={() => handleCategorySelect(category)}
                  >
                    {category}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className={`submit-button ${formData.type === 'INCOME' ? 'type-income' : 'type-expense'}`}
            disabled={loading}
          >
            {loading ? 'Processing...' : (editingTransaction ? 'Update Transaction' : 'Add Transaction')}
          </button>
          
          {editingTransaction && (
            <button
              type="button"
              onClick={onCancel}
              className="cancel-button"
              disabled={loading}
            >
              <X size={16} />
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;