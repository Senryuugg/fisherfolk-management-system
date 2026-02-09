'use client';

import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../styles/OrdinanceResolution.css';

export default function OrdinanceResolution() {
  const { user, logout } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState('ordinance');

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
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={logout} />
      <div className="main-content">
        <Header title="ORDINANCE & RESOLUTION" user={user} />
        <div className="content-area ordinance-resolution-container">
          <div className="tab-content">
            <h3>List of Ordinances and Resolutions:</h3>
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
        </div>
      </div>
    </div>
  );
}
