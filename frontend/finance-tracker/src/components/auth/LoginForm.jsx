import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config/api';
import './LoginForm.css';

const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(null);

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });
      
      if (response.ok) {
        const result = await response.json();
        setMessage('Login successful!');
        setIsSuccess(true);
        // Use auth context login function
        await login({
          username: credentials.username,
          password: credentials.password
        });
        // Redirect to dashboard after successful login
        navigate('/dashboard');
      } else {
        setMessage('Error logging in');
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage('Network error: ' + error.message);
      setIsSuccess(false);
    }
  };

  return (
    <div className="login-form">
      <h2>Login to Finance Tracker</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={credentials.username}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      {message && (
        <p className={isSuccess ? 'success' : 'error'}>
          {message}
        </p>
      )}
    </div>
  );
};

export default LoginForm;
