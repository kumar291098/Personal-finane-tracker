import React, { useCallback, useEffect, useState } from 'react';
import { BadgeCheck, CheckCircle2, Crown, CreditCard, RefreshCw, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  createSubscriptionOrder,
  fetchSubscriptionPlan,
  submitManualUpiPayment,
  verifySubscriptionPayment
} from '../../services/subscriptionService';
import { resolveMediaUrl } from '../../utils/mediaUrl';
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

const ACTIVATION_STORAGE_KEY = 'subscriptionActivationSuccess';

const Subscription = () => {
  const { token, user, refreshAccessPolicy } = useAuth();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [reference, setReference] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activation, setActivation] = useState(() => {
    const storedActivation = sessionStorage.getItem(ACTIVATION_STORAGE_KEY);
    if (!storedActivation) {
      return null;
    }

    sessionStorage.removeItem(ACTIVATION_STORAGE_KEY);
    try {
      return JSON.parse(storedActivation);
    } catch (error) {
      return null;
    }
  });

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
    setActivation(null);
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
            subscriberUntil: result.subscriberUntil || '',
            allowedPages: result.allowedPages
          });
          setMessage(result.message || 'Subscription activated.');
          const activationState = {
            title: 'Thank you for subscribing',
            detail: 'Your subscriber access is active for one month.'
          };
          sessionStorage.setItem(ACTIVATION_STORAGE_KEY, JSON.stringify(activationState));
          setActivation(activationState);
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

  const submitManualPayment = async (event) => {
    event.preventDefault();
    const cleanedReference = reference.trim();
    if (!cleanedReference.toUpperCase().startsWith('TEST-SUB-')) {
      setError('Enter a valid demo UTR that starts with TEST-SUB-. Invalid UTRs are not sent for admin review.');
      setMessage('');
      return;
    }

    setPaying(true);
    setError('');
    setMessage('');
    setActivation(null);
    try {
      const result = await submitManualUpiPayment(token, cleanedReference);
      setReference('');
      setMessage(result.message || 'Payment reference submitted for review.');
      if (result.accessLevel === 'SUBSCRIBER') {
        await refreshAccessPolicy(token, {
          ...user,
          accessLevel: result.accessLevel,
          subscriberUntil: result.subscriberUntil || '',
          allowedPages: result.allowedPages || []
        });
        const activationState = {
          title: 'Thank you for subscribing',
          detail: 'Your demo reference was verified successfully. Subscriber access is active for one month.'
        };
        sessionStorage.setItem(ACTIVATION_STORAGE_KEY, JSON.stringify(activationState));
        setActivation(activationState);
        setPlan(prev => ({ ...prev, currentAccessLevel: result.accessLevel }));
      }
    } catch (err) {
      setError(err.message || 'Unable to submit payment reference.');
    } finally {
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
      {(activation || message?.toLowerCase().includes('activated')) && (
        <section className="subscription-thankyou">
          <span className="subscription-thankyou-mark">
            <CheckCircle2 size={52} />
          </span>
          <span className="subscription-thankyou-badge">
            <Crown size={16} />
            Subscriber activated
          </span>
          <h2>{activation?.title || 'Thank you for subscribing'}</h2>
          <p>{activation?.detail || 'Your subscriber access is active for one month.'}</p>
          <div className="subscription-thankyou-row">
            <span><BadgeCheck size={18} /> Verified reference</span>
            <span><Sparkles size={18} /> Advanced access unlocked</span>
          </div>
        </section>
      )}

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
          <>
            {plan?.manualUpiEnabled && (
              <form className="upi-payment-box" onSubmit={submitManualPayment}>
                <div className="upi-qr-wrap">
                  {plan.upiQrImageUrl ? (
                    <img src={resolveMediaUrl(plan.upiQrImageUrl)} alt="UPI payment QR code" />
                  ) : (
                    <div className="upi-qr-placeholder">QR</div>
                  )}
                </div>
                <div className="upi-payment-form">
                  <h3>Pay with UPI QR</h3>
                  {plan.upiId && <p>UPI ID: <strong>{plan.upiId}</strong></p>}
                  <p>Enter the valid demo UTR only. Correct demo UTRs activate automatically; invalid values are rejected here.</p>
                  <input
                    className="input"
                    value={reference}
                    onChange={(event) => setReference(event.target.value)}
                    placeholder="TEST-SUB-123456"
                    required
                    minLength={15}
                  />
                  <button className="btn btn-primary" type="submit" disabled={paying}>
                    {paying ? <RefreshCw size={18} className="spin-icon" /> : <CheckCircle2 size={18} />}
                    Verify reference
                  </button>
                </div>
              </form>
            )}

            {plan?.paymentConfigured && (
              <button
                className="btn btn-secondary subscription-pay-btn"
                type="button"
                onClick={startPayment}
                disabled={loading || paying}
              >
                {paying ? <RefreshCw size={18} className="spin-icon" /> : <CreditCard size={18} />}
                {paying ? 'Opening payment...' : `Pay online ${formatAmount(plan?.amountPaise)}`}
              </button>
            )}
          </>
        )}

        {plan && !plan.paymentConfigured && !plan.manualUpiEnabled && (
          <p className="subscription-note">
            Payment is not configured yet. Add UPI QR settings or Razorpay keys in backend environment.
          </p>
        )}
      </div>
    </div>
  );
};

export default Subscription;
