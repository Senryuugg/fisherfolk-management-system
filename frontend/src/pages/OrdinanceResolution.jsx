import { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ordinancesAPI } from '../services/api';
import { canCreate, canDelete } from '../utils/permissions';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../styles/OrdinanceResolution.css';

const FILE_ICONS = {
  'application/pdf': 'PDF',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/vnd.ms-excel': 'XLS',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
};

const FILE_COLORS = {
  'application/pdf': '#e53e3e',
  'application/msword': '#2b6cb0',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '#2b6cb0',
  'application/vnd.ms-excel': '#276749',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '#276749',
};

const ITEMS_PER_PAGE = 10;
const SEARCH_DEBOUNCE_MS = 400;

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = {
  type: 'ordinance',
  title: '',
  documentNumber: '',
  approvedDate: today(),
  status: 'Active',
  category: '',
  tags: '',
  description: '',
};

function formatBytes(bytes) {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function OrdinanceResolution() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('ordinance');
  const [activeTab, setActiveTab] = useState('ordinances');
  const [confirmDialog, setConfirmDialog] = useState(null);

  // Data
  const [documents, setDocuments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  // Search input — separate state so typing doesn't fire API on every keystroke
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  // Debounce: only update `search` (the actual API param) after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterTags, setFilterTags] = useState('');

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Selection (batch)
  const [selected, setSelected] = useState(new Set());
  const [batchDownloading, setBatchDownloading] = useState(false);

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Upload state
  const [uploadingId, setUploadingId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOverId, setDragOverId] = useState(null);
  const fileInputRef = useRef(null);
  const [pendingUploadDocId, setPendingUploadDocId] = useState(null);

  // Detail / version panel
  const [detailDoc, setDetailDoc] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [restoringVersion, setRestoringVersion] = useState(null);

  // Archives modal
  const [archiveDoc, setArchiveDoc] = useState(null);
  const [showArchiveModal, setShowArchiveModal] = useState(false);

  // Share link
  const [shareUrl, setShareUrl] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [generatingShare, setGeneratingShare] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const showMsg = (msg, isError = false) => {
    if (isError) { setError(msg); setTimeout(() => setError(''), 4000); }
    else { setSuccess(msg); setTimeout(() => setSuccess(''), 3500); }
  };

  // ── Fetch — useEffect watches raw deps directly, no useCallback indirection ─
  const fetchDocs = useCallback(async (opts = {}) => {
    setLoading(true);
    setError('');
    try {
      const params = {
        type: (opts.tab ?? activeTab) === 'ordinances' ? 'ordinance' : 'resolution',
        page: opts.page ?? page,
        limit: ITEMS_PER_PAGE,
        ...(search && { search }),
        ...(filterStatus && { status: filterStatus }),
        ...(filterCategory && { category: filterCategory }),
        ...(filterTags && { tags: filterTags }),
      };
      const res = await ordinancesAPI.getAll(params);
      setDocuments(res.data.documents || []);
      setTotal(res.data.total || 0);
    } catch {
      setDocuments([]);
      showMsg('Could not connect to server.', true);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, page, search, filterStatus, filterCategory, filterTags]);

  // Single effect — only re-runs when the stable deps change, not on every render
  useEffect(() => {
    fetchDocs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, page, search, filterStatus, filterCategory, filterTags]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
    setSelected(new Set());
    setSearchInput('');
    setSearch('');
    setFilterStatus('');
    setFilterCategory('');
    setFilterTags('');
  };

  // ── Add document record ───────────────────────────────────────────────────
  const openAdd = () => {
    setForm({ ...emptyForm, type: activeTab === 'ordinances' ? 'ordinance' : 'resolution' });
    setFormError('');
    setShowAddModal(true);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setFormError('Title is required.'); return; }
    if (!form.documentNumber.trim()) { setFormError('Document number is required.'); return; }
    if (!form.approvedDate) { setFormError('Approved date is required.'); return; }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      };
      await ordinancesAPI.create(payload);
      showMsg('Document record created. You can now upload a file.');
      setShowAddModal(false);
      setPage(1);
      fetchDocs();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── File upload (click or drag-and-drop) ─────────────────────────────────
  const triggerUpload = (docId) => {
    setPendingUploadDocId(docId);
    fileInputRef.current.click();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    const docId = pendingUploadDocId;
    // Clear immediately before async work to prevent double-fire
    e.target.value = '';
    setPendingUploadDocId(null);
    if (file && docId) {
      doUpload(docId, file);
    }
  };

  const doUpload = async (docId, file) => {
    setUploadingId(docId);
    setUploadProgress(0);
    const formData = new FormData();
    formData.append('file', file);
    try {
      await ordinancesAPI.uploadFile(docId, formData, (evt) => {
        if (evt.total) setUploadProgress(Math.round((evt.loaded / evt.total) * 100));
      });
      showMsg('File uploaded successfully.');
      fetchDocs();
      if (detailDoc?._id === docId) openDetail(docId);
    } catch (err) {
      showMsg(err.response?.data?.message || 'Upload failed.', true);
    } finally {
      setUploadingId(null);
      setUploadProgress(0);
      setPendingUploadDocId(null);
    }
  };

  const handleDrop = (e, docId) => {
    e.preventDefault();
    setDragOverId(null);
    const file = e.dataTransfer.files[0];
    if (file) doUpload(docId, file);
  };

  // ── Download ──────────────────────────────────────────────────────────────
  const downloadDoc = (doc) => {
    const token = localStorage.getItem('token');
    const url = ordinancesAPI.getDownloadUrl(doc._id);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', doc.originalName || doc.title);
    // Pass token via query string for direct download links
    link.href = `${url}?token=${token}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Batch download ────────────────────────────────────────────────────────
  const handleBatchDownload = async () => {
    if (!selected.size) return;
    setBatchDownloading(true);
    try {
      const res = await ordinancesAPI.batchDownload([...selected]);
      const blob = new Blob([res.data], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'documents.zip';
      link.click();
      URL.revokeObjectURL(url);
      showMsg(`Downloaded ${selected.size} file(s) as ZIP.`);
    } catch {
      showMsg('Batch download failed.', true);
    } finally {
      setBatchDownloading(false);
    }
  };

  // ── Selection ─────────────────────────────────────────────────────────────
  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === documents.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(documents.map((d) => d._id)));
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = (id) => {
    setConfirmDialog({
      message: 'Delete this document and all its files?',
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await ordinancesAPI.delete(id);
          showMsg('Document deleted.');
          setSelected((prev) => { const n = new Set(prev); n.delete(id); return n; });
          if (detailDoc?._id === id) { setShowDetail(false); setDetailDoc(null); }
          fetchDocs();
        } catch {
          showMsg('Failed to delete.', true);
        }
      },
    });
  };

  // ── Detail panel ──────────────────────────────────────────────────────────
  const openDetail = async (id) => {
    setShowDetail(true);
    setLoadingDetail(true);
    try {
      const res = await ordinancesAPI.getById(id);
      setDetailDoc(res.data);
    } catch {
      showMsg('Failed to load document details.', true);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleRestoreVersion = (versionNumber) => {
    if (!detailDoc) return;
    setConfirmDialog({
      message: `Restore version ${versionNumber}? The current version will be archived.`,
      onConfirm: async () => {
        setConfirmDialog(null);
        setRestoringVersion(versionNumber);
        try {
          const res = await ordinancesAPI.restoreVersion(detailDoc._id, versionNumber);
          setDetailDoc(res.data);
          showMsg(`Version ${versionNumber} restored.`);
          fetchDocs();
        } catch {
          showMsg('Restore failed.', true);
        } finally {
          setRestoringVersion(null);
        }
      },
    });
  };

  // ── Share link ────────────────────────────────────────────────────────────
  const handleShare = async (id) => {
    setGeneratingShare(true);
    try {
      const res = await ordinancesAPI.generateShareLink(id);
      setShareUrl(res.data.shareUrl);
      setShowShareModal(true);
    } catch {
      showMsg('Failed to generate share link.', true);
    } finally {
      setGeneratingShare(false);
    }
  };

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    showMsg('Link copied to clipboard.');
    setShowShareModal(false);
  };

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const docTypeLabel = activeTab === 'ordinances' ? 'Ordinance' : 'Resolution';

  return (
    <div className="dashboard-container">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={handleLogout} />
      <div className="main-content">
        <Header title="ORDINANCE & RESOLUTION" user={user} />

        {/* Hidden file input for uploads */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />

        <div className="content-area or-page">
          {success && <div className="or-flash or-flash--success">{success}</div>}
          {error   && <div className="or-flash or-flash--error">{error}</div>}

          <div className="or-layout">
            {/* ── Main panel ─────────────────────────────────────────────── */}
            <div className={`or-main ${showDetail ? 'or-main--narrow' : ''}`}>
              {/* Tab bar */}
              <div className="or-card">
                <div className="or-tabs-bar">
                  <div className="or-tabs">
                    {['ordinances', 'resolutions'].map((tab) => (
                      <button
                        key={tab}
                        className={`or-tab ${activeTab === tab ? 'or-tab--active' : ''}`}
                        onClick={() => handleTabChange(tab)}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        <span className="or-tab-count">
                          {activeTab === tab ? total : ''}
                        </span>
                      </button>
                    ))}
                  </div>
                  {canCreate(user) && (
                    <button className="or-btn or-btn--primary" onClick={openAdd}>
                      + Add {docTypeLabel}
                    </button>
                  )}
                </div>

                {/* Filters */}
                <div className="or-filters">
                  <input
                    className="or-search"
                    type="text"
                    placeholder={`Search ${activeTab}...`}
                    value={searchInput}
                    onChange={(e) => { setSearchInput(e.target.value); setPage(1); }}
                  />
                  <select
                    className="or-filter-select"
                    value={filterStatus}
                    onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                  >
                    <option value="">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Archived">Archived</option>
                  </select>
                  <input
                    className="or-filter-input"
                    type="text"
                    placeholder="Filter by tag..."
                    value={filterTags}
                    onChange={(e) => { setFilterTags(e.target.value); setPage(1); }}
                  />
                  {selected.size > 0 && (
                    <button
                      className="or-btn or-btn--outline"
                      onClick={handleBatchDownload}
                      disabled={batchDownloading}
                    >
                      {batchDownloading
                        ? 'Downloading...'
                        : `Download ${selected.size} selected`}
                    </button>
                  )}
                </div>
              </div>

              {/* Table */}
              <div className="or-card or-card--table">
                {loading ? (
                  <div className="or-state-center">
                    <div className="or-spinner" />
                    <p>Loading {activeTab}...</p>
                  </div>
                ) : documents.length === 0 ? (
                  <div className="or-state-center">
                    <div className="or-empty-icon" />
                    <p>No {activeTab} found.</p>
                    {canCreate(user) && (
                      <button className="or-btn or-btn--primary" onClick={openAdd}>
                        Add first {docTypeLabel}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="or-table-wrap">
                    <table className="or-table">
                      <thead>
                        <tr>
                          <th className="or-th-check">
                            <input
                              type="checkbox"
                              checked={selected.size === documents.length && documents.length > 0}
                              onChange={toggleSelectAll}
                            />
                          </th>
                          <th>Document</th>
                          <th>Number</th>
                          <th>Date</th>
                          <th>Tags</th>
                          <th>Status</th>
                          <th>File</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {documents.map((doc) => (
                          <tr
                            key={doc._id}
                            className={`or-row ${selected.has(doc._id) ? 'or-row--selected' : ''} ${dragOverId === doc._id ? 'or-row--dragover' : ''}`}
                            onDragOver={(e) => { e.preventDefault(); setDragOverId(doc._id); }}
                            onDragLeave={() => setDragOverId(null)}
                            onDrop={(e) => handleDrop(e, doc._id)}
                          >
                            <td className="or-td-check">
                              <input
                                type="checkbox"
                                checked={selected.has(doc._id)}
                                onChange={() => toggleSelect(doc._id)}
                              />
                            </td>
                            <td>
                              <button
                                className="or-title-btn"
                                onClick={() => openDetail(doc._id)}
                              >
                                {doc.title}
                              </button>
                              {doc.description && (
                                <p className="or-description">{doc.description}</p>
                              )}
                            </td>
                            <td className="or-td-mono">{doc.documentNumber || '-'}</td>
                            <td className="or-td-date">{formatDate(doc.approvedDate)}</td>
                            <td>
                              <div className="or-tags">
                                {(doc.tags || []).map((t) => (
                                  <span key={t} className="or-tag">{t}</span>
                                ))}
                              </div>
                            </td>
                            <td>
                              <span className={`or-status or-status--${(doc.status || '').toLowerCase()}`}>
                                {doc.status}
                              </span>
                            </td>
                            <td>
                              {uploadingId === doc._id ? (
                                <div className="or-upload-progress">
                                  <div
                                    className="or-upload-bar"
                                    style={{ width: `${uploadProgress}%` }}
                                  />
                                  <span>{uploadProgress}%</span>
                                </div>
                            ) : (doc.gcsFileId || doc.localPath) ? (
                                <div className="or-file-cell">
                                  <span
                                    className="or-file-badge"
                                    style={{ background: FILE_COLORS[doc.mimeType] || '#718096' }}
                                  >
                                    {FILE_ICONS[doc.mimeType] || 'FILE'}
                                  </span>
                                  <span className="or-file-size">{formatBytes(doc.size)}</span>
                                  <span className="or-file-version">v{doc.currentVersion}</span>
                                </div>
                              ) : (
                                canCreate(user) && (
                                  <button
                                    className="or-btn or-btn--upload"
                                    onClick={() => triggerUpload(doc._id)}
                                    title="Drop a file here or click to upload"
                                  >
                                    Upload
                                  </button>
                                )
                              )}
                            </td>
                            <td>
                              <div className="or-actions">
                                {(doc.gcsFileId || doc.localPath) && (
                                  <button
                                    className="or-action-btn or-action-btn--download"
                                    onClick={() => downloadDoc(doc)}
                                    title="Download"
                                  >
                                    Download
                                  </button>
                                )}
                                {canCreate(user) && (doc.gcsFileId || doc.localPath) && (
                                  <button
                                    className="or-action-btn or-action-btn--upload"
                                    onClick={() => triggerUpload(doc._id)}
                                    title="Upload new version"
                                  >
                                    New version
                                  </button>
                                )}
                                {(doc.gcsFileId || doc.localPath) && (
                                  <button
                                    className="or-action-btn or-action-btn--share"
                                    onClick={() => handleShare(doc._id)}
                                    disabled={generatingShare}
                                    title="Share"
                                  >
                                    Share
                                  </button>
                                )}
                                {(doc.versions || []).length > 0 && (
                                  <button
                                    className="or-action-btn or-action-btn--archive"
                                    onClick={() => { setArchiveDoc(doc); setShowArchiveModal(true); }}
                                    title="View version history"
                                  >
                                    Archives ({doc.versions.length})
                                  </button>
                                )}
                                {canDelete(user) && (
                                  <button
                                    className="or-action-btn or-action-btn--delete"
                                    onClick={() => handleDelete(doc._id)}
                                    title="Delete"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="or-pagination">
                    <button
                      className="or-page-btn"
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </button>
                    <span className="or-page-info">
                      Page {page} of {totalPages} &mdash; {total} total
                    </span>
                    <button
                      className="or-page-btn"
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ── Detail / version panel ──────────────────────────────────── */}
            {showDetail && (
              <aside className="or-detail">
                <div className="or-detail-header">
                  <h3>Document Details</h3>
                  <button
                    className="or-detail-close"
                    onClick={() => { setShowDetail(false); setDetailDoc(null); }}
                  >
                    &times;
                  </button>
                </div>

                {loadingDetail ? (
                  <div className="or-state-center"><div className="or-spinner" /></div>
                ) : detailDoc ? (
                  <div className="or-detail-body">
                    {/* File preview badge */}
                    {detailDoc.localPath && (
                      <div className="or-detail-file">
                        <span
                          className="or-detail-file-badge"
                          style={{ background: FILE_COLORS[detailDoc.mimeType] || '#718096' }}
                        >
                          {FILE_ICONS[detailDoc.mimeType] || 'FILE'}
                        </span>
                        <div className="or-detail-file-meta">
                          <span className="or-detail-filename">{detailDoc.originalName}</span>
                          <span className="or-detail-filesize">{formatBytes(detailDoc.size)}</span>
                        </div>
                        <button
                          className="or-btn or-btn--sm or-btn--primary"
                          onClick={() => downloadDoc(detailDoc)}
                        >
                          Download
                        </button>
                      </div>
                    )}

                    <div className="or-detail-fields">
                      <div className="or-detail-field">
                        <span className="or-detail-label">Title</span>
                        <span className="or-detail-value">{detailDoc.title}</span>
                      </div>
                      <div className="or-detail-field">
                        <span className="or-detail-label">Number</span>
                        <span className="or-detail-value or-detail-mono">
                          {detailDoc.documentNumber || '-'}
                        </span>
                      </div>
                      <div className="or-detail-field">
                        <span className="or-detail-label">Type</span>
                        <span className="or-detail-value">{detailDoc.type}</span>
                      </div>
                      <div className="or-detail-field">
                        <span className="or-detail-label">Date</span>
                        <span className="or-detail-value">{formatDate(detailDoc.approvedDate)}</span>
                      </div>
                      <div className="or-detail-field">
                        <span className="or-detail-label">Status</span>
                        <span className={`or-status or-status--${(detailDoc.status || '').toLowerCase()}`}>
                          {detailDoc.status}
                        </span>
                      </div>
                      {detailDoc.category && (
                        <div className="or-detail-field">
                          <span className="or-detail-label">Category</span>
                          <span className="or-detail-value">{detailDoc.category}</span>
                        </div>
                      )}
                      {(detailDoc.tags || []).length > 0 && (
                        <div className="or-detail-field">
                          <span className="or-detail-label">Tags</span>
                          <div className="or-tags">
                            {detailDoc.tags.map((t) => (
                              <span key={t} className="or-tag">{t}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="or-detail-field">
                        <span className="or-detail-label">Uploaded by</span>
                        <span className="or-detail-value">
                          {detailDoc.uploadedBy?.fullName || detailDoc.uploadedBy?.username || '-'}
                        </span>
                      </div>
                      <div className="or-detail-field">
                        <span className="or-detail-label">Last updated</span>
                        <span className="or-detail-value">{formatDate(detailDoc.updatedAt)}</span>
                      </div>
                    </div>

                    {/* Version history */}
                    {(detailDoc.versions || []).length > 0 && (
                      <div className="or-versions">
                        <h4 className="or-versions-title">
                          Version History
                          <span className="or-versions-badge">{detailDoc.versions.length}</span>
                        </h4>
                        <div className="or-version-list">
                          {detailDoc.versions.map((v) => (
                            <div key={v._id} className="or-version-item">
                              <div className="or-version-info">
                                <span className="or-version-num">v{v.versionNumber}</span>
                                <span className="or-version-name">{v.originalName}</span>
                                <span className="or-version-size">{formatBytes(v.size)}</span>
                                <span className="or-version-date">{formatDate(v.uploadedAt)}</span>
                                {v.note && <span className="or-version-note">{v.note}</span>}
                              </div>
                              <div className="or-version-actions">
                                <a
                                  className="or-action-btn or-action-btn--download"
                                  href={ordinancesAPI.getVersionDownloadUrl(detailDoc._id, v.versionNumber)}
                                  download
                                >
                                  Download
                                </a>
                                {canUpdate(user) && (
                                  <button
                                    className="or-action-btn or-action-btn--restore"
                                    onClick={() => handleRestoreVersion(v.versionNumber)}
                                    disabled={restoringVersion === v.versionNumber}
                                  >
                                    {restoringVersion === v.versionNumber ? 'Restoring...' : 'Restore'}
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </aside>
            )}
          </div>
        </div>
      </div>

      {/* ── Add modal ───────────────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="or-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="or-modal" onClick={(e) => e.stopPropagation()}>
            <div className="or-modal-header">
              <h2>Add {docTypeLabel}</h2>
              <button className="or-modal-close" onClick={() => setShowAddModal(false)}>&times;</button>
            </div>

            {formError && <div className="or-form-error-banner">{formError}</div>}

            <form className="or-form" onSubmit={handleAdd}>
              <div className="or-form-row">
                <div className="or-form-group">
                  <label>Document Number <span className="or-required">*</span></label>
                  <input
                    value={form.documentNumber}
                    onChange={(e) => setForm({ ...form, documentNumber: e.target.value })}
                    placeholder={`e.g. ${form.type === 'ordinance' ? 'ORD-2026-001' : 'RES-2026-001'}`}
                  />
                </div>
                <div className="or-form-group">
                  <label>Approved Date <span className="or-required">*</span></label>
                  <input
                    type="date"
                    value={form.approvedDate}
                    onChange={(e) => setForm({ ...form, approvedDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="or-form-group">
                <label>Title <span className="or-required">*</span></label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Enter full title"
                />
              </div>

              <div className="or-form-group">
                <label>Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional short description"
                />
              </div>

              <div className="or-form-row">
                <div className="or-form-group">
                  <label>Category</label>
                  <input
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="e.g. Environment"
                  />
                </div>
                <div className="or-form-group">
                  <label>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="or-form-group">
                <label>Tags <span className="or-hint">(comma-separated)</span></label>
                <input
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="e.g. fisheries, environment, 2026"
                />
              </div>

              <div className="or-form-actions">
                <button type="button" className="or-btn or-btn--ghost" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="or-btn or-btn--primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Create Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Share modal ─────────────────────────────────────────────────────── */}
      {showShareModal && (
        <div className="or-modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="or-modal or-modal--sm" onClick={(e) => e.stopPropagation()}>
            <div className="or-modal-header">
              <h2>Share Document</h2>
              <button className="or-modal-close" onClick={() => setShowShareModal(false)}>&times;</button>
            </div>
            <p className="or-share-note">
              This link is valid for 7 days. Anyone with the link can download the file.
            </p>
            <div className="or-share-url">
              <input readOnly value={shareUrl} className="or-share-input" />
              <button className="or-btn or-btn--primary" onClick={copyShareUrl}>
                Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Archives / Version History Modal ────────────────────────────────── */}
      {showArchiveModal && archiveDoc && (
        <div className="or-modal-overlay" onClick={() => { setShowArchiveModal(false); setArchiveDoc(null); }}>
          <div className="or-modal or-modal--archive" onClick={(e) => e.stopPropagation()}>
            <div className="or-modal-header">
              <h2>Version History &mdash; {archiveDoc.title}</h2>
              <button className="or-modal-close" onClick={() => { setShowArchiveModal(false); setArchiveDoc(null); }}>&times;</button>
            </div>
            <div className="or-archive-body">
              <p className="or-archive-meta">
                Document #{archiveDoc.documentNumber || '-'} &bull; Current version: v{archiveDoc.currentVersion || 1}
              </p>
              {archiveDoc.versions.length === 0 ? (
                <p className="or-archive-empty">No previous versions found.</p>
              ) : (
                <table className="or-archive-table">
                  <thead>
                    <tr>
                      <th>Version</th>
                      <th>File Name</th>
                      <th>Size</th>
                      <th>Uploaded</th>
                      <th>Note</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {archiveDoc.versions.map((v) => (
                      <tr key={v._id || v.versionNumber} className={v.versionNumber === archiveDoc.currentVersion ? 'or-archive-current' : ''}>
                        <td>
                          <span className="or-version-num">v{v.versionNumber}</span>
                          {v.versionNumber === archiveDoc.currentVersion && (
                            <span className="or-version-current-badge">Current</span>
                          )}
                        </td>
                        <td>{v.originalName || '-'}</td>
                        <td>{formatBytes(v.size)}</td>
                        <td>{formatDate(v.uploadedAt)}</td>
                        <td>{v.note || '-'}</td>
                        <td>
                          <div className="or-archive-actions">
                            <a
                              className="or-action-btn or-action-btn--download"
                              href={ordinancesAPI.getVersionDownloadUrl(archiveDoc._id, v.versionNumber)}
                              download
                            >
                              Download
                            </a>
                            {canCreate(user) && v.versionNumber !== archiveDoc.currentVersion && (
                              <button
                                className="or-action-btn or-action-btn--restore"
                                onClick={async () => {
                                  try {
                                    await ordinancesAPI.restoreVersion(archiveDoc._id, v.versionNumber);
                                    showMsg(`Restored to v${v.versionNumber}`);
                                    setShowArchiveModal(false);
                                    setArchiveDoc(null);
                                    fetchDocs();
                                  } catch {
                                    showMsg('Failed to restore version.', true);
                                  }
                                }}
                              >
                                Restore
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
      {confirmDialog && (
        <div className="confirm-overlay">
          <div className="confirm-dialog">
            <p className="confirm-message">{confirmDialog.message}</p>
            <div className="confirm-actions">
              <button className="confirm-btn confirm-btn-ok" onClick={confirmDialog.onConfirm}>OK</button>
              <button className="confirm-btn confirm-btn-cancel" onClick={() => setConfirmDialog(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
