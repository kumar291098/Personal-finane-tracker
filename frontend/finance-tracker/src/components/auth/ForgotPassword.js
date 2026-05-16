import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Eye, EyeOff, KeyRound, Lock, Mail, Phone, ShieldCheck, Wallet } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';
import './Auth.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('request');
  const [formData, setFormData] = useState({
    identifier: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [testOtp, setTestOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    setFormData(prev => ({
      ...prev,
      [event.target.name]: event.target.value
    }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const requestOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setTestOtp('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password/request-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identifier: formData.identifier
        })
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Unable to send OTP.');
      }

      const data = await response.json();
      setTestOtp(data.otpForTesting || '');
      setStep('verify');
      setSuccess(data.otpForTesting
        ? 'OTP generated for testing. Use the code shown below.'
        : 'OTP sent. Check your registered email inbox.');
    } catch (err) {
      setError(err.message || 'Unable to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();

    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identifier: formData.identifier,
          otp: formData.otp,
          newPassword: formData.newPassword
        })
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Unable to reset password.');
      }

      setSuccess('Password reset successfully. Redirecting to login...');
      setTimeout(() => navigate('/login'), 1400);
    } catch (err) {
      setError(err.message || 'Unable to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-pattern"></div>
        <div className="auth-gradient"></div>
      </div>

      <div className="auth-content auth-content-single">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <span className="auth-logo-icon"><Wallet size={28} /></span>
              <span className="auth-logo-text">FinanceTracker</span>
            </div>
            <h1 className="auth-title">Reset Password</h1>
            <p className="auth-subtitle">
              Verify your account with OTP before creating a new password.
            </p>
          </div>

          <form onSubmit={step === 'request' ? requestOtp : resetPassword} className="auth-form">
            {error && (
              <div className="error-message">
                <AlertTriangle size={16} />
                {error}
              </div>
            )}

            {success && (
              <div className="success-message">
                <CheckCircle2 size={16} />
                {success}
              </div>
            )}

            {testOtp && (
              <div className="otp-preview">
                <span>Testing OTP</span>
                <strong>{testOtp}</strong>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="identifier" className="form-label">Gmail, Phone, or Username</label>
              <div className="input-wrapper">
                <span className="input-icon"><KeyRound size={18} /></span>
                <input
                  type="text"
                  id="identifier"
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="email@gmail.com or mobile number"
                  required
                  autoComplete="username"
                  disabled={step === 'verify'}
                />
              </div>
            </div>

            {step === 'verify' && (
              <>
                <div className="form-group">
                  <label htmlFor="otp" className="form-label">OTP</label>
                  <div className="input-wrapper">
                    <span className="input-icon"><ShieldCheck size={18} /></span>
                    <input
                      type="text"
                      id="otp"
                      name="otp"
                      value={formData.otp}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter 6-digit OTP"
                      required
                      inputMode="numeric"
                      maxLength={6}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword" className="form-label">New Password</label>
                  <div className="input-wrapper">
                    <span className="input-icon"><Lock size={18} /></span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Create new password"
                      required
                      minLength={6}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(prev => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                  <div className="input-wrapper">
                    <span className="input-icon"><ShieldCheck size={18} /></span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Confirm new password"
                      required
                      minLength={6}
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="reset-methods">
              <span><Mail size={15} /> Gmail/email</span>
              <span><Phone size={15} /> Phone lookup</span>
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  {step === 'request' ? 'Generating OTP...' : 'Updating Password...'}
                </>
              ) : (
                <>
                  <KeyRound size={18} />
                  {step === 'request' ? 'Send OTP' : 'Verify OTP & Reset Password'}
                </>
              )}
            </button>

            {step === 'verify' && (
              <button
                type="button"
                className="auth-secondary-button"
                onClick={() => {
                  setStep('request');
                  setFormData(prev => ({ ...prev, otp: '', newPassword: '', confirmPassword: '' }));
                  setSuccess('');
                  setError('');
                  setTestOtp('');
                }}
              >
                Use different account
              </button>
            )}
          </form>

          <div className="auth-footer">
            <p className="auth-footer-text">
              Remembered it? <Link to="/login" className="auth-link">Back to login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
