import React from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { formatCurrency } from '../utils/transactionUtils';

const StatsCard = ({ transactions }) => {
  const income = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  
  const expenses = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  
  const balance = income - expenses;

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon income">
          <TrendingUp size={24} color="#10b981" />
        </div>
        <div className="stat-info">
          <h3 className="stat-value positive">{formatCurrency(income)}</h3>
          <p className="stat-label">Total Income</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon expense">
          <TrendingDown size={24} color="#ef4444" />
        </div>
        <div className="stat-info">
          <h3 className="stat-value negative">{formatCurrency(expenses)}</h3>
          <p className="stat-label">Total Expenses</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon balance">
          <DollarSign size={24} color={balance >= 0 ? "#10b981" : "#ef4444"} />
        </div>
        <div className="stat-info">
          <h3 className={`stat-value ${balance >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(balance)}
          </h3>
          <p className="stat-label">Current Balance</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;