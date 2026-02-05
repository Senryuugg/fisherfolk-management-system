'use client';

import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={handleLogout} />
      <div className="main-content">
        <Header title="DASHBOARD" user={user} />
        <div className="content-area">
          <div className="stat-card">
            <h3>Total Fisherfolk</h3>
            <p className="stat-number">1,902</p>
            <small>4.2 increase from last week</small>
          </div>
          
          <div className="stat-card">
            <h3>Total No. of C/MFARMCs established</h3>
            <p className="stat-number">45</p>
            <small>Across all regions</small>
          </div>

          <div className="stat-card">
            <h3>Total No. of Registered Fisherfolk Organizations/Cooperative</h3>
            <p className="stat-number">823</p>
            <small>Increase this month</small>
          </div>

          <div className="charts-section">
            <div className="chart-container">
              <h4>Catch Quantity & Value (2019-2023)</h4>
              <div className="chart-placeholder">Chart visualization will be displayed here</div>
            </div>
            <div className="chart-container">
              <h4>Capture by Type</h4>
              <div className="chart-placeholder">Chart visualization will be displayed here</div>
            </div>
          </div>

          <div className="charts-section">
            <div className="chart-container">
              <h4>Fish Size Distribution</h4>
              <div className="chart-placeholder">Chart visualization will be displayed here</div>
            </div>
            <div className="chart-container">
              <h4>Catch by Type (Expanded)</h4>
              <div className="chart-placeholder">Chart visualization will be displayed here</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
