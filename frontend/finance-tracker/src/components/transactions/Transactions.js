import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CreditCard, Plus, Smartphone } from 'lucide-react';
import { transactionService } from '../../services/transactionService';
import TransactionControls from './TransactionControls';
import TransactionFormModal from './TransactionFormModal';
import TransactionList from './TransactionList';
import TransactionStats from './TransactionStats';
import PaymentModal from './PaymentModal';
import {
  DEFAULT_FILTERS,
  DEFAULT_PAYMENT_DATA,
  paymentCategories
} from './transactionConstants';
import {
  filterAndSortTransactions,
  getTransactionStats,
  getUniqueCategories
} from './transactionFilters';
import './Transactions.css';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [paymentData, setPaymentData] = useState(DEFAULT_PAYMENT_DATA);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await transactionService.getUserTransactions();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const filteredTransactions = useMemo(() => {
    return filterAndSortTransactions(transactions, filters, sortBy, sortOrder);
  }, [filters, sortBy, sortOrder, transactions]);

  const categories = useMemo(() => getUniqueCategories(transactions), [transactions]);
  const stats = useMemo(() => getTransactionStats(filteredTransactions), [filteredTransactions]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
      return;
    }

    setSortBy(field);
    setSortOrder('desc');
  };

  const closeTransactionForm = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  const handleTransactionSuccess = () => {
    fetchTransactions();
    closeTransactionForm();
  };

  const resetPaymentFlow = () => {
    setShowPaymentFlow(false);
    setPaymentProcessing(false);
    setPaymentMessage('');
    setPaymentData(DEFAULT_PAYMENT_DATA);
  };

  const handlePaymentChange = (field, value) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }));
    if (paymentMessage) setPaymentMessage('');
  };

  const handlePaymentSubmit = async (event) => {
    event.preventDefault();

    const amount = Number(paymentData.amount);
    if (!amount || amount <= 0) {
      setPaymentMessage('Enter a valid payment amount.');
      return;
    }

    const selectedCategory = paymentCategories.find(category => category.name === paymentData.category);
    setPaymentProcessing(true);
    setPaymentMessage('');

    try {
      await transactionService.createTransaction({
        type: 'EXPENSE',
        amount,
        category: paymentData.category,
        categoryId: selectedCategory?.id || 2,
        description: paymentData.description.trim() || `${paymentData.app} payment - ${paymentData.category}`
      });
      await fetchTransactions();
      setPaymentMessage('Payment completed and expense added.');
      setTimeout(resetPaymentFlow, 700);
    } catch (error) {
      setPaymentMessage(error.message || 'Payment was completed, but expense could not be added.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleDelete = async (transactionId) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      await transactionService.deleteTransaction(transactionId);
      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  if (loading) {
    return (
      <div className="transactions-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="transactions-page">
      <div className="transactions-header">
        <div className="header-content">
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">Manage and track all your financial transactions</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={18} />
          Add Transaction
        </button>
      </div>

      <div className="payment-simulator-card">
        <div className="payment-simulator-content">
          <span className="payment-simulator-icon"><Smartphone size={22} /></span>
          <div>
            <h3>Pay with app and auto-track expense</h3>
            <p>Select Paytm or another payment app, choose category, complete payment, and save it as an expense.</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowPaymentFlow(true)}>
          <CreditCard size={18} />
          Make Payment
        </button>
      </div>

      <TransactionStats stats={stats} />

      <TransactionControls
        filters={filters}
        categories={categories}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onFilterChange={handleFilterChange}
        onResetFilters={() => setFilters(DEFAULT_FILTERS)}
        onSortByChange={setSortBy}
        onSortOrderToggle={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
      />

      <div className="transactions-content">
        {filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <h3>No transactions found</h3>
            <p>
              {transactions.length === 0
                ? "You haven't added any transactions yet."
                : 'No transactions match your current filters.'
              }
            </p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              Add Your First Transaction
            </button>
          </div>
        ) : (
          <TransactionList
            transactions={filteredTransactions}
            onEdit={handleEdit}
            onDelete={handleDelete}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
        )}
      </div>

      {showForm && (
        <TransactionFormModal
          transaction={editingTransaction}
          onClose={closeTransactionForm}
          onSuccess={handleTransactionSuccess}
        />
      )}

      {showPaymentFlow && (
        <PaymentModal
          paymentData={paymentData}
          paymentProcessing={paymentProcessing}
          paymentMessage={paymentMessage}
          onChange={handlePaymentChange}
          onClose={resetPaymentFlow}
          onSubmit={handlePaymentSubmit}
        />
      )}
    </div>
  );
};

export default Transactions;
