import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Clock3,
  Database,
  Gauge,
  MemoryStick,
  RefreshCw,
  Server
} from 'lucide-react';
import { monitoringService } from '../../services/monitoringService';
import './Monitoring.css';

const metricConfigs = [
  { key: 'requests', name: 'http.server.requests', title: 'API Requests', icon: Activity },
  { key: 'loginRequests', name: 'http.server.requests', title: 'Login Timing', tags: ['uri:/api/auth/login'], icon: Clock3 },
  { key: 'memory', name: 'jvm.memory.used', title: 'JVM Memory Used', icon: MemoryStick },
  { key: 'uptime', name: 'process.uptime', title: 'Backend Uptime', icon: Server },
  { key: 'dbActive', name: 'hikaricp.connections.active', title: 'DB Active Connections', icon: Database },
  { key: 'dbPending', name: 'hikaricp.connections.pending', title: 'DB Pending Connections', icon: Gauge }
];

const Monitoring = () => {
  const [health, setHealth] = useState(null);
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadMonitoringData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const healthResult = await monitoringService.getHealth();
      const metricResults = await Promise.allSettled(
        metricConfigs.map(config => monitoringService.getMetric(config.name, config.tags || []))
      );

      const nextMetrics = metricResults.reduce((result, item, index) => {
        result[metricConfigs[index].key] = item.status === 'fulfilled' ? item.value : null;
        return result;
      }, {});

      setHealth(healthResult);
      setMetrics(nextMetrics);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || 'Unable to load monitoring data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMonitoringData();
  }, [loadMonitoringData]);

  const cards = useMemo(() => {
    return [
      {
        title: 'Backend Health',
        value: health?.status || 'Unknown',
        subtitle: health?.components?.db?.status ? `Database: ${health.components.db.status}` : 'Health endpoint',
        tone: health?.status === 'UP' ? 'success' : 'danger',
        icon: Server
      },
      {
        title: 'Avg API Time',
        value: formatDuration(getMeasurement(metrics.requests, 'TOTAL_TIME') / Math.max(getMeasurement(metrics.requests, 'COUNT'), 1)),
        subtitle: `${formatNumber(getMeasurement(metrics.requests, 'COUNT'))} recorded requests`,
        tone: 'primary',
        icon: Activity
      },
      {
        title: 'Login Avg Time',
        value: formatDuration(getMeasurement(metrics.loginRequests, 'TOTAL_TIME') / Math.max(getMeasurement(metrics.loginRequests, 'COUNT'), 1)),
        subtitle: `${formatNumber(getMeasurement(metrics.loginRequests, 'COUNT'))} login calls`,
        tone: 'warning',
        icon: Clock3
      },
      {
        title: 'Memory Used',
        value: formatBytes(getMeasurement(metrics.memory, 'VALUE')),
        subtitle: 'JVM heap and non-heap usage',
        tone: 'primary',
        icon: MemoryStick
      },
      {
        title: 'Uptime',
        value: formatDuration(getMeasurement(metrics.uptime, 'VALUE')),
        subtitle: 'Time since backend started',
        tone: 'success',
        icon: Server
      },
      {
        title: 'DB Connections',
        value: `${formatNumber(getMeasurement(metrics.dbActive, 'VALUE'))} active`,
        subtitle: `${formatNumber(getMeasurement(metrics.dbPending, 'VALUE'))} pending`,
        tone: getMeasurement(metrics.dbPending, 'VALUE') > 0 ? 'danger' : 'success',
        icon: Database
      }
    ];
  }, [health, metrics]);

  return (
    <div className="monitoring-page">
      <div className="monitoring-header">
        <div>
          <h1 className="page-title">Monitoring</h1>
          <p className="page-subtitle">Track backend health, API speed, memory, and database connection pressure.</p>
        </div>
        <button className="btn btn-primary" onClick={loadMonitoringData} disabled={loading}>
          <RefreshCw size={18} className={loading ? 'spin-icon' : ''} />
          Refresh
        </button>
      </div>

      {error && <div className="monitoring-error">{error}</div>}

      <div className="monitoring-grid">
        {cards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.title} className={`monitoring-card ${card.tone}`}>
              <div className="monitoring-card-icon">
                <Icon size={22} />
              </div>
              <div>
                <span className="monitoring-card-title">{card.title}</span>
                <strong>{loading ? 'Loading...' : card.value}</strong>
                <small>{card.subtitle}</small>
              </div>
            </div>
          );
        })}
      </div>

      <div className="monitoring-details">
        <div className="monitoring-panel">
          <h2>What To Watch</h2>
          <div className="monitoring-list">
            <MetricHint label="Avg API Time" value="Under 500ms is good. Multiple seconds usually means Render/DB cold start or slow queries." />
            <MetricHint label="Login Avg Time" value="If this is slow, check Render logs and Neon database wake time." />
            <MetricHint label="DB Pending Connections" value="Should normally be 0. If it rises, the database pool is waiting for free connections." />
            <MetricHint label="Uptime" value="If uptime resets often, your backend is restarting or sleeping." />
          </div>
        </div>

        <div className="monitoring-panel">
          <h2>Raw Metric URLs</h2>
          <code>/api/actuator/health</code>
          <code>/api/actuator/metrics/http.server.requests</code>
          <code>/api/actuator/metrics/jvm.memory.used</code>
          <code>/api/actuator/metrics/hikaricp.connections.active</code>
        </div>
      </div>

      {lastUpdated && (
        <p className="monitoring-updated">Last updated: {lastUpdated.toLocaleString()}</p>
      )}
    </div>
  );
};

const MetricHint = ({ label, value }) => (
  <div className="metric-hint">
    <strong>{label}</strong>
    <span>{value}</span>
  </div>
);

const getMeasurement = (metric, statistic) => {
  const measurement = metric?.measurements?.find(item => item.statistic === statistic);
  return Number(measurement?.value || 0);
};

const formatNumber = (value) => {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(value || 0);
};

const formatDuration = (seconds) => {
  if (!seconds) return '0 ms';
  if (seconds < 1) return `${Math.round(seconds * 1000)} ms`;
  if (seconds < 60) return `${seconds.toFixed(2)} s`;
  return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
};

const formatBytes = (bytes) => {
  if (!bytes) return '0 MB';
  const megabytes = bytes / 1024 / 1024;
  return `${megabytes.toFixed(1)} MB`;
};

export default Monitoring;
