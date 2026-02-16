'use client';

import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../styles/OrdinanceResolution.css';

export default function OrdinanceResolution() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('ordinance');
  const [activeTab, setActiveTab] = useState('ordinances');
  const [selectedFile, setSelectedFile] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      console.log('File selected:', file.name);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      console.log('Uploading:', selectedFile.name);
      // Add upload logic here
      alert(`File "${selectedFile.name}" uploaded successfully!`);
      setSelectedFile(null);
      document.getElementById('file-input').value = '';
    } else {
      alert('Please select a file first');
    }
  };

  const ordinancesData = [
    {
      id: 1,
      ordinanceNumber: 'ORD-2026-001',
      approvedDate: '01/10/2026',
      title: 'Ordinance on Marine Resource Management',
      date: '01/10/2026',
      status: 'Active',
      downloadLink: '/files/ord-2026-001.pdf',
    },
    {
      id: 2,
      ordinanceNumber: 'ORD-2026-002',
      approvedDate: '01/18/2026',
      title: 'Ordinance on Fishing Ground Protection',
      date: '01/18/2026',
      status: 'Pending',
      downloadLink: '/files/ord-2026-002.pdf',
    },
  ];

  const resolutionsData = [
    {
      id: 1,
      resolutionNumber: 'RES-2026-001',
      approvedDate: '01/15/2026',
      title: 'Resolution on Fisherfolk Welfare Program',
      date: '01/15/2026',
      status: 'Active',
      downloadLink: '/files/res-2026-001.pdf',
    },
    {
      id: 2,
      resolutionNumber: 'RES-2026-002',
      approvedDate: '01/20/2026',
      title: 'Resolution on Sustainable Fishing Practices',
      date: '01/20/2026',
      status: 'Active',
      downloadLink: '/files/res-2026-002.pdf',
    },
    {
      id: 3,
      resolutionNumber: 'ORD-2026-001',
      approvedDate: '01/10/2026',
      title: 'Ordinance on Marine Resource Management',
      date: '01/10/2026',
      status: 'Pending',
      downloadLink: '/files/ord-2026-001.pdf',
    },
    {
      id: 4,
      resolutionNumber: 'RES-2026-003',
      approvedDate: '01/25/2026',
      title: 'Resolution on Community Support Initiative',
      date: '01/25/2026',
      status: 'Active',
      downloadLink: '/files/res-2026-003.pdf',
    },
  ];

  const handleDownload = (link) => {
    window.open(link, '_blank');
  };

  return (
    <div className="dashboard-container">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={handleLogout} />
      <div className="main-content">
        <Header title="ORDINANCE & RESOLUTION" user={user} />
        <div className="content-area ordinance-resolution-container">
          <div className="or-table-section">
            {/* Tabs in Table Header */}
            <div className="or-tabs-header">
              <div className="or-tabs">
                <button
                  className={`or-tab ${activeTab === 'ordinances' ? 'active' : ''}`}
                  onClick={() => setActiveTab('ordinances')}
                >
                  Ordinances
                </button>
                <button
                  className={`or-tab ${activeTab === 'resolutions' ? 'active' : ''}`}
                  onClick={() => setActiveTab('resolutions')}
                >
                  Resolutions
                </button>
              </div>

              {/* Upload Section in Header */}
              <div className="file-upload-group">
                <input
                  id="file-input"
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx"
                  className="file-input"
                />
                <label htmlFor="file-input" className="file-label">
                  {selectedFile ? `Selected: ${selectedFile.name}` : 'Choose file...'}
                </label>
                <button className="upload-btn" onClick={handleUpload}>
                  ⬆ Upload
                </button>
              </div>
            </div>

            {/* Ordinances Tab */}
            {activeTab === 'ordinances' && (
              <div className="tab-content">
                <div className="table-header-section">
                  <h3>List of Ordinances:</h3>
                  <div className="items-per-page">
                    <label>Show:</label>
                    <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={30}>30</option>
                      <option value={40}>40</option>
                      <option value={50}>50</option>
                    </select>
                    <span>items per page</span>
                  </div>
                </div>
                <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Ordinance Number</th>
                      <th>Approved Date</th>
                      <th>Ordinance Title</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Download</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordinancesData.map((ordinance) => (
                      <tr key={ordinance.id}>
                        <td>{ordinance.ordinanceNumber}</td>
                        <td>{ordinance.approvedDate}</td>
                        <td>{ordinance.title}</td>
                        <td>{ordinance.date}</td>
                        <td>
                          <span
                            className={`status-badge ${ordinance.status.toLowerCase()}`}
                          >
                            {ordinance.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="download-btn"
                            onClick={() => handleDownload(ordinance.downloadLink)}
                            title="Download document"
                          >
                            📥 Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            )}

            {/* Resolutions Tab */}
            {activeTab === 'resolutions' && (
              <div className="tab-content">
                <div className="table-header-section">
                  <h3>List of Resolutions:</h3>
                  <div className="items-per-page">
                    <label>Show:</label>
                    <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={30}>30</option>
                      <option value={40}>40</option>
                      <option value={50}>50</option>
                    </select>
                    <span>items per page</span>
                  </div>
                </div>
                <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Resolution Number</th>
                      <th>Approved Date</th>
                      <th>Resolution Title</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Download</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resolutionsData.map((resolution) => (
                      <tr key={resolution.id}>
                        <td>{resolution.resolutionNumber}</td>
                        <td>{resolution.approvedDate}</td>
                        <td>{resolution.title}</td>
                        <td>{resolution.date}</td>
                        <td>
                          <span
                            className={`status-badge ${resolution.status.toLowerCase()}`}
                          >
                            {resolution.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="download-btn"
                            onClick={() => handleDownload(resolution.downloadLink)}
                            title="Download document"
                          >
                            📥 Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
