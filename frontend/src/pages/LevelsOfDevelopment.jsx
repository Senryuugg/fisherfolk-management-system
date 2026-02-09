'use client';

import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import '../styles/LevelsOfDevelopment.css';

export default function LevelsOfDevelopment() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const levels = [
    {
      id: 1,
      title: 'Level 1 (Basic)',
      description:
        'Focuses on the initial organization, establishment, and foundational structure of the FARMC.',
      fileUrl: '/files/FARMC-Level-1-Basic.pdf',
    },
    {
      id: 2,
      title: 'Level 2 (Functional)',
      description:
        'Involves basic operations, such as formulating initial development plans and assisting with law enforcement.',
      fileUrl: '/files/FARMC-Level-2-Functional.pdf',
    },
    {
      id: 3,
      title: 'Level 3 (Functional & Integrated)',
      description:
        'Assesses how effectively the FARMC integrates into local government processes and strengthens partnerships.',
      fileUrl: '/files/FARMC-Level-3-Functional-Integrated.pdf',
    },
    {
      id: 4,
      title: 'Level 4 (Operational/Intermediate)',
      description:
        'Establishes solid, sustainable mechanisms, including functional databases and independent financial capabilities.',
      fileUrl: '/files/FARMC-Level-4-Operational-Intermediate.pdf',
    },
    {
      id: 5,
      title: 'Level 5 (Mature/Fully Operational)',
      description:
        'Indicates the highest level, where the FARMC can independently sustain programs, manage resources, and maintain long-term partnerships with local government units.',
      fileUrl: '/files/FARMC-Level-5-Mature-Fully-Operational.pdf',
    },
  ];

  const handleDownload = (fileUrl) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileUrl.split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="dashboard-container">
      <Sidebar onLogout={handleLogout} />
      <div className="main-content">
        <Header userName={user?.name} onLogout={handleLogout} />
        <div className="content-area levels-container">
          <div className="levels-header">
            <h1>LEVELS OF DEVELOPMENT</h1>
          </div>

          <div className="levels-intro">
            <h2>Fisheries and Aquatic Resource Management Councils</h2>
            <p>
              (FARMCs) in the Philippines are classified into 5 levels of
              development by the Bureau of Fisheries and Aquatic Resources
              (BFAR) to measure their functionality in managing local waters.
              These levels, ranging from basic organization to fully functional,
              help guide fisherfolk councils in becoming effective partners in
              fisheries management, conservation, and policy.
            </p>

            <h3>FARMC Levels of Development (as per BFAR criteria):</h3>

            <div className="levels-grid">
              {levels.map((level) => (
                <div key={level.id} className="level-card">
                  <div className="level-header">
                    <h4>{level.title}</h4>
                  </div>
                  <p className="level-description">{level.description}</p>
                  <button
                    className="download-btn"
                    onClick={() => handleDownload(level.fileUrl)}
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>

            <div className="reference-section">
              <p>
                For a complete reference, the Bureau of Fisheries and Aquatic
                Resources (BFAR) provides a full documentation guide on the
                five levels of development of Fisheries and Aquatic Resource
                Management Councils (FARMCs), available for download in this{' '}
                <a
                  href="/files/FARMC-Levels-of-Development.pdf"
                  className="download-link"
                >
                  FARMC Levels of Development
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
