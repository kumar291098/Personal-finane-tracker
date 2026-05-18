import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Rocket, ShieldCheck, User, Wallet, AlertTriangle, BarChart3, Lightbulb } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
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

      <div className="auth-content">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <span className="auth-logo-icon"><Wallet size={28} /></span>
              <span className="auth-logo-text">FinanceTracker</span>
            </div>
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">
              Sign in to review spending, add transactions, and keep your money picture current.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="error-message">
                <AlertTriangle size={16} />
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="username" className="form-label">Username</label>
              <div className="input-wrapper">
                <span className="input-icon"><User size={18} /></span>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your username"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="input-wrapper">
                <span className="input-icon"><Lock size={18} /></span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-wrapper">
                <input type="checkbox" className="checkbox" />
                <span className="checkbox-label">Remember me</span>
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Signing in...
                </>
              ) : (
                <>
                  <Rocket size={18} />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p className="auth-footer-text">
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">
                Create one now
              </Link>
            </p>
          </div>

          <div className="auth-features">
            <div className="feature-item">
              <BarChart3 size={18} />
              <span className="feature-text">Track Expenses</span>
            </div>
            <div className="feature-item">
              <Lightbulb size={18} />
              <span className="feature-text">Smart Insights</span>
            </div>
            <div className="feature-item">
              <ShieldCheck size={18} />
              <span className="feature-text">Secure & Private</span>
            </div>
          </div>
        </div>

        <div className="auth-demo">
          <div className="demo-card auth-showcase">
            <h3 className="demo-title">Fast Money Checkups</h3>
            <p className="demo-description">
              Log in to see balances, category trends, and recent activity in one focused workspace.
            </p>
            <div className="auth-preview-card">
              <div className="auth-preview-topline">
                <span>May balance</span>
                <strong>₹9,172</strong>
              </div>
              <div className="auth-preview-bars">
                <span style={{ height: '44%' }}></span>
                <span style={{ height: '68%' }}></span>
                <span style={{ height: '38%' }}></span>
                <span style={{ height: '82%' }}></span>
                <span style={{ height: '56%' }}></span>
              </div>
              <div className="auth-preview-row">
                <span>Food & Dining</span>
                <strong>₹181</strong>
              </div>
              <div className="auth-preview-row">
                <span>Transportation</span>
                <strong>₹56</strong>
              </div>
            </div>
            <div className="demo-benefits">
              <div className="benefit-item">
                <BarChart3 size={20} />
                <div className="benefit-content">
                  <h4>Clear Overview</h4>
                  <p>Income, expenses, and balance are visible immediately.</p>
                </div>
              </div>
              <div className="benefit-item">
                <ShieldCheck size={20} />
                <div className="benefit-content">
                  <h4>Private Workspace</h4>
                  <p>Your account keeps transactions tied to your login.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
