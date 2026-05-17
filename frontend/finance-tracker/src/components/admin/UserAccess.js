import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, ShieldCheck, SlidersHorizontal, UserCog } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { APP_PAGES } from '../../config/pages';
import {
  fetchAccessPolicies,
  fetchSubscriptionRequests,
  fetchSubscriptionSettings,
  fetchUsersForAccess,
  reviewSubscriptionRequest,
  updateSubscriptionSettings,
  updateAccessPolicy,
  updateUserAccess
} from '../../services/adminService';
import './UserAccess.css';

const ACCESS_LEVELS = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'SUBSCRIBER', label: 'Subscriber' },
  { value: 'FREE', label: 'Free' }
];

const UserAccess = () => {
  const { token, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [subscriptionRequests, setSubscriptionRequests] = useState([]);
  const [subscriptionSettings, setSubscriptionSettings] = useState({
    amountPaise: 9900,
    upiId: '',
    upiQrImageUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState(null);
  const [savingPolicy, setSavingPolicy] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [reviewingRequestId, setReviewingRequestId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadAccessData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [userData, policyData] = await Promise.all([
        fetchUsersForAccess(token),
        fetchAccessPolicies(token)
      ]);
      const [requestData, settingsData] = await Promise.all([
        fetchSubscriptionRequests(token),
        fetchSubscriptionSettings(token)
      ]);
      setUsers(userData);
      setPolicies(policyData.policies || []);
      setSubscriptionRequests(requestData || []);
      setSubscriptionSettings({
        amountPaise: settingsData.amountPaise || 9900,
        upiId: settingsData.upiId || '',
        upiQrImageUrl: settingsData.upiQrImageUrl || ''
      });
    } catch (err) {
      setError(err.message || 'Unable to load access controls.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadAccessData();
  }, [loadAccessData]);

  const counts = useMemo(() => users.reduce((summary, item) => ({
    ...summary,
    [item.accessLevel]: (summary[item.accessLevel] || 0) + 1
  }), {}), [users]);

  const handleAccessChange = async (targetUser, accessLevel) => {
    setSavingUserId(targetUser.id);
    setError('');
    setMessage('');
    try {
      const updatedUser = await updateUserAccess(token, targetUser.id, accessLevel);
      setUsers(prev => prev.map(item => item.id === updatedUser.id ? updatedUser : item));
      setMessage(`${updatedUser.username} is now ${updatedUser.accessLevel}.`);
    } catch (err) {
      setError(err.message || 'Unable to update access.');
    } finally {
      setSavingUserId(null);
    }
  };

  const handleSettingsSubmit = async (event) => {
    event.preventDefault();
    setSavingSettings(true);
    setError('');
    setMessage('');
    try {
      const updatedSettings = await updateSubscriptionSettings(token, subscriptionSettings);
      setSubscriptionSettings({
        amountPaise: updatedSettings.amountPaise,
        upiId: updatedSettings.upiId || '',
        upiQrImageUrl: updatedSettings.upiQrImageUrl || ''
      });
      setMessage('Subscription settings updated.');
    } catch (err) {
      setError(err.message || 'Unable to update subscription settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleReviewRequest = async (requestId, action) => {
    setReviewingRequestId(requestId);
    setError('');
    setMessage('');
    try {
      await reviewSubscriptionRequest(token, requestId, action);
      setSubscriptionRequests(prev => prev.filter(item => item.id !== requestId));
      setMessage(action === 'approve' ? 'Subscription approved.' : 'Subscription request rejected.');
      if (action === 'approve') {
        setUsers(await fetchUsersForAccess(token));
      }
    } catch (err) {
      setError(err.message || 'Unable to review subscription request.');
    } finally {
      setReviewingRequestId(null);
    }
  };

  const handlePolicyToggle = async (policy, pageKey) => {
    const currentlyAllowed = policy.allowedPages.includes(pageKey);
    const nextPages = currentlyAllowed
      ? policy.allowedPages.filter(page => page !== pageKey)
      : [...policy.allowedPages, pageKey];

    setSavingPolicy(policy.accessLevel);
    setError('');
    setMessage('');
    try {
      const updatedPolicy = await updateAccessPolicy(token, policy.accessLevel, nextPages);
      setPolicies(prev => prev.map(item =>
        item.accessLevel === updatedPolicy.accessLevel ? updatedPolicy : item
      ));
      setMessage(`${updatedPolicy.accessLevel} page access updated.`);
    } catch (err) {
      setError(err.message || 'Unable to update page access.');
    } finally {
      setSavingPolicy('');
    }
  };

  const pageOptions = APP_PAGES.filter(page => !['access', 'monitoring'].includes(page.key));

  return (
    <div className="access-page">
      <div className="access-header">
        <div>
          <span className="access-eyebrow"><ShieldCheck size={16} /> Admin control</span>
          <h1 className="page-title">User Access</h1>
          <p className="page-subtitle">Manage who is admin, subscriber, or free user.</p>
        </div>
        <button className="btn btn-secondary" onClick={loadAccessData} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin-icon' : ''} />
          Refresh
        </button>
      </div>

      <div className="access-summary">
        <div className="access-summary-item admin">
          <strong>{counts.ADMIN || 0}</strong>
          <span>Admins</span>
        </div>
        <div className="access-summary-item subscriber">
          <strong>{counts.SUBSCRIBER || 0}</strong>
          <span>Subscribers</span>
        </div>
        <div className="access-summary-item free">
          <strong>{counts.FREE || 0}</strong>
          <span>Free users</span>
        </div>
      </div>

      {error && <div className="access-alert error">{error}</div>}
      {message && <div className="access-alert success">{message}</div>}

      <div className="access-panel">
        <div className="access-panel-header">
          <div>
            <h2>Subscription Settings</h2>
            <span>Set the fee and QR image shown to users.</span>
          </div>
        </div>

        <form className="subscription-settings-form" onSubmit={handleSettingsSubmit}>
          <label>
            <span>Fee in rupees</span>
            <input
              className="input"
              type="number"
              min="1"
              value={Math.round((subscriptionSettings.amountPaise || 0) / 100)}
              onChange={(event) => setSubscriptionSettings(prev => ({
                ...prev,
                amountPaise: Number(event.target.value || 0) * 100
              }))}
              required
            />
          </label>
          <label>
            <span>UPI ID</span>
            <input
              className="input"
              value={subscriptionSettings.upiId}
              onChange={(event) => setSubscriptionSettings(prev => ({ ...prev, upiId: event.target.value }))}
              placeholder="yourupi@bank"
            />
          </label>
          <label>
            <span>QR image URL</span>
            <input
              className="input"
              type="url"
              value={subscriptionSettings.upiQrImageUrl}
              onChange={(event) => setSubscriptionSettings(prev => ({ ...prev, upiQrImageUrl: event.target.value }))}
              placeholder="https://example.com/upi-qr.png"
            />
          </label>
          {subscriptionSettings.upiQrImageUrl && (
            <div className="subscription-settings-preview">
              <img src={subscriptionSettings.upiQrImageUrl} alt="Subscription QR preview" />
            </div>
          )}
          <button className="btn btn-primary" type="submit" disabled={savingSettings}>
            {savingSettings ? 'Saving...' : 'Save Subscription Settings'}
          </button>
        </form>
      </div>

      <div className="access-panel">
        <div className="access-panel-header">
          <div>
            <h2>Page Access</h2>
            <span>Choose pages visible to each account level.</span>
          </div>
          <SlidersHorizontal size={18} />
        </div>

        {loading ? (
          <div className="access-empty">Loading page access...</div>
        ) : (
          <div className="policy-grid">
            {policies
              .filter(policy => policy.accessLevel !== 'ADMIN')
              .map(policy => (
                <div className="policy-card" key={policy.accessLevel}>
                  <div className="policy-card-header">
                    <span className={`access-badge ${policy.accessLevel.toLowerCase()}`}>
                      {policy.accessLevel}
                    </span>
                    <small>{policy.allowedPages.length} pages enabled</small>
                  </div>
                  <div className="policy-options">
                    {pageOptions.map(page => (
                      <label className="policy-option" key={`${policy.accessLevel}-${page.key}`}>
                        <input
                          type="checkbox"
                          checked={policy.allowedPages.includes(page.key)}
                          disabled={savingPolicy === policy.accessLevel || page.key === 'profile'}
                          onChange={() => handlePolicyToggle(policy, page.key)}
                        />
                        <span>{page.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      <div className="access-panel">
        <div className="access-panel-header">
          <div>
            <h2>UPI Subscription Requests</h2>
            <span>Approve only after matching UTR/reference with your bank or UPI app.</span>
          </div>
          <span>{subscriptionRequests.length} pending</span>
        </div>

        {loading ? (
          <div className="access-empty">Loading requests...</div>
        ) : subscriptionRequests.length === 0 ? (
          <div className="access-empty">No pending UPI subscription requests.</div>
        ) : (
          <div className="subscription-request-list">
            {subscriptionRequests.map(item => (
              <div className="subscription-request-row" key={item.id}>
                <div>
                  <strong>{item.username}</strong>
                  <small>{item.email || 'No email'} | UTR: {item.reference}</small>
                </div>
                <span>{new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR'
                }).format(item.amountPaise / 100)}</span>
                <div className="subscription-request-actions">
                  <button
                    type="button"
                    className="btn btn-success btn-sm"
                    disabled={reviewingRequestId === item.id}
                    onClick={() => handleReviewRequest(item.id, 'approve')}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="btn btn-error btn-sm"
                    disabled={reviewingRequestId === item.id}
                    onClick={() => handleReviewRequest(item.id, 'reject')}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="access-panel">
        <div className="access-panel-header">
          <h2>Accounts</h2>
          <span>{users.length} total</span>
        </div>

        {loading ? (
          <div className="access-empty">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="access-empty">No users found.</div>
        ) : (
          <div className="access-table">
            {users.map(item => {
              const isSelf = item.id === user?.id;
              const isProtectedAdmin = item.username === 'demo';
              return (
                <div className="access-row" key={item.id}>
                  <div className="access-user">
                    <span className="access-avatar"><UserCog size={18} /></span>
                    <div>
                      <strong>{item.username}</strong>
                      <small>{item.email || item.phone || 'No contact set'}</small>
                    </div>
                  </div>
                  <span className={`access-badge ${item.accessLevel.toLowerCase()}`}>
                    {item.accessLevel}
                  </span>
                  <small>{item.subscriberUntil ? `Until ${new Date(item.subscriberUntil).toLocaleDateString('en-IN')}` : ''}</small>
                  <select
                    value={item.accessLevel}
                    disabled={savingUserId === item.id || isProtectedAdmin || isSelf}
                    onChange={(event) => handleAccessChange(item, event.target.value)}
                    aria-label={`Change access for ${item.username}`}
                  >
                    {ACCESS_LEVELS.map(option => (
                      <option value={option.value} key={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAccess;
