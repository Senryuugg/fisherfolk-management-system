'use client';

import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../styles/AuditLogs.css';

const API_URL = 'http://localhost:5000/api';

export default function AuditLogs() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('audit-logs');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    action: '',
    username: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 50,
  });

  if (!user) {
    navigate('/login');
    return null;
  }

  // Only admins can view audit logs
  if (user.role !== 'admin') {
    return (
      <div className="dashboard-container">
        <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={logout} />
        <div className="main-content">
          <Header title="Access Denied" user={user} />
          <div style={{ padding: '40px', textAlign: 'center', color: '#c0392b' }}>
            <h2>Unauthorized Access</h2>
            <p>Only administrators can view audit logs.</p>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchAuditLogs();
  }, [filters]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (filters.action) params.append('action', filters.action);
      if (filters.username) params.append('username', filters.username);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      params.append('page', filters.page);
      params.append('limit', filters.limit);

      const response = await fetch(`${API_URL}/audit-logs/search?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch audit logs');
      }

      const data = await response.json();
      setLogs(data.logs || []);
    } catch (err) {
      console.error('[v0] Error fetching audit logs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1, // Reset to first page when filtering
    }));
  };

  const handleReset = () => {
    setFilters({
      action: '',
      username: '',
      startDate: '',
      endDate: '',
      page: 1,
      limit: 50,
    });
  };

  const actionColors = {
    LOGIN: '#2ecc71',
    LOGOUT: '#95a5a6',
    CREATE: '#3498db',
    UPDATE: '#f39c12',
    DELETE: '#e74c3c',
    EXPORT: '#9b59b6',
    IMPORT: '#1abc9c',
    FAILED_LOGIN: '#c0392b',
    UNAUTHORIZED_ACCESS: '#e74c3c',
  };

  return (
    <div className="dashboard-container">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={logout} />
      <div className="main-content">
        <Header title="AUDIT LOGS" user={user} />
        <div className="audit-logs-content" style={{ padding: '20px' }}>
          {/* Filters */}
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '4px', 
            marginBottom: '20px' 
          }}>
            <h3>Filters</h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '10px' 
            }}>
              <select 
                name="action" 
                value={filters.action}
                onChange={handleFilterChange}
                style={{ padding: '8px' }}
              >
                <option value="">All Actions</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="EXPORT">Export</option>
                <option value="IMPORT">Import</option>
                <option value="FAILED_LOGIN">Failed Login</option>
              </select>

              <input 
                type="text"
                name="username"
                placeholder="Filter by username"
                value={filters.username}
                onChange={handleFilterChange}
                style={{ padding: '8px' }}
              />

              <input 
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                style={{ padding: '8px' }}
              />

              <input 
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                style={{ padding: '8px' }}
              />

              <button 
                onClick={handleReset}
                style={{ padding: '8px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Reset Filters
              </button>
            </div>
          </div>

          {error && (
            <div style={{ 
              padding: '15px', 
              backgroundColor: '#fadbd8', 
              color: '#c0392b', 
              borderRadius: '4px',
              marginBottom: '20px'
            }}>
              Error: {error}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading audit logs...</div>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse',
                  border: '1px solid #ddd'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: '#ecf0f1', borderBottom: '2px solid #bdc3c7' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Username</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Action</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Resource</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Status</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>IP Address</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #ecf0f1' }}>
                        <td style={{ padding: '12px' }}>{log.username}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            backgroundColor: actionColors[log.action] || '#95a5a6',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '3px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            {log.action}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>{log.resource}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            color: log.status === 'SUCCESS' ? '#2ecc71' : log.status === 'FAILURE' ? '#e74c3c' : '#f39c12'
                          }}>
                            {log.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontSize: '12px' }}>{log.ipAddress}</td>
                        <td style={{ padding: '12px', fontSize: '12px' }}>
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {logs.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#95a5a6' }}>
                  No audit logs found
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
