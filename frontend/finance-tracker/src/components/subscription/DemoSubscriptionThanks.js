import React, { useEffect, useState } from 'react';
import { CheckCircle2, Copy, Crown, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchDemoSubscriptionReference } from '../../services/subscriptionService';
import './DemoSubscriptionThanks.css';

const DemoSubscriptionThanks = () => {
  const [reference, setReference] = useState('');
  const [expiresInMinutes, setExpiresInMinutes] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReference = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchDemoSubscriptionReference();
      setReference(data.reference);
      setExpiresInMinutes(data.expiresInMinutes || 30);
    } catch (err) {
      setError(err.message || 'Unable to generate demo reference.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReference();
  }, []);

  const copyReference = async () => {
    if (!reference) return;
    await navigator.clipboard.writeText(reference);
  };

  return (
    <main className="demo-thanks-page">
      <section className="demo-thanks-card">
        <span className="demo-thanks-icon"><Crown size={30} /></span>
        <h1>Thank you for subscribing</h1>
        <p>Use this demo reference on the Subscription page. A valid reference activates subscriber access automatically.</p>

        {error && <div className="demo-thanks-alert">{error}</div>}

        <div className="demo-reference-box">
          <span>Demo reference</span>
          <strong>{loading ? 'Generating...' : reference}</strong>
          <small>Expires in {expiresInMinutes} minutes. Wrong or expired references are denied.</small>
        </div>

        <div className="demo-thanks-actions">
          <button className="btn btn-secondary" type="button" onClick={loadReference} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spin-icon' : ''} />
            New reference
          </button>
          <button className="btn btn-primary" type="button" onClick={copyReference} disabled={!reference}>
            <Copy size={16} />
            Copy reference
          </button>
        </div>

        <Link className="demo-subscription-link" to="/subscription">
          <CheckCircle2 size={16} />
          Open Subscription
        </Link>
      </section>
    </main>
  );
};

export default DemoSubscriptionThanks;
