import React, { useState } from 'react';
import { Lock, User } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';
import './RegisterForm.css';

const RegisterForm = () => {
  const [user, setUser] = useState({
    username: '',
    password: ''
  });
  
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(null);

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
      });
      
      if (response.ok) {
        const result = await response.json();
        setMessage('User registered successfully!');
        setIsSuccess(true);
        setUser({ username: '', password: '' });
      } else {
        setMessage('Error registering user');
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage('Network error: ' + error.message);
      setIsSuccess(false);
    }
  };

  return (
    <div className="register-form">
      <h2>Register for Finance Tracker</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <div className="field-row">
            <span className="field-icon" aria-hidden="true"><User size={18} /></span>
            <input
              type="text"
              id="username"
              name="username"
              value={user.username}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <div className="field-row">
            <span className="field-icon" aria-hidden="true"><Lock size={18} /></span>
            <input
              type="password"
              id="password"
              name="password"
              value={user.password}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <button type="submit">Register</button>
      </form>
      {message && (
        <p className={isSuccess ? 'success' : 'error'}>
          {message}
        </p>
      )}
    </div>
  );
};

export default RegisterForm;
