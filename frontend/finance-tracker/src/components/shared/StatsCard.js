import React from 'react';
import './StatsCard.css';

const StatsCard = ({ 
  title, 
  value, 
  icon, 
  type = 'primary', 
  trend, 
  subtitle,
  isCount = false,
  onClick 
}) => {
  const formatValue = (val) => {
    if (isCount) {
      return val.toLocaleString();
    }
    
    if (typeof val === 'number') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(Math.abs(val));
    }
    
    return val;
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    return trend === 'up' ? '📈' : '📉';
  };

  const getTypeClass = () => {
    switch (type) {
      case 'success': return 'stats-card-success';
      case 'error': return 'stats-card-error';
      case 'warning': return 'stats-card-warning';
      default: return 'stats-card-primary';
    }
  };

  return (
    <div 
      className={`stats-card ${getTypeClass()} ${onClick ? 'stats-card-clickable' : ''}`}
      onClick={onClick}
    >
      <div className="stats-card-header">
        <div className="stats-card-icon">
          {icon}
        </div>
        {trend && (
          <div className={`stats-card-trend trend-${trend}`}>
            {getTrendIcon()}
          </div>
        )}
      </div>
      
      <div className="stats-card-content">
        <div className="stats-card-value">
          {!isCount && value < 0 && <span className="negative-sign">-</span>}
          {formatValue(value)}
        </div>
        <div className="stats-card-title">{title}</div>
        {subtitle && (
          <div className="stats-card-subtitle">{subtitle}</div>
        )}
      </div>
      
      <div className="stats-card-background">
        <div className="stats-card-pattern"></div>
      </div>
    </div>
  );
};

export default StatsCard;