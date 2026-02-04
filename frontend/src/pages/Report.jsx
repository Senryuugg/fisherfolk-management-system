'use client';

import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../styles/Report.css';

export default function Report() {
  const { user, logout } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState('report');
  const [activeTab, setActiveTab] = useState('livelihood');
  const [filters, setFilters] = useState({
    region: 'NCR',
    province: '',
  });

  const reportData = [
    {
      id: 1,
      rsbsaNumber: 'i26-1339130000-004',
      registrationNumber: 'REG001',
      registrationDate: '01/23/2026',
      lastName: 'MANAHON',
      firstName: 'PABIE',
      middleName: 'CASENARES',
      province: 'NCR, City of Manila, First District (Not a Province)',
      cityMunicipality: 'Port Area',
      barangay: 'Barangay 649',
    },
    {
      id: 2,
      rsbsaNumber: 'i26-1339130000-005',
      registrationNumber: 'REG002',
      registrationDate: '01/23/2026',
      lastName: 'CABAGUE',
      firstName: 'JOMAR',
      middleName: 'CODILLA',
      province: 'NCR, City of Manila, First District (Not a Province)',
      cityMunicipality: 'Port Area',
      barangay: 'Barangay 649',
    },
    {
      id: 3,
      rsbsaNumber: 'i25-1339010000-001',
      registrationNumber: 'REG003',
      registrationDate: '04/24/2025',
      lastName: 'DE JESUS',
      firstName: 'RENE',
      middleName: 'AGUILAR',
      province: 'NCR, City of Manila, First District (Not a Province)',
      cityMunicipality: 'Tondo I/II',
      barangay: 'Barangay 129',
    },
  ];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="dashboard-container">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={logout} />
      <div className="main-content">
        <Header title="REPORT" user={user} />
        <div className="content-area report-container">
          <div className="report-section">
            <h3>Fisherfolk Livelihood</h3>

            <div className="tabs">
              <button
                className={`tab-btn ${activeTab === 'livelihood' ? 'active' : ''}`}
                onClick={() => setActiveTab('livelihood')}
              >
                Main Livelihood
              </button>
              <button
                className={`tab-btn ${activeTab === 'alternative' ? 'active' : ''}`}
                onClick={() => setActiveTab('alternative')}
              >
                Alternative Livelihood
              </button>
            </div>

            <div className="filter-section">
              <div className="filter-inputs">
                <select name="region" value={filters.region} onChange={handleFilterChange}>
                  <option value="NCR">NCR</option>
                  <option value="Region 1">Region 1</option>
                  <option value="Region 2">Region 2</option>
                </select>
                <select name="province" value={filters.province} onChange={handleFilterChange}>
                  <option value="">Province</option>
                  <option value="Manila">Manila</option>
                  <option value="Quezon">Quezon</option>
                </select>
              </div>
              <button className="search-btn">Search</button>
              <button className="reset-btn">Reset</button>
            </div>

            <div className="table-section">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>RSBSA NUMBER</th>
                    <th>REGISTRATION NUMBER</th>
                    <th>REGISTRATION DATE</th>
                    <th>LASTNAME</th>
                    <th>FIRSTNAME</th>
                    <th>MIDDLE NAME</th>
                    <th>PROVINCE</th>
                    <th>CITY/MUNICIPALITY</th>
                    <th>BARANGAY</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((row) => (
                    <tr key={row.id}>
                      <td>{row.rsbsaNumber}</td>
                      <td>{row.registrationNumber}</td>
                      <td>{row.registrationDate}</td>
                      <td>{row.lastName}</td>
                      <td>{row.firstName}</td>
                      <td>{row.middleName}</td>
                      <td>{row.province}</td>
                      <td>{row.cityMunicipality}</td>
                      <td>{row.barangay}</td>
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
