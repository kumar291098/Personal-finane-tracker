import React from 'react';
import { X } from 'lucide-react';
import TransactionForm from './TransactionForm';

const TransactionFormModal = ({ transaction, onClose, onSuccess }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={event => event.stopPropagation()}>
        <div className="modal-header">
          <h3>{transaction ? 'Edit Transaction' : 'Add New Transaction'}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close transaction form">
            <X size={18} />
          </button>
        </div>
        <TransactionForm
          transaction={transaction}
          onSuccess={onSuccess}
          onCancel={onClose}
        />
      </div>
    </div>
  );
};

export default TransactionFormModal;
