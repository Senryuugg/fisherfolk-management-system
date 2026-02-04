'use client';

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../styles/Maps.css';

export default function Maps() {
  const { user, logout } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = 'maps';

  return (
    <div className="dashboard-container">
      <Sidebar currentPage={currentPage} setCurrentPage={() => {}} onLogout={logout} />
      <div className="main-content">
        <Header title="MAPS" user={user} />
        <div className="maps-content">
          <div className="map-controls">
            <button className="zoom-btn">+</button>
            <button className="zoom-btn">−</button>
          </div>

          <div className="map-container">
            <div className="map-placeholder">
              <p>Map integration will be displayed here using Leaflet.js</p>
              <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
                This area will show the geographical visualization of fishing areas in the Philippines
              </p>
            </div>
          </div>

          <div className="map-info">
            <h3>Fishing Areas</h3>
            <div className="info-grid">
              <div className="info-card">
                <h4>NCR Region</h4>
                <p>Main fishing zone covering Manila Bay area</p>
                <span className="badge">Active</span>
              </div>
              <div className="info-card">
                <h4>Cavite Zone</h4>
                <p>Coastal fishing area in Cavite province</p>
                <span className="badge">Active</span>
              </div>
              <div className="info-card">
                <h4>Quezon Zone</h4>
                <p>Marine fishing zone in Quezon province</p>
                <span className="badge">Active</span>
              </div>
              <div className="info-card">
                <h4>Other Regions</h4>
                <p>Extended fishing zones across the Philippines</p>
                <span className="badge">Monitoring</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
