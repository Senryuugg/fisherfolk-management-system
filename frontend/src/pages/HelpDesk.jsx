'use client';

import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../styles/HelpDesk.css';

export default function HelpDesk() {
  const { user, logout } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState('help-desk');
  const [expandedSection, setExpandedSection] = useState(null);

  const helpSections = [
    {
      id: 'central',
      title: 'CENTRAL OFFICE',
      icon: '🏢',
      content: `
        <h4>Bureau of Fisheries and Aquatic Resources</h4>
        <p><strong>Address:</strong> Fisheries Building Complex, BPI Compound, Visayas Ave, Quezon City, Metro Manila</p>
        <p><strong>Hotline:</strong> (+63(2)8539-5685</p>
        <p><strong>Email:</strong>info@bfar.da.gov.ph</p>
        <p><strong>Working Hours:</strong> Monday - Friday, 8:00 AM - 5:00 PM</p>
      `,
    },
    {
      id: 'regional',
      title: 'REGIONAL OFFICE',
      icon: '🗺️',
      content: `
        <h4>BFAR Regional Office - NCR</h4>
        <p><strong>Address:</strong> 8 Kalayaan Ave, Diliman, Quezon City, Metro Manila</p>
        <p><strong>Hotline:</strong> (632) 527-3456</p>
        <p><strong>Email:</strong> records.ncr@bfar.da.gov.ph/info.ncr@bfar.da.gov.ph </p>
        <p><strong>Working Hours:</strong> Monday - Friday, 8:00 AM - 5:00 PM</p>
        <p>For regional support and assistance with local inquiries.</p>
      `,
    },
  ];

  return (
    <div className="dashboard-container">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={logout} />
      <div className="main-content">
        <Header title="HELP DESK" user={user} />
        <div className="content-area helpdesk-container">
          <div className="help-sections">
            {helpSections.map((section) => (
              <div
                key={section.id}
                className={`help-section-card ${expandedSection === section.id ? 'expanded' : ''}`}
              >
                <button
                  className="section-header"
                  onClick={() =>
                    setExpandedSection(expandedSection === section.id ? null : section.id)
                  }
                >
                  <span className="section-icon">{section.icon}</span>
                  <span className="section-title">{section.title}</span>
                  <span className="toggle-icon">{expandedSection === section.id ? '−' : '+'}</span>
                </button>
                {expandedSection === section.id && (
                  <div
                    className="section-content"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="help-footer">
            <p className="copyright">Copyright © 2026 All rights reserved - Bureau of Fisheries and Aquatic Resources</p>
          </div>
        </div>
      </div>
    </div>
  );
}
