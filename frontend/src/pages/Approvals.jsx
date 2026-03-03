'use client';

import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { approvalsAPI } from '../services/api';
import { canApprove, getRoleDisplayName } from '../utils/permissions';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../styles/Approvals.css';

export default function Approvals() {
  const { user, logout } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState('approvals');
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [resourceFilter, setResourceFilter] = useState('');
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchApprovals();
  }, [statusFilter, resourceFilter]);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const params = { status: statusFilter };
      if (resourceFilter) params.resource = resourceFilter;
      const response = await approvalsAPI.getAll(params);
      setApprovals(response.data.approvals || []);
      setTotal(response.data.total || 0);
      setError('');
    } catch (err) {
      setError('Failed to load approvals. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setProcessingId(id);
    try {
      await approvalsAPI.approve(id, { reviewNotes });
      setSuccessMessage('Submission approved successfully');
      setSelectedApproval(null);
      setReviewNotes('');
      fetchApprovals();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve submission');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    if (!reviewNotes.trim()) {
      setError('Please provide a reason for rejection in the review notes');
      return;
    }
    setProcessingId(id);
    try {
      await approvalsAPI.reject(id, { reviewNotes });
      setSuccessMessage('Submission rejected');
      setSelectedApproval(null);
      setReviewNotes('');
      fetchApprovals();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject submission');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('en-PH', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const getStatusClass = (status) => {
    return { pending: 'status-pending', approved: 'status-approved', rejected: 'status-rejected' }[status] || '';
  };

  if (!canApprove(user)) {
    return (
      <div className="dashboard-container">
        <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={logout} />
        <div className="main-content">
          <Header title="APPROVALS" user={user} />
          <div className="content-area">
            <div className="access-denied">
              <h3>Access Denied</h3>
              <p>You do not have permission to manage approvals.</p>
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
        <Header title="APPROVAL MANAGEMENT" user={user} />
        <div className="content-area approvals-container">
          {error && <div className="error-message" onClick={() => setError('')}>{error}</div>}
          {successMessage && <div className="success-message" onClick={() => setSuccessMessage('')}>{successMessage}</div>}

          <div className="approvals-section">
            <div className="approvals-header">
              <div className="approvals-title">
                <h2>LGU Submissions</h2>
                <span className="total-badge">{total} {statusFilter} requests</span>
              </div>
              <div className="approvals-filters">
                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); }}>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <select value={resourceFilter} onChange={e => setResourceFilter(e.target.value)}>
                  <option value="">All Resources</option>
                  <option value="fisherfolk">Fisherfolk</option>
                  <option value="boat">Boat</option>
                  <option value="gear">Gear</option>
                  <option value="organization">Organization</option>
                </select>
              </div>
            </div>

            <div className="approvals-table-wrapper">
              {loading ? (
                <div className="loading-state">Loading submissions...</div>
              ) : approvals.length === 0 ? (
                <div className="empty-state">No {statusFilter} submissions found.</div>
              ) : (
                <table className="approvals-table">
                  <thead>
                    <tr>
                      <th>Submitted</th>
                      <th>By</th>
                      <th>City</th>
                      <th>Resource</th>
                      <th>Action</th>
                      <th>Status</th>
                      <th>Reviewed By</th>
                      <th>Review Notes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvals.map((approval) => (
                      <tr key={approval._id}>
                        <td className="datetime-cell">{formatDateTime(approval.createdAt)}</td>
                        <td className="user-cell">
                          <span>{approval.submittedByUsername}</span>
                        </td>
                        <td>{approval.submittedByCity || '-'}</td>
                        <td className="resource-cell">{approval.resource}</td>
                        <td>
                          <span className={`action-tag action-${approval.action}`}>{approval.action}</span>
                        </td>
                        <td>
                          <span className={`status-badge-approval ${getStatusClass(approval.status)}`}>
                            {approval.status}
                          </span>
                        </td>
                        <td>{approval.reviewedByUsername || '-'}</td>
                        <td className="notes-cell">{approval.reviewNotes || '-'}</td>
                        <td>
                          {approval.status === 'pending' && (
                            <button
                              className="review-btn"
                              onClick={() => { setSelectedApproval(approval); setReviewNotes(''); setError(''); }}
                            >
                              Review
                            </button>
                          )}
                          {approval.status !== 'pending' && (
                            <button
                              className="view-btn"
                              onClick={() => { setSelectedApproval(approval); setReviewNotes(approval.reviewNotes || ''); }}
                            >
                              View
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Review Modal */}
          {selectedApproval && (
            <div className="modal-overlay" onClick={() => setSelectedApproval(null)}>
              <div className="modal-content review-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>{selectedApproval.status === 'pending' ? 'Review Submission' : 'Submission Details'}</h2>
                  <button className="close-btn" onClick={() => setSelectedApproval(null)}>x</button>
                </div>

                <div className="review-info">
                  <div className="info-row">
                    <span className="info-label">Submitted by:</span>
                    <span>{selectedApproval.submittedByUsername}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">City:</span>
                    <span>{selectedApproval.submittedByCity || '-'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Resource:</span>
                    <span className="resource-cell">{selectedApproval.resource}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Action:</span>
                    <span className={`action-tag action-${selectedApproval.action}`}>{selectedApproval.action}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Submitted:</span>
                    <span>{formatDateTime(selectedApproval.createdAt)}</span>
                  </div>
                </div>

                <div className="submission-data">
                  <h4>Submitted Data:</h4>
                  <pre className="data-preview">{JSON.stringify(selectedApproval.data, null, 2)}</pre>
                </div>

                {selectedApproval.status === 'pending' && (
                  <>
                    <div className="review-notes-section">
                      <label>Review Notes (required for rejection):</label>
                      <textarea
                        value={reviewNotes}
                        onChange={e => setReviewNotes(e.target.value)}
                        placeholder="Enter notes or reason for rejection..."
                        rows={3}
                      />
                    </div>
                    <div className="modal-buttons">
                      <button
                        className="approve-btn"
                        onClick={() => handleApprove(selectedApproval._id)}
                        disabled={processingId === selectedApproval._id}
                      >
                        {processingId === selectedApproval._id ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        className="reject-btn"
                        onClick={() => handleReject(selectedApproval._id)}
                        disabled={processingId === selectedApproval._id}
                      >
                        {processingId === selectedApproval._id ? 'Processing...' : 'Reject'}
                      </button>
                      <button className="cancel-btn" onClick={() => setSelectedApproval(null)}>Cancel</button>
                    </div>
                  </>
                )}
                {selectedApproval.status !== 'pending' && (
                  <div className="modal-buttons">
                    <button className="cancel-btn" onClick={() => setSelectedApproval(null)}>Close</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
