import React, { useState, useEffect } from 'react';
import './Categories.css';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'EXPENSE',
    icon: '📝'
  });

  // Default categories (since we don't have a categories API endpoint yet)
  const defaultCategories = [
    { id: 1, name: 'Salary', type: 'INCOME', icon: '💼' },
    { id: 2, name: 'Freelance', type: 'INCOME', icon: '💻' },
    { id: 3, name: 'Investment', type: 'INCOME', icon: '📈' },
    { id: 4, name: 'Food & Dining', type: 'EXPENSE', icon: '🍔' },
    { id: 5, name: 'Transportation', type: 'EXPENSE', icon: '🚗' },
    { id: 6, name: 'Shopping', type: 'EXPENSE', icon: '🛍️' },
    { id: 7, name: 'Entertainment', type: 'EXPENSE', icon: '🎬' },
    { id: 8, name: 'Utilities', type: 'EXPENSE', icon: '⚡' },
    { id: 9, name: 'Healthcare', type: 'EXPENSE', icon: '🏥' },
    { id: 10, name: 'Education', type: 'EXPENSE', icon: '📚' }
  ];

  useEffect(() => {
    // For now, use default categories
    setCategories(defaultCategories);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const availableIcons = [
    '💼', '💻', '📈', '🍔', '🚗', '🛍️', '🎬', '⚡', '🏥', '📚',
    '✈️', '🏠', '📱', '💰', '💸', '🎯', '🎨', '🏋️', '📝', '🔧',
    '🌟', '🎵', '📊', '🎮', '☕', '🍕', '🚌', '⛽', '💊', '📖'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingCategory) {
      // Update existing category
      setCategories(prev => prev.map(cat => 
        cat.id === editingCategory.id 
          ? { ...cat, ...formData }
          : cat
      ));
    } else {
      // Add new category
      const newCategory = {
        id: Date.now(),
        ...formData
      };
      setCategories(prev => [...prev, newCategory]);
    }
    
    resetForm();
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      icon: category.icon
    });
    setShowForm(true);
  };

  const handleDelete = (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'EXPENSE',
      icon: '📝'
    });
    setEditingCategory(null);
    setShowForm(false);
  };

  const getIncomeCategories = () => categories.filter(cat => cat.type === 'INCOME');
  const getExpenseCategories = () => categories.filter(cat => cat.type === 'EXPENSE');

  return (
    <div className="categories-page">
      <div className="categories-header">
        <div className="header-content">
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">
            Organize your transactions with custom categories
          </p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          <span>��</span>
          Add Category
        </button>
      </div>

      <div className="categories-content">
        <div className="category-section">
          <div className="section-header">
            <h3 className="section-title">
              <span className="section-icon">📈</span>
              Income Categories
            </h3>
            <span className="category-count">{getIncomeCategories().length} categories</span>
          </div>
          
          <div className="categories-grid">
            {getIncomeCategories().map(category => (
              <div key={category.id} className="category-card income-card">
                <div className="category-icon">{category.icon}</div>
                <div className="category-info">
                  <h4 className="category-name">{category.name}</h4>
                  <span className="category-type">Income</span>
                </div>
                <div className="category-actions">
                  <button 
                    className="action-btn edit-btn"
                    onClick={() => handleEdit(category)}
                  >
                    ✏️
                  </button>
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => handleDelete(category.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="category-section">
          <div className="section-header">
            <h3 className="section-title">
              <span className="section-icon">📉</span>
              Expense Categories
            </h3>
            <span className="category-count">{getExpenseCategories().length} categories</span>
          </div>
          
          <div className="categories-grid">
            {getExpenseCategories().map(category => (
              <div key={category.id} className="category-card expense-card">
                <div className="category-icon">{category.icon}</div>
                <div className="category-info">
                  <h4 className="category-name">{category.name}</h4>
                  <span className="category-type">Expense</span>
                </div>
                <div className="category-actions">
                  <button 
                    className="action-btn edit-btn"
                    onClick={() => handleEdit(category)}
                  >
                    ✏️
                  </button>
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => handleDelete(category.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
              <button className="modal-close" onClick={resetForm}>✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="category-form">
              <div className="form-group">
                <label className="form-label">Category Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="form-input"
                  placeholder="Enter category name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Type</label>
                <div className="type-selector">
                  <label className={`type-option ${formData.type === 'INCOME' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="type"
                      value="INCOME"
                      checked={formData.type === 'INCOME'}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
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
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    />
                    <span className="type-icon">📉</span>
                    <span className="type-label">Expense</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Icon</label>
                <div className="icon-grid">
                  {availableIcons.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      className={`icon-option ${formData.icon === icon ? 'selected' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, icon }))}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCategory ? 'Update Category' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
