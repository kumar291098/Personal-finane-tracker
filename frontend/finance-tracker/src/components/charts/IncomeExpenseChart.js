import React from 'react';
import { formatCurrency } from '../../utils/transactionUtils';
import './Charts.css';

const IncomeExpenseChart = ({ transactions }) => {
  // Calculate monthly data
  const monthlyData = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.transactionDate);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!acc[monthKey]) {
      acc[monthKey] = { income: 0, expense: 0, month: monthKey };
    }
    
    if (transaction.type === 'INCOME') {
      acc[monthKey].income += transaction.amount;
    } else {
      acc[monthKey].expense += transaction.amount;
    }
    
    return acc;
  }, {});

  // Convert to array and sort by month
  const chartData = Object.values(monthlyData)
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6); // Show last 6 months

  const maxAmount = Math.max(
    ...chartData.flatMap(d => [d.income, d.expense]),
    1000 // Minimum scale
  );

  const formatMonth = (monthKey) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      year: '2-digit',
      timeZone: 'Asia/Kolkata'
    });
  };

  if (chartData.length === 0) {
    return (
      <div className="chart-container">
        <div className="chart-empty">
          <div className="empty-icon">📈</div>
          <p>No data available for comparison</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <div className="income-expense-chart">
        {/* Chart Bars */}
        <div className="chart-grid">
          {chartData.map((data, index) => {
            const incomeHeight = (data.income / maxAmount) * 100;
            const expenseHeight = (data.expense / maxAmount) * 100;
            
            return (
              <div key={data.month} className="chart-column">
                <div className="chart-bars-container">
                  <div 
                    className="chart-bar income-bar"
                    style={{ 
                      height: `${incomeHeight}%`,
                      animationDelay: `${index * 0.1}s`
                    }}
                    title={`Income: ${formatCurrency(data.income)}`}
                  />
                  <div 
                    className="chart-bar expense-bar"
                    style={{ 
                      height: `${expenseHeight}%`,
                      animationDelay: `${index * 0.1 + 0.05}s`
                    }}
                    title={`Expense: ${formatCurrency(data.expense)}`}
                  />
                </div>
                <div className="chart-label">
                  {formatMonth(data.month)}
                </div>
                <div className="chart-values">
                  <div className="income-value">
                    +{formatCurrency(data.income)}
                  </div>
                  <div className="expense-value">
                    -{formatCurrency(data.expense)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chart Legend */}
        <div className="chart-legend horizontal">
          <div className="legend-item">
            <div className="legend-color income-color" />
            <span className="legend-label">Income</span>
          </div>
          <div className="legend-item">
            <div className="legend-color expense-color" />
            <span className="legend-label">Expenses</span>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="chart-summary">
          {chartData.map((data) => {
            const net = data.income - data.expense;
            return (
              <div key={data.month} className="summary-item">
                <div className="summary-month">{formatMonth(data.month)}</div>
                <div className={`summary-net ${net >= 0 ? 'positive' : 'negative'}`}>
                  {net >= 0 ? '+' : ''}{formatCurrency(net)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default IncomeExpenseChart;
