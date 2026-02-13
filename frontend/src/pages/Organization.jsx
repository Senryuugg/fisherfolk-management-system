'use client';

import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { organizationAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../styles/Organization.css';

export default function Organization() {
  const { user, logout } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState('organization');
  const [activeTab, setActiveTab] = useState('organization');
  const [organizations, setOrganizations] = useState([]);
  const [committees, setCommittees] = useState([
    { id: 1, name: 'Fisheries Committee', organization: 'BFAR', status: 'Active' },
    { id: 2, name: 'Conservation Committee', organization: 'BFAR', status: 'Active' },
  ]);
  const [officers, setOfficers] = useState([
    { id: 1, name: 'Juan Dela Cruz', position: 'Chairman', organization: 'BFAR', status: 'Active' },
    { id: 2, name: 'Maria Santos', position: 'Vice Chairman', organization: 'BFAR', status: 'Active' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [filters, setFilters] = useState({
    region: '',
    status: '',
    search: '',
  });
  const [formData, setFormData] = useState({
    name: '',
    region: '',
    address: '',
    contactNumber: '',
    contactPerson: '',
    status: 'active',
  });

  useEffect(() => {
    fetchOrganizations();
  }, [filters]);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const response = await organizationAPI.getAll({
        region: filters.region,
        status: filters.status,
      });
      let data = response.data;
      if (filters.search) {
        data = data.filter((org) => org.name.toLowerCase().includes(filters.search.toLowerCase()));
      }
      setOrganizations(data);
      setError('');
    } catch (err) {
      setError('Failed to load organizations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrganization = async (e) => {
    e.preventDefault();
    try {
      await organizationAPI.create(formData);
      setShowAddModal(false);
      setFormData({
        name: '',
        region: '',
        address: '',
        contactNumber: '',
        contactPerson: '',
        status: 'active',
      });
      fetchOrganizations();
    } catch (err) {
      setError('Failed to create organization');
      console.error(err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="dashboard-container">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={logout} />
      <div className="main-content">
        <Header title="ORGANIZATION" user={user} />
        <div className="content-area org-container">
          <div className="org-table-section">
            {/* Tabs in Table Header */}
            <div className="org-tabs-header">
              <div className="org-tabs">
                <button
                  className={`org-tab ${activeTab === 'organization' ? 'active' : ''}`}
                  onClick={() => setActiveTab('organization')}
                >
                  Organization
                </button>
                <button
                  className={`org-tab ${activeTab === 'committee' ? 'active' : ''}`}
                  onClick={() => setActiveTab('committee')}
                >
                  Committee
                </button>
                <button
                  className={`org-tab ${activeTab === 'officers' ? 'active' : ''}`}
                  onClick={() => setActiveTab('officers')}
                >
                  Officers
                </button>
              </div>
            </div>

            {/* Organization Tab */}
            {activeTab === 'organization' && (
              <div className="org-tab-content">
                <div className="org-search-form">
                  <input
                    type="text"
                    placeholder="Search organization..."
                    value={filters.search}
                    onChange={handleFilterChange}
                    name="search"
                    className="org-search-input"
                  />
                  <button className="save-org-btn" onClick={() => setShowAddModal(true)}>
                    + Add Organization
                  </button>
                </div>

                {/* List Section */}
                <div className="org-list-section">
                  <div className="org-list-container">
                    {loading ? (
                      <div className="loading-text">Loading organizations...</div>
                    ) : organizations.length === 0 ? (
                      <div className="empty-text">No organizations found</div>
                    ) : (
                      <table className="org-table">
                        <thead>
                          <tr>
                            <th>Name of Organization</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {organizations.map((org) => (
                            <tr key={org._id}>
                              <td>{org.name}</td>
                              <td>
                                <span className={`status-badge ${org.status}`}>{org.status}</span>
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

            {/* Committee Tab */}
            {activeTab === 'committee' && (
              <div className="org-tab-content">
                <div className="org-search-form">
                  <input
                    type="text"
                    placeholder="Search committee..."
                    value={filters.search}
                    onChange={handleFilterChange}
                    name="search"
                    className="org-search-input"
                  />
                  <button className="save-org-btn" onClick={() => setShowAddModal(true)}>
                    + New
                  </button>
                </div>

                <div className="org-list-section">
                  <div className="org-list-container">
                    <table className="org-table">
                    <thead>
                      <tr>
                        <th>Committee Name</th>
                        <th>Organization</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {committees.map((committee) => (
                        <tr key={committee.id}>
                          <td>{committee.name}</td>
                          <td>{committee.organization}</td>
                          <td>
                            <span className={`status-badge ${committee.status.toLowerCase()}`}>{committee.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>
              </div>
            )}

            {/* Officers Tab */}
            {activeTab === 'officers' && (
              <div className="org-tab-content">
                <div className="org-search-form">
                  <input
                    type="text"
                    placeholder="Search officer..."
                    value={filters.search}
                    onChange={handleFilterChange}
                    name="search"
                    className="org-search-input"
                  />
                  <button className="save-org-btn" onClick={() => setShowAddModal(true)}>
                    + New
                  </button>
                </div>

                <div className="org-list-section">
                  <div className="org-list-container">
                    <table className="org-table">
                    <thead>
                      <tr>
                        <th>Officer Name</th>
                        <th>Position</th>
                        <th>Organization</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {officers.map((officer) => (
                        <tr key={officer.id}>
                          <td>{officer.name}</td>
                          <td>{officer.position}</td>
                          <td>{officer.organization}</td>
                          <td>
                            <span className={`status-badge ${officer.status.toLowerCase()}`}>{officer.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>
              </div>
            )}

            {error && <div className="error-message">{error}</div>}
          </div>

          {/* Add Organization Modal */}
          {showAddModal && (
            <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Add New Organization</h2>
                <form onSubmit={handleAddOrganization} className="org-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Organization Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Region *</label>
                      <select
                        required
                        value={formData.region}
                        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      >
                        <option value="">Select Region</option>
                        <option value="NCR">NCR</option>
                        <option value="Region 1">Region 1</option>
                        <option value="Region 2">Region 2</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Contact Person</label>
                      <input
                        type="text"
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Contact Number</label>
                      <input
                        type="text"
                        value={formData.contactNumber}
                        onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="modal-buttons">
                    <button type="submit" className="submit-btn">
                      Save Organization
                    </button>
                    <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
