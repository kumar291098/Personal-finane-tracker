import { useState, useEffect } from 'react';
import { transactionService } from '../services/transactionService';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await transactionService.getUserTransactions();
      setTransactions(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError('Failed to fetch transactions. Please try again.');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return { transactions, setTransactions, loading, error, fetchTransactions };
};
