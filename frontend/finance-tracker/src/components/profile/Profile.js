import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    currency: 'INR',
    timezone: 'Asia/Kolkata'
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [preferences, setPreferences] = useState({
    theme: 'light',
    notifications: {
      email: true,
      push: false,
      weekly: true,
      monthly: true
    },
    privacy: {
      profileVisible: false,
      dataSharing: false
    }
  });

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    // Here you would typically make an API call to update profile
    console.log('Profile updated:', profileData);
    alert('Profile updated successfully!');
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    // Here you would typically make an API call to change password
    console.log('Password change requested');
    alert('Password changed successfully!');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handlePreferencesSubmit = (e) => {
    e.preventDefault();
    // Here you would typically make an API call to update preferences
    console.log('Preferences updated:', preferences);
    alert('Preferences updated successfully!');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Here you would typically make an API call to delete account
      console.log('Account deletion requested');
      alert('Account deletion requested. You will be contacted within 24 hours.');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile Info', icon: '👤' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'danger', label: 'Danger Zone', icon: '⚠️' }
  ];

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="header-content">
          <h1 className="page-title">Account Settings</h1>
          <p className="page-subtitle">
            Manage your account information and preferences
          </p>
        </div>
        
        <div className="user-avatar-large">
          {user?.username?.charAt(0).toUpperCase() || 'U'}
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-sidebar">
          <nav className="profile-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="profile-main">
          {activeTab === 'profile' && (
            <div className="tab-content">
              <div className="section-header">
                <h2 className="section-title">Profile Information</h2>
                <p className="section-subtitle">
                  Update your personal information and contact details
                </p>
              </div>

              <form onSubmit={handleProfileSubmit} className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      value={profileData.username}
                      onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      className="form-input"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="form-input"
                      placeholder="John"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="form-input"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      className="form-input"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      value={profileData.dateOfBirth}
                      onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Currency</label>
                    <select
                      value={profileData.currency}
                      onChange={(e) => setProfileData(prev => ({ ...prev, currency: e.target.value }))}
                      className="form-select"
                    >
                      <option value="INR">INR - Indian Rupee</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="JPY">JPY - Japanese Yen</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Timezone</label>
                    <select
                      value={profileData.timezone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, timezone: e.target.value }))}
                      className="form-select"
                    >
                      <option value="Asia/Kolkata">IST - India Standard Time</option>
                      <option value="UTC">UTC</option>
                      <option value="EST">EST - Eastern Time</option>
                      <option value="PST">PST - Pacific Time</option>
                      <option value="GMT">GMT - Greenwich Mean Time</option>
                    </select>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="tab-content">
              <div className="section-header">
                <h2 className="section-title">Security Settings</h2>
                <p className="section-subtitle">
                  Keep your account secure by updating your password
                </p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="profile-form">
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="form-input"
                    minLength={6}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="form-input"
                    minLength={6}
                    required
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    Change Password
                  </button>
                </div>
              </form>

              <div className="security-info">
                <h3 className="info-title">Security Tips</h3>
                <ul className="security-tips">
                  <li>Use a strong password with at least 8 characters</li>
                  <li>Include uppercase, lowercase, numbers, and symbols</li>
                  <li>Don't reuse passwords from other accounts</li>
                  <li>Consider using a password manager</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="tab-content">
              <div className="section-header">
                <h2 className="section-title">Preferences</h2>
                <p className="section-subtitle">
                  Customize your experience and notification settings
                </p>
              </div>

              <form onSubmit={handlePreferencesSubmit} className="profile-form">
                <div className="preference-section">
                  <h3 className="preference-title">Appearance</h3>
                  <div className="form-group">
                    <label className="form-label">Theme</label>
                    <select
                      value={preferences.theme}
                      onChange={(e) => setPreferences(prev => ({ ...prev, theme: e.target.value }))}
                      className="form-select"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto (System)</option>
                    </select>
                  </div>
                </div>

                <div className="preference-section">
                  <h3 className="preference-title">Notifications</h3>
                  <div className="checkbox-group">
                    <label className="checkbox-wrapper">
                      <input
                        type="checkbox"
                        checked={preferences.notifications.email}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, email: e.target.checked }
                        }))}
                      />
                      <span className="checkbox-label">Email notifications</span>
                    </label>
                    <label className="checkbox-wrapper">
                      <input
                        type="checkbox"
                        checked={preferences.notifications.push}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, push: e.target.checked }
                        }))}
                      />
                      <span className="checkbox-label">Push notifications</span>
                    </label>
                    <label className="checkbox-wrapper">
                      <input
                        type="checkbox"
                        checked={preferences.notifications.weekly}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, weekly: e.target.checked }
                        }))}
                      />
                      <span className="checkbox-label">Weekly reports</span>
                    </label>
                    <label className="checkbox-wrapper">
                      <input
                        type="checkbox"
                        checked={preferences.notifications.monthly}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, monthly: e.target.checked }
                        }))}
                      />
                      <span className="checkbox-label">Monthly summaries</span>
                    </label>
                  </div>
                </div>

                <div className="preference-section">
                  <h3 className="preference-title">Privacy</h3>
                  <div className="checkbox-group">
                    <label className="checkbox-wrapper">
                      <input
                        type="checkbox"
                        checked={preferences.privacy.profileVisible}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          privacy: { ...prev.privacy, profileVisible: e.target.checked }
                        }))}
                      />
                      <span className="checkbox-label">Make profile visible to others</span>
                    </label>
                    <label className="checkbox-wrapper">
                      <input
                        type="checkbox"
                        checked={preferences.privacy.dataSharing}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          privacy: { ...prev.privacy, dataSharing: e.target.checked }
                        }))}
                      />
                      <span className="checkbox-label">Allow anonymous data sharing for improvements</span>
                    </label>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    Save Preferences
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'danger' && (
            <div className="tab-content">
              <div className="section-header">
                <h2 className="section-title">Danger Zone</h2>
                <p className="section-subtitle">
                  Irreversible and destructive actions
                </p>
              </div>

              <div className="danger-section">
                <div className="danger-item">
                  <div className="danger-info">
                    <h3 className="danger-title">Logout from all devices</h3>
                    <p className="danger-description">
                      This will log you out from all devices and invalidate all active sessions.
                    </p>
                  </div>
                  <button className="btn btn-secondary" onClick={logout}>
                    Logout Everywhere
                  </button>
                </div>

                <div className="danger-item">
                  <div className="danger-info">
                    <h3 className="danger-title">Delete Account</h3>
                    <p className="danger-description">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                  </div>
                  <button className="btn btn-error" onClick={handleDeleteAccount}>
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
