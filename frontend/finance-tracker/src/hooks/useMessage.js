import { useState } from 'react';

export const useMessage = () => {
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const showMessage = (message, type = 'success') => {
    if (type === 'success') {
      setSuccess(message);
      setError('');
    } else {
      setError(message);
      setSuccess('');
    }
    
    setTimeout(() => {
      setSuccess('');
      setError('');
    }, 5000);
  };

  return { success, error, showMessage };
};