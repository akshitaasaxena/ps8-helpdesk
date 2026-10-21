import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { apiRequest } from '../api';
const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await apiRequest('/api/dashboard');
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);
  if (loading) return <div className="loading">Loading dashboard metrics...</div>;
  if (error) return <div className="page-container"><div className="alert alert-error">{error}</div></div>;
  if (!stats) return null;
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Helpdesk Overview & Analytics</h1>
        <div className="header-actions">
          <Link to="/admin/tickets" className="btn btn-primary btn-sm">Manage Tickets</Link>
          <Link to="/admin/departments" className="btn btn-outline btn-sm">Manage Departments</Link>
        </div>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">Total Tickets</div>
          <div className="stat-number">{stats.totalTickets}</div>
          <div className="stat-sub">Across all categories</div>
        </div>
        <div className="stat-card stat-card-open">
          <div className="stat-title">Open Tickets</div>
          <div className="stat-number">{stats.byStatus.open}</div>
          <div className="stat-sub">Pending triage</div>
        </div>
        <div className="stat-card stat-card-progress">
          <div className="stat-title">In Progress</div>
          <div className="stat-number">{stats.byStatus.inProgress}</div>
          <div className="stat-sub">Active investigation</div>
        </div>
        <div className="stat-card stat-card-resolved">
          <div className="stat-title">Resolved / Closed</div>
          <div className="stat-number">{stats.resolution.resolvedCount}</div>
          <div className="stat-sub">Successfully addressed</div>
        </div>
      </div>
      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Tickets by Status</h3>
          <div className="breakdown-list">
            <div className="breakdown-item">
              <span className="badge badge-open">Open</span>
              <span className="breakdown-value">{stats.byStatus.open}</span>
            </div>
            <div className="breakdown-item">
              <span className="badge badge-progress">In Progress</span>
              <span className="breakdown-value">{stats.byStatus.inProgress}</span>
            </div>
            <div className="breakdown-item">
              <span className="badge badge-resolved">Resolved</span>
              <span className="breakdown-value">{stats.byStatus.resolved}</span>
            </div>
            <div className="breakdown-item">
              <span className="badge badge-closed">Closed</span>
              <span className="breakdown-value">{stats.byStatus.closed}</span>
            </div>
          </div>
        </div>
        <div className="analytics-card">
          <h3>Tickets by Priority</h3>
          <div className="breakdown-list">
            <div className="breakdown-item">
              <span className="priority-high">High Priority</span>
              <span className="breakdown-value">{stats.byPriority.high}</span>
            </div>
            <div className="breakdown-item">
              <span className="priority-medium">Medium Priority</span>
              <span className="breakdown-value">{stats.byPriority.medium}</span>
            </div>
            <div className="breakdown-item">
              <span className="priority-low">Low Priority</span>
              <span className="breakdown-value">{stats.byPriority.low}</span>
            </div>
          </div>
        </div>
        <div className="analytics-card">
          <h3>Resolution Metrics</h3>
          <div className="breakdown-list">
            <div className="breakdown-item">
              <span>Total Resolved Tickets</span>
              <span className="breakdown-value">{stats.resolution.resolvedCount}</span>
            </div>
            <div className="breakdown-item">
              <span>Avg Resolution Time</span>
              <span className="breakdown-value">{stats.resolution.avgResolutionHours} hrs</span>
            </div>
            <div className="breakdown-item">
              <span>Active Departments</span>
              <span className="breakdown-value">{stats.totalDepartments}</span>
            </div>
            <div className="breakdown-item">
              <span>Registered Customers</span>
              <span className="breakdown-value">{stats.totalCustomers}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
