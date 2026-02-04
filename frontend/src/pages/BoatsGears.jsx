'use client';

import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../styles/BoatsGears.css';

export default function BoatsGears() {
  const { user, logout } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState('boats-gears');
  const [activeTab, setActiveTab] = useState('boats');

  const boatsData = [
    {
      id: 1,
      frsNo: '',
      mfbrNo: 'i26-1339130000-004',
      fisherfolkName: 'PABIE MANAHON',
      boatName: 'Boat 1',
      address: 'NCR, City of Manila, First District',
      registrationDate: '01/23/2026',
      status: 'Active',
    },
    {
      id: 2,
      frsNo: '',
      mfbrNo: 'i26-1339130000-005',
      fisherfolkName: 'JOMAR CABAGUE',
      boatName: 'Boat 2',
      address: 'NCR, City of Manila, First District',
      registrationDate: '01/23/2026',
      status: 'Active',
    },
  ];

  return (
    <div className="dashboard-container">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={logout} />
      <div className="main-content">
        <Header title="LIST OF REGISTERED BOATS AND GEARS" user={user} />
        <div className="content-area boats-gears-container">
          <div className="tabs-section">
            <div className="tabs">
              <button
                className={`tab-btn ${activeTab === 'boats' ? 'active' : ''}`}
                onClick={() => setActiveTab('boats')}
              >
                Registered Boats
              </button>
              <button
                className={`tab-btn ${activeTab === 'gears' ? 'active' : ''}`}
                onClick={() => setActiveTab('gears')}
              >
                Registered Gears
              </button>
            </div>
          </div>

          {activeTab === 'boats' && (
            <div className="tab-content">
              <h3>List of Registered Boats:</h3>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>FRS No.</th>
                      <th>MFBR No.</th>
                      <th>Name of Fisherfolk</th>
                      <th>Boat Name</th>
                      <th>Address</th>
                      <th>Date of Registration</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {boatsData.map((boat) => (
                      <tr key={boat.id}>
                        <td>{boat.frsNo || '-'}</td>
                        <td>{boat.mfbrNo}</td>
                        <td>{boat.fisherfolkName}</td>
                        <td>{boat.boatName}</td>
                        <td>{boat.address}</td>
                        <td>{boat.registrationDate}</td>
                        <td>
                          <span className="status-badge active">{boat.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'gears' && (
            <div className="tab-content">
              <h3>List of Registered Gears:</h3>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>FRS No.</th>
                      <th>MFBR No.</th>
                      <th>Name of Fisherfolk</th>
                      <th>Gear Type</th>
                      <th>Quantity</th>
                      <th>Date of Registration</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan="7" className="empty-cell">
                        No gears registered yet
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
