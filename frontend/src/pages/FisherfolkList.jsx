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
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState('active');

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
      console.log("[v0] Fisherfolk API response:", response);
      console.log("[v0] Fisherfolk count received:", response.data?.length || 0);
      console.log("[v0] First 3 records:", response.data?.slice(0, 3));
      setFisherfolk(response.data || []);
      setError('');
    } catch (err) {
      setError(`Failed to load fisherfolk data: ${err.response?.data?.message || err.message}`);
      console.error("[v0] Error fetching fisherfolk:", err);
      console.error("[v0] Error response:", err.response);
      setFisherfolk([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFisherfolk = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.rsbsaNumber || !formData.firstName || !formData.lastName) {
      setError('Please fill in all required fields (RSBSA Number, First Name, Last Name)');
      return;
    }

    try {
      const newFisherfolk = {
        rsbsaNumber: formData.rsbsaNumber,
        registrationNumber: formData.registrationNumber,
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName,
        registrationDate: formData.registrationDate || new Date().toLocaleDateString(),
        province: formData.province,
        cityMunicipality: formData.cityMunicipality,
        barangay: formData.barangay,
        mainLivelihood: formData.mainLivelihood,
        alternativeLivelihood: formData.alternativeLivelihood,
        status: formData.status,
      };
      
      // Add to local state immediately
      setFisherfolk([...fisherfolk, { ...newFisherfolk, _id: Date.now().toString() }]);
      
      // Also try to save to backend
      try {
        await fisherfolkAPI.create(newFisherfolk);
      } catch (backendErr) {
        console.error('Backend save failed, but added to local state', backendErr);
      }
      
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
      setError('');
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
        <div className="content-area fisherfolk-container">
          {error && <div className="error-message">{error}</div>}

          <div className="ff-table-section">
            {/* Tabs in Table Header */}
            <div className="ff-tabs-header">
              <div className="ff-tabs">
                <button
                  className={`ff-tab ${activeTab === 'active' ? 'active' : ''}`}
                  onClick={() => setActiveTab('active')}
                >
                  Active
                </button>
                <button
                  className={`ff-tab ${activeTab === 'inactive' ? 'active' : ''}`}
                  onClick={() => setActiveTab('inactive')}
                >
                  Inactive
                </button>
              </div>
            </div>

            <div className="tab-content">
              <div className="table-header">
                <h3>List of Fisherfolk:</h3>
                <button className="add-btn" onClick={() => setShowAddModal(true)}>
                  + Add Fisherfolk
                </button>
              </div>

              <div className="table-controls">
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
                    <tr className="filter-row">
                      <td></td>
                      <td></td>
                      <td></td>
                      <td><input type="text" placeholder="Search last name" className="filter-input" value={filters.lastName || ''} onChange={handleFilterChange} name="lastName" /></td>
                      <td><input type="text" placeholder="Search first name" className="filter-input" value={filters.firstName || ''} onChange={handleFilterChange} name="firstName" /></td>
                      <td><input type="text" placeholder="Search middle name" className="filter-input" value={filters.middleName || ''} onChange={handleFilterChange} name="middleName" /></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="9" className="loading-cell">
                          Loading...
                        </td>
                      </tr>
                    ) : fisherfolk.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="empty-cell">
                          No fisherfolk found
                        </td>
                      </tr>
                    ) : (
                      fisherfolk
                        .filter((fish) => {
                          const fishStatus = fish.status ? fish.status.toLowerCase() : 'active';
                          const statusMatch = activeTab === 'active' ? fishStatus === 'active' : fishStatus === 'inactive';
                          
                          const lastNameMatch = !filters.lastName || fish.lastName.toLowerCase().includes(filters.lastName.toLowerCase());
                          const firstNameMatch = !filters.firstName || fish.firstName.toLowerCase().includes(filters.firstName.toLowerCase());
                          const middleNameMatch = !filters.middleName || (fish.middleName && fish.middleName.toLowerCase().includes(filters.middleName.toLowerCase()));
                          
                          return statusMatch && lastNameMatch && firstNameMatch && middleNameMatch;
                        })
                        .map((fish) => (
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
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
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
