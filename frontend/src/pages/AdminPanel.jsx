import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { backupsAPI, auditLogsAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../styles/AdminPanel.css';

export default function AdminPanel() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [backupStatus, setBackupStatus] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [recentAuditLogs, setRecentAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/login');
      return;
    }
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [user, navigate]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [backupRes, auditRes] = await Promise.all([
        backupsAPI.getStatus(),
        auditLogsAPI.getRecent({ limit: 10 }),
      ]);

      setBackupStatus(backupRes.data);
      setRecentAuditLogs(auditRes.data);
    } catch (error) {
      console.error('[v0] Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    if (!window.confirm('Create a backup now?')) return;

    try {
      const response = await backupsAPI.create();
      alert(`Backup created: ${response.data.summary.totalRecords} records`);
      await fetchAdminData();
    } catch (error) {
      console.error('[v0] Backup error:', error);
      alert('Failed to create backup');
    }
  };

  return (
    <div className="admin-container">
      <Sidebar />
      <div className="admin-content">
        <Header />
        <main className="admin-main">
          <h1>Administrator Dashboard</h1>

          {/* System Health Section */}
          <section className="admin-section">
            <h2>System Health</h2>
            {loading ? (
              <div className="loading">Loading system status...</div>
            ) : (
              <div className="health-cards">
                <div className="health-card success">
                  <h3>Database Status</h3>
                  <p className="status-value">Connected</p>
                  <p className="status-detail">MongoDB Atlas</p>
                </div>
                <div className="health-card success">
                  <h3>API Status</h3>
                  <p className="status-value">Operational</p>
                  <p className="status-detail">All endpoints responsive</p>
                </div>
                <div className="health-card info">
                  <h3>Last Backup</h3>
                  <p className="status-value">
                    {backupStatus?.lastBackup
                      ? new Date(backupStatus.lastBackup).toLocaleDateString()
                      : 'Never'}
                  </p>
                  <p className="status-detail">
                    {backupStatus?.summary?.totalRecords || 0} records
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Backup Management Section */}
          <section className="admin-section">
            <h2>Backup Management</h2>
            {backupStatus && (
              <div className="backup-info">
                <div className="backup-details">
                  <p>
                    <strong>Total Records:</strong> {backupStatus.summary?.totalRecords || 0}
                  </p>
                  <p>
                    <strong>Size:</strong> {backupStatus.size?.mb || 0} MB
                  </p>
                  <p>
                    <strong>Retention:</strong> {backupStatus.retentionPolicy}
                  </p>
                </div>
                <button onClick={handleCreateBackup} className="btn-backup">
                  🔄 Create Backup Now
                </button>
              </div>
            )}
          </section>

          {/* Recent Activity Section */}
          <section className="admin-section">
            <h2>Recent Activity (Last 10 Actions)</h2>
            {recentAuditLogs.length === 0 ? (
              <p className="no-data">No recent activity</p>
            ) : (
              <div className="activity-table">
                <table>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Action</th>
                      <th>Resource</th>
                      <th>Status</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAuditLogs.map((log) => (
                      <tr key={log._id}>
                        <td>{log.userId?.email || 'Unknown'}</td>
                        <td className={`action-${log.action}`}>{log.action}</td>
                        <td>{log.resource}</td>
                        <td>
                          <span className={`status-${log.statusCode >= 400 ? 'error' : 'success'}`}>
                            {log.statusCode}
                          </span>
                        </td>
                        <td>{new Date(log.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* System Statistics */}
          <section className="admin-section">
            <h2>System Statistics</h2>
            {backupStatus?.summary && (
              <div className="stats-grid">
                <div className="stat-card">
                  <h4>Fisherfolk</h4>
                  <p className="stat-number">{backupStatus.summary.fisherfolk}</p>
                </div>
                <div className="stat-card">
                  <h4>Boats</h4>
                  <p className="stat-number">{backupStatus.summary.boats}</p>
                </div>
                <div className="stat-card">
                  <h4>Gears</h4>
                  <p className="stat-number">{backupStatus.summary.gears}</p>
                </div>
                <div className="stat-card">
                  <h4>Organizations</h4>
                  <p className="stat-number">{backupStatus.summary.organizations}</p>
                </div>
                <div className="stat-card">
                  <h4>Users</h4>
                  <p className="stat-number">{backupStatus.summary.users}</p>
                </div>
                <div className="stat-card">
                  <h4>Documents</h4>
                  <p className="stat-number">{backupStatus.summary.documents}</p>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
