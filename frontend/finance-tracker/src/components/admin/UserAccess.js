import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, ShieldCheck, UserCog } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchUsersForAccess, updateUserAccess } from '../../services/adminService';
import './UserAccess.css';

const ACCESS_LEVELS = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'SUBSCRIBER', label: 'Subscriber' },
  { value: 'FREE', label: 'Free' }
];

const UserAccess = () => {
  const { token, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchUsersForAccess(token);
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Unable to load users.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

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

  return (
    <div className="access-page">
      <div className="access-header">
        <div>
          <span className="access-eyebrow"><ShieldCheck size={16} /> Admin control</span>
          <h1 className="page-title">User Access</h1>
          <p className="page-subtitle">Manage who is admin, subscriber, or free user.</p>
        </div>
        <button className="btn btn-secondary" onClick={loadUsers} disabled={loading}>
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
