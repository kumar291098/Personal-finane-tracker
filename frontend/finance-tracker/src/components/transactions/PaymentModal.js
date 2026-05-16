import React from 'react';
import { CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { paymentApps, paymentCategories } from './transactionConstants';

const PaymentModal = ({
  paymentData,
  paymentProcessing,
  paymentMessage,
  onChange,
  onClose,
  onSubmit
}) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content payment-modal" onClick={event => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Complete Payment</h3>
            <p className="modal-subtitle">This payment flow records an expense after completion.</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close payment">
            <X size={18} />
          </button>
        </div>

        <form className="payment-form" onSubmit={onSubmit}>
          <div className="payment-app-grid">
            {paymentApps.map(app => (
              <button
                key={app.id}
                type="button"
                className={`payment-app-option ${app.tone} ${paymentData.app === app.id ? 'selected' : ''}`}
                onClick={() => onChange('app', app.id)}
              >
                <span>{app.label}</span>
                {paymentData.app === app.id && <CheckCircle2 size={16} />}
              </button>
            ))}
          </div>

          <div className="payment-field">
            <label htmlFor="paymentAmount">Amount</label>
            <input
              id="paymentAmount"
              type="number"
              min="1"
              step="0.01"
              value={paymentData.amount}
              onChange={(event) => onChange('amount', event.target.value)}
              placeholder="Enter amount"
              required
            />
          </div>

          <div className="payment-field">
            <label htmlFor="paymentCategory">Category</label>
            <select
              id="paymentCategory"
              value={paymentData.category}
              onChange={(event) => onChange('category', event.target.value)}
            >
              {paymentCategories.map(category => (
                <option key={category.name} value={category.name}>{category.name}</option>
              ))}
            </select>
          </div>

          <div className="payment-field">
            <label htmlFor="paymentDescription">Description</label>
            <input
              id="paymentDescription"
              type="text"
              value={paymentData.description}
              onChange={(event) => onChange('description', event.target.value)}
              placeholder={`${paymentData.app} payment`}
            />
          </div>

          <div className="payment-security-note">
            <ShieldCheck size={18} />
            <span>Demo payment confirmation. Real Paytm/UPI integration can be connected later with merchant API keys.</span>
          </div>

          {paymentMessage && (
            <div className={`payment-message ${paymentMessage.includes('completed') ? 'success' : 'error'}`}>
              {paymentMessage}
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={paymentProcessing}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={paymentProcessing}>
              {paymentProcessing ? 'Processing...' : `Pay with ${paymentData.app}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
