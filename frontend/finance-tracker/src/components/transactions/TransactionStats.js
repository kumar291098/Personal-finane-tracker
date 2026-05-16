import React from 'react';
import StatsCard from '../shared/StatsCard';

const TransactionStats = ({ stats }) => {
  return (
    <div className="transactions-stats">
      <StatsCard
        title="Filtered Income"
        value={stats.income}
        type="success"
        trend="up"
        subtitle="From filtered results"
      />
      <StatsCard
        title="Filtered Expenses"
        value={stats.expenses}
        type="error"
        trend="down"
        subtitle="From filtered results"
      />
      <StatsCard
        title="Net Amount"
        value={stats.balance}
        type={stats.balance >= 0 ? 'success' : 'error'}
        trend={stats.balance >= 0 ? 'up' : 'down'}
        subtitle="Income - Expenses"
      />
      <StatsCard
        title="Transactions"
        value={stats.count}
        type="primary"
        subtitle="Matching filters"
        isCount
      />
    </div>
  );
};

export default TransactionStats;
