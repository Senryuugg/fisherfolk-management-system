'use client';

import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { auditLogsAPI } from '../services/api';
import { canViewAuditLog, getRoleDisplayName } from '../utils/permissions';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../styles/AuditLog.css';

export default function AuditLog() {
  const { user, logout } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState('audit-log');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    action: '',
    resource: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (canViewAuditLog(user)) {
      fetchLogs();
    }
  }, [page, filters]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 50, ...filters };
      // Remove empty filters
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const response = await auditLogsAPI.getAll(params);
      setLogs(response.data.logs || []);
      setTotal(response.data.total || 0);
      setTotalPages(response.data.totalPages || 1);
      setError('');
    } catch (err) {
      setError('Failed to load audit logs. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ action: '', resource: '', startDate: '', endDate: '' });
    setPage(1);
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('en-PH', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  };

  const getActionBadgeClass = (action) => {
    const classes = {
      create: 'action-create',
      update: 'action-update',
      delete: 'action-delete',
      login: 'action-login',
      logout: 'action-logout',
      approve: 'action-approve',
      reject: 'action-reject',
      view: 'action-view',
    };
    return classes[action] || 'action-default';
  };

  if (!canViewAuditLog(user)) {
    return (
      <div className="dashboard-container">
        <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={logout} />
        <div className="main-content">
          <Header title="AUDIT LOG" user={user} />
          <div className="content-area">
            <div className="access-denied">
              <h3>Access Denied</h3>
              <p>You do not have permission to view audit logs.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={logout} />
      <div className="main-content">
        <Header title="AUDIT LOG" user={user} />
        <div className="content-area audit-log-container">
          {error && <div className="error-message">{error}</div>}

          <div className="audit-log-section">
            <div className="audit-log-header">
              <div className="audit-log-title">
                <h2>System Activity Log</h2>
                <span className="total-badge">{total.toLocaleString()} records</span>
              </div>
            </div>

            {/* Filters */}
            <div className="audit-filters">
              <div className="filter-group">
                <label>Action</label>
                <select name="action" value={filters.action} onChange={handleFilterChange}>
                  <option value="">All Actions</option>
                  <option value="create">Create</option>
                  <option value="update">Update</option>
                  <option value="delete">Delete</option>
                  <option value="login">Login</option>
                  <option value="logout">Logout</option>
                  <option value="approve">Approve</option>
                  <option value="reject">Reject</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Resource</label>
                <select name="resource" value={filters.resource} onChange={handleFilterChange}>
                  <option value="">All Resources</option>
                  <option value="fisherfolk">Fisherfolk</option>
                  <option value="boat">Boat</option>
                  <option value="gear">Gear</option>
                  <option value="organization">Organization</option>
                  <option value="user">User</option>
                  <option value="approval">Approval</option>
                </select>
              </div>
              <div className="filter-group">
                <label>From Date</label>
                <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
              </div>
              <div className="filter-group">
                <label>To Date</label>
                <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
              </div>
              <button className="clear-filters-btn" onClick={clearFilters}>Clear Filters</button>
            </div>

            {/* Table */}
            <div className="audit-table-wrapper">
              {loading ? (
                <div className="loading-state">Loading audit logs...</div>
              ) : logs.length === 0 ? (
                <div className="empty-state">No audit log entries found.</div>
              ) : (
                <table className="audit-table">
                  <thead>
                    <tr>
                      <th>Date & Time</th>
                      <th>User</th>
                      <th>Role</th>
                      <th>Action</th>
                      <th>Resource</th>
                      <th>Resource ID</th>
                      <th>Details</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log._id}>
                        <td className="datetime-cell">{formatDateTime(log.createdAt)}</td>
                        <td className="user-cell">
                          <span className="username">{log.username}</span>
                        </td>
                        <td>
                          <span className="role-badge-small">{getRoleDisplayName(log.userRole)}</span>
                        </td>
                        <td>
                          <span className={`action-badge ${getActionBadgeClass(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="resource-cell">{log.resource}</td>
                        <td className="id-cell">
                          {log.resourceId ? (
                            <span className="resource-id" title={log.resourceId}>
                              {log.resourceId.toString().slice(-8)}...
                            </span>
                          ) : '-'}
                        </td>
                        <td className="details-cell">
                          {log.details ? (
                            <span title={JSON.stringify(log.details, null, 2)} className="details-preview">
                              {typeof log.details === 'object'
                                ? Object.keys(log.details).slice(0, 2).join(', ')
                                : String(log.details).slice(0, 50)}
                            </span>
                          ) : '-'}
                        </td>
                        <td>
                          <span className={`status-badge ${log.status === 'success' ? 'active' : 'inactive'}`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <span className="page-info">Page {page} of {totalPages}</span>
                <button
                  className="page-btn"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
