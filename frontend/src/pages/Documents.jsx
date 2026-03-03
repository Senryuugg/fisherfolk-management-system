import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { documentsAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../styles/Documents.css';

export default function Documents() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMetadata, setUploadMetadata] = useState({
    description: '',
    resourceType: 'general',
    resourceId: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchDocuments();
  }, [user, navigate]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await documentsAPI.getAll();
      setDocuments(response.data);
    } catch (error) {
      console.error('[v0] Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 50 * 1024 * 1024) {
      setSelectedFile(file);
    } else {
      alert('File too large. Max 50MB');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('description', uploadMetadata.description);
    formData.append('resourceType', uploadMetadata.resourceType);
    formData.append('resourceId', uploadMetadata.resourceId);

    try {
      setLoading(true);
      await documentsAPI.upload(formData);
      setShowUploadModal(false);
      setSelectedFile(null);
      setUploadMetadata({ description: '', resourceType: 'general', resourceId: '' });
      await fetchDocuments();
    } catch (error) {
      console.error('[v0] Upload error:', error);
      alert('Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (docId, fileName) => {
    try {
      const response = await documentsAPI.download(docId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
    } catch (error) {
      console.error('[v0] Download error:', error);
      alert('Failed to download document');
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await documentsAPI.delete(docId);
      await fetchDocuments();
    } catch (error) {
      console.error('[v0] Delete error:', error);
      alert('Failed to delete document');
    }
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesFilter = filter === 'all' || doc.resourceType === filter;
    const matchesSearch =
      doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="documents-container">
      <Sidebar />
      <div className="documents-content">
        <Header />
        <main className="documents-main">
          <div className="documents-header">
            <h1>Document Management</h1>
            <button
              className="btn-upload"
              onClick={() => setShowUploadModal(true)}
              disabled={loading}
            >
              ＋ Upload Document
            </button>
          </div>

          <div className="documents-controls">
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="fisherfolk">Fisherfolk Records</option>
              <option value="boat">Boat Documents</option>
              <option value="organization">Organization Docs</option>
              <option value="report">Reports</option>
              <option value="general">General</option>
            </select>
          </div>

          {loading && <div className="loading">Loading documents...</div>}

          {!loading && filteredDocs.length === 0 && (
            <div className="empty-state">
              <p>No documents found</p>
            </div>
          )}

          {!loading && filteredDocs.length > 0 && (
            <div className="documents-grid">
              {filteredDocs.map((doc) => (
                <div key={doc._id} className="document-card">
                  <div className="doc-icon">📄</div>
                  <h3>{doc.fileName}</h3>
                  <p className="doc-description">{doc.description}</p>
                  <div className="doc-meta">
                    <span className="doc-type">{doc.resourceType}</span>
                    <span className="doc-size">
                      {(doc.fileSize / 1024 / 1024).toFixed(2)}MB
                    </span>
                  </div>
                  <p className="doc-date">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                  <div className="doc-actions">
                    <button
                      onClick={() => handleDownload(doc._id, doc.fileName)}
                      className="btn-action"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(doc._id)}
                      className="btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Upload Document</h2>
            <div className="form-group">
              <label>File</label>
              <input
                type="file"
                onChange={handleFileSelect}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={uploadMetadata.description}
                onChange={(e) =>
                  setUploadMetadata({
                    ...uploadMetadata,
                    description: e.target.value,
                  })
                }
                placeholder="Enter document description"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Document Type</label>
              <select
                value={uploadMetadata.resourceType}
                onChange={(e) =>
                  setUploadMetadata({
                    ...uploadMetadata,
                    resourceType: e.target.value,
                  })
                }
                disabled={loading}
              >
                <option value="general">General</option>
                <option value="fisherfolk">Fisherfolk Record</option>
                <option value="boat">Boat Document</option>
                <option value="organization">Organization</option>
                <option value="report">Report</option>
              </select>
            </div>
            <div className="form-group">
              <label>Resource ID (Optional)</label>
              <input
                type="text"
                value={uploadMetadata.resourceId}
                onChange={(e) =>
                  setUploadMetadata({
                    ...uploadMetadata,
                    resourceId: e.target.value,
                  })
                }
                placeholder="e.g., fisherfolk ID"
                disabled={loading}
              />
            </div>
            <div className="modal-actions">
              <button
                onClick={handleUpload}
                disabled={!selectedFile || loading}
                className="btn-primary"
              >
                {loading ? 'Uploading...' : 'Upload'}
              </button>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
