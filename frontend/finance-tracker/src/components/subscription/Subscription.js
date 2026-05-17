import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Crown, CreditCard, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  createSubscriptionOrder,
  fetchSubscriptionPlan,
  verifySubscriptionPayment
} from '../../services/subscriptionService';
import './Subscription.css';

const loadRazorpayCheckout = () => new Promise((resolve, reject) => {
  if (window.Razorpay) {
    resolve(true);
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.onload = () => resolve(true);
  script.onerror = () => reject(new Error('Unable to load Razorpay checkout.'));
  document.body.appendChild(script);
});

const formatAmount = (amountPaise) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format((amountPaise || 0) / 100);

const Subscription = () => {
  const { token, user, refreshAccessPolicy } = useAuth();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadPlan = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setPlan(await fetchSubscriptionPlan(token));
    } catch (err) {
      setError(err.message || 'Unable to load subscription.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadPlan();
  }, [loadPlan]);

  const startPayment = async () => {
    setPaying(true);
    setError('');
    setMessage('');
    try {
      await loadRazorpayCheckout();
      const order = await createSubscriptionOrder(token);

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amountPaise,
        currency: order.currency,
        name: order.name,
        description: order.description,
        order_id: order.orderId,
        prefill: {
          name: user?.username || ''
        },
        theme: {
          color: '#0f766e'
        },
        handler: async (response) => {
          const result = await verifySubscriptionPayment(token, response);
          await refreshAccessPolicy(token, {
            ...user,
            accessLevel: result.accessLevel,
            allowedPages: result.allowedPages
          });
          setMessage(result.message || 'Subscription activated.');
          setPlan(prev => ({ ...prev, currentAccessLevel: result.accessLevel }));
          setPaying(false);
        },
        modal: {
          ondismiss: () => setPaying(false)
        }
      });

      checkout.open();
    } catch (err) {
      setError(err.message || 'Unable to complete payment.');
      setPaying(false);
    }
  };

  const hasAdvancedAccess = user?.accessLevel === 'ADMIN' || user?.accessLevel === 'SUBSCRIBER';

  return (
    <div className="subscription-page">
      <div className="subscription-header">
        <span className="subscription-eyebrow"><Crown size={16} /> Advanced access</span>
        <h1 className="page-title">Subscription</h1>
        <p className="page-subtitle">Upgrade to subscriber access after successful payment.</p>
      </div>

      {error && <div className="subscription-alert error">{error}</div>}
      {message && <div className="subscription-alert success">{message}</div>}

      <div className="subscription-card">
        <div className="subscription-plan">
          <div>
            <h2>Subscriber</h2>
            <p>Unlock the pages your admin has enabled for subscribers.</p>
          </div>
          <strong>{loading ? '...' : formatAmount(plan?.amountPaise)}</strong>
        </div>

        <div className="subscription-benefits">
          <span><CheckCircle2 size={18} /> Advanced analytics access when enabled</span>
          <span><CheckCircle2 size={18} /> Category and reporting tools when enabled</span>
          <span><CheckCircle2 size={18} /> Admin can still adjust your access anytime</span>
        </div>

        {hasAdvancedAccess ? (
          <div className="subscription-status">
            <CheckCircle2 size={20} />
            Your account already has {user?.accessLevel} access.
          </div>
        ) : (
          <button
            className="btn btn-primary subscription-pay-btn"
            type="button"
            onClick={startPayment}
            disabled={loading || paying}
          >
            {paying ? <RefreshCw size={18} className="spin-icon" /> : <CreditCard size={18} />}
            {paying ? 'Opening payment...' : `Subscribe for ${formatAmount(plan?.amountPaise)}`}
          </button>
        )}

        {plan && !plan.paymentConfigured && (
          <p className="subscription-note">
            Payment is not configured yet. Add Razorpay keys in backend environment to enable live checkout.
          </p>
        )}
      </div>
    </div>
  );
};

export default Subscription;
