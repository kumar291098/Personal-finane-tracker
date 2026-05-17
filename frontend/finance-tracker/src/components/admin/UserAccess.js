import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, ShieldCheck, SlidersHorizontal, UserCog } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { APP_PAGES } from '../../config/pages';
import {
  fetchAccessPolicies,
  fetchUsersForAccess,
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
  const [loading, setLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState(null);
  const [savingPolicy, setSavingPolicy] = useState('');
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
      setUsers(userData);
      setPolicies(policyData.policies || []);
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
