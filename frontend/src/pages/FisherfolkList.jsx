'use client';

import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { fisherfolkAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../styles/FisherfolkList.css';

export default function FisherfolkList() {
  const { user, logout } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState('fisherfolk-list');
  const [fisherfolk, setFisherfolk] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    rsbsaNumber: '',
    registrationNumber: '',
    firstName: '',
    lastName: '',
    middleName: '',
    registrationDate: '',
    province: '',
    cityMunicipality: '',
    barangay: '',
    mainLivelihood: '',
    alternativeLivelihood: '',
    status: 'active',
  });

  const [filters, setFilters] = useState({
    search: '',
    province: '',
    city: '',
    barangay: '',
    status: '',
  });

  // Fetch fisherfolk data
  useEffect(() => {
    fetchFisherfolk();
  }, [filters]);

  const fetchFisherfolk = async () => {
    setLoading(true);
    try {
      const response = await fisherfolkAPI.getAll({
        search: filters.search,
        province: filters.province,
        city: filters.city,
        barangay: filters.barangay,
        status: filters.status,
      });
      setFisherfolk(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load fisherfolk data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFisherfolk = async (e) => {
    e.preventDefault();
    try {
      await fisherfolkAPI.create(formData);
      setShowAddModal(false);
      setFormData({
        rsbsaNumber: '',
        registrationNumber: '',
        firstName: '',
        lastName: '',
        middleName: '',
        registrationDate: '',
        province: '',
        cityMunicipality: '',
        barangay: '',
        mainLivelihood: '',
        alternativeLivelihood: '',
        status: 'active',
      });
      fetchFisherfolk();
    } catch (err) {
      setError('Failed to create fisherfolk');
      console.error(err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () => {
    setFilters({ search: '', province: '', city: '', barangay: '', status: '' });
  };

  return (
    <div className="dashboard-container">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={logout} />
      <div className="main-content">
        <Header title="FISHERFOLK LIST" user={user} />
        <div className="content-area">
          <div className="filter-section">
            <h3>SEARCH ACTIVE FISHERFOLK</h3>
            <div className="filters-grid">
              <input
                type="text"
                name="search"
                placeholder="Search by name or RSBSA number..."
                value={filters.search}
                onChange={handleFilterChange}
                className="search-box"
              />
              <input
                type="text"
                name="province"
                placeholder="Province"
                value={filters.province}
                onChange={handleFilterChange}
              />
              <input
                type="text"
                name="city"
                placeholder="City/Municipality"
                value={filters.city}
                onChange={handleFilterChange}
              />
              <input
                type="text"
                name="barangay"
                placeholder="Barangay"
                value={filters.barangay}
                onChange={handleFilterChange}
              />
              <select name="status" value={filters.status} onChange={handleFilterChange}>
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="filter-buttons">
              <button className="search-btn" onClick={fetchFisherfolk}>
                Search
              </button>
              <button className="reset-btn" onClick={handleResetFilters}>
                Reset
              </button>
              <button className="add-btn" onClick={() => setShowAddModal(true)}>
                + Add Fisherfolk
              </button>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="table-section">
            <table className="data-table">
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
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="11" className="loading-cell">
                      Loading...
                    </td>
                  </tr>
                ) : fisherfolk.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="empty-cell">
                      No fisherfolk found
                    </td>
                  </tr>
                ) : (
                  fisherfolk.map((fish) => (
                    <tr key={fish._id}>
                      <td>{fish.rsbsaNumber}</td>
                      <td>{fish.registrationNumber || '-'}</td>
                      <td>{fish.registrationDate ? new Date(fish.registrationDate).toLocaleDateString() : '-'}</td>
                      <td>{fish.lastName}</td>
                      <td>{fish.firstName}</td>
                      <td>{fish.middleName || '-'}</td>
                      <td>{fish.province || '-'}</td>
                      <td>{fish.cityMunicipality || '-'}</td>
                      <td>{fish.barangay || '-'}</td>
                      <td>
                        <span className={`status-badge ${fish.status}`}>{fish.status}</span>
                      </td>
                      <td>
                        <button className="edit-btn">Edit</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {showAddModal && (
            <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Add New Fisherfolk</h2>
                <form onSubmit={handleAddFisherfolk} className="modal-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>RSBSA Number *</label>
                      <input
                        type="text"
                        required
                        value={formData.rsbsaNumber}
                        onChange={(e) => setFormData({ ...formData, rsbsaNumber: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Registration Number</label>
                      <input
                        type="text"
                        value={formData.registrationNumber}
                        onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Middle Name</label>
                      <input
                        type="text"
                        value={formData.middleName}
                        onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Province</label>
                      <input
                        type="text"
                        value={formData.province}
                        onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>City/Municipality</label>
                      <input
                        type="text"
                        value={formData.cityMunicipality}
                        onChange={(e) => setFormData({ ...formData, cityMunicipality: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Barangay</label>
                      <input
                        type="text"
                        value={formData.barangay}
                        onChange={(e) => setFormData({ ...formData, barangay: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Main Livelihood</label>
                      <input
                        type="text"
                        value={formData.mainLivelihood}
                        onChange={(e) => setFormData({ ...formData, mainLivelihood: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Alternative Livelihood</label>
                      <input
                        type="text"
                        value={formData.alternativeLivelihood}
                        onChange={(e) => setFormData({ ...formData, alternativeLivelihood: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Registration Date</label>
                      <input
                        type="date"
                        value={formData.registrationDate}
                        onChange={(e) => setFormData({ ...formData, registrationDate: e.target.value })}
                      />
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
                  </div>

                  <div className="modal-buttons">
                    <button type="submit" className="save-btn">
                      Save
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
