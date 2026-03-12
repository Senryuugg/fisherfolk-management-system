'use client';

import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { fisherfolkAPI } from '../services/api';
import { canCreate, canUpdate, canDelete, createRequiresApproval } from '../utils/permissions';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../styles/FisherfolkList.css';

export default function FisherfolkList() {
  const { user, logout } = useContext(AuthContext);
  const [activePage, setActivePage] = useState('fisherfolk-list');
  const [fisherfolk, setFisherfolk] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null); // { message, onConfirm }

  const defaultForm = {
    rsbsaNumber: '',
    registrationNumber: '',
    firstName: '',
    lastName: '',
    registrationDate: '',
    province: '',
    cityMunicipality: '',
    barangay: '',
    mainLivelihood: '',
    alternativeLivelihood: '',
    status: 'active',
  };

  const [formData, setFormData] = useState(defaultForm);

  const [filters, setFilters] = useState({
    search: '',
    lastName: '',
    firstName: '',
    district: '',
    cityMunicipality: '',
    barangay: '',
  });
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    fetchFisherfolk();
  }, [filters]);

  const fetchFisherfolk = async () => {
    setLoading(true);
    try {
      const response = await fisherfolkAPI.getAll({ search: filters.search });
      setFisherfolk(Array.isArray(response.data) ? response.data : []);
      setError('');
    } catch (err) {
      setError(`Failed to load fisherfolk data: ${err.response?.data?.message || err.message}`);
      setFisherfolk([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFisherfolk = async (e) => {
    e.preventDefault();
    setError('');
    setDuplicateWarning(null);

    // Required field validation
    if (!formData.rsbsaNumber || !formData.firstName || !formData.lastName ||
        !formData.province || !formData.cityMunicipality || !formData.barangay) {
      setError('All fields marked with * are required');
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await fisherfolkAPI.update(editingId, formData);
        setSuccessMessage('Fisherfolk record updated successfully');
        setShowAddModal(false);
        setFormData(defaultForm);
        setIsEditing(false);
        setEditingId(null);
        fetchFisherfolk();
      } else {
        const response = await fisherfolkAPI.create(formData);
        if (response.status === 202) {
          setSuccessMessage('Record submitted for approval. An LGU Supervisor will review your submission.');
        } else {
          setSuccessMessage('Fisherfolk record added successfully');
          fetchFisherfolk();
        }
        setShowAddModal(false);
        setFormData(defaultForm);
        setIsEditing(false);
        setEditingId(null);
      }
    } catch (err) {
      const data = err.response?.data;
      if (data?.duplicate) {
        setDuplicateWarning({
          message: data.message,
          possibleDuplicate: data.possibleDuplicate || false,
          existingId: data.existingId,
        });
        // Don't close modal — show warning in modal
        setError('');
      } else {
        setError(data?.message || err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (fish) => {
    setIsEditing(true);
    setEditingId(fish._id);
    setFormData({
      rsbsaNumber: fish.rsbsaNumber || '',
      registrationNumber: fish.registrationNumber || '',
      firstName: fish.firstName || '',
      lastName: fish.lastName || '',
      registrationDate: fish.registrationDate ? fish.registrationDate.split('T')[0] : '',
      province: fish.province || '',
      cityMunicipality: fish.cityMunicipality || '',
      barangay: fish.barangay || '',
      mainLivelihood: fish.mainLivelihood || '',
      alternativeLivelihood: fish.alternativeLivelihood || '',
      status: fish.status || 'active',
    });
    setShowAddModal(true);
    setDuplicateWarning(null);
    setError('');
  };

  const handleDeleteClick = async (id) => {
    setConfirmDialog({
      message: 'Are you sure you want to delete this fisherfolk record? This cannot be undone.',
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await fisherfolkAPI.delete(id);
          setSuccessMessage('Fisherfolk record deleted');
          fetchFisherfolk();
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to delete record');
        }
      },
    });
  };

  const handleRenewClick = (fish) => {
    const city = fish.cityMunicipality || '';
    const years = /taguig/i.test(city) ? 2 : 1;
    setConfirmDialog({
      message: `Renew registration for ${fish.firstName} ${fish.lastName}? This will extend their registration by ${years} year(s) from today.`,
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await fisherfolkAPI.renew(fish._id);
          setSuccessMessage('Registration renewed successfully.');
          fetchFisherfolk();
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to renew registration.');
        }
      },
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const closeModal = () => {
    setShowAddModal(false);
    setIsEditing(false);
    setEditingId(null);
    setFormData(defaultForm);
    setDuplicateWarning(null);
    setError('');
  };

  const filteredFisherfolk = fisherfolk.filter((fish) => {
    const fishStatus = fish.status ? fish.status.toLowerCase() : 'active';
    const statusMatch = activeTab === 'active' ? fishStatus === 'active' : fishStatus === 'inactive';
    const lastNameMatch = !filters.lastName || fish.lastName?.toLowerCase().includes(filters.lastName.toLowerCase());
    const firstNameMatch = !filters.firstName || fish.firstName?.toLowerCase().includes(filters.firstName.toLowerCase());
    const districtMatch = !filters.district || (fish.province || '').toLowerCase().includes(filters.district.toLowerCase());
    const cityMatch = !filters.cityMunicipality || (fish.cityMunicipality || '').toLowerCase().includes(filters.cityMunicipality.toLowerCase());
    const barangayMatch = !filters.barangay || (fish.barangay || '').toLowerCase().includes(filters.barangay.toLowerCase());
    return statusMatch && lastNameMatch && firstNameMatch && districtMatch && cityMatch && barangayMatch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredFisherfolk.length / itemsPerPage));
  const paginatedFisherfolk = filteredFisherfolk.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="dashboard-container">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={logout} />
      <div className="main-content">
        <Header title="FISHERFOLK LIST" user={user} />
        <div className="content-area fisherfolk-container">
          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message" onClick={() => setSuccessMessage('')}>{successMessage}</div>}

          {/* Approval notice for LGU users */}
          {createRequiresApproval(user) && (
            <div className="approval-notice">
              Note: As an LGU User, new records you submit will be reviewed and approved by an administrator before they appear in the system.
            </div>
          )}

          <div className="ff-table-section">
            <div className="ff-tabs-header">
              <div className="ff-tabs">
                <button className={`ff-tab ${activeTab === 'active' ? 'active' : ''}`} onClick={() => setActiveTab('active')}>
                  Active ({fisherfolk.filter(f => (f.status || 'active') === 'active').length})
                </button>
                <button className={`ff-tab ${activeTab === 'inactive' ? 'active' : ''}`} onClick={() => setActiveTab('inactive')}>
                  Inactive ({fisherfolk.filter(f => f.status === 'inactive').length})
                </button>
              </div>
            </div>

            <div className="tab-content">
              <div className="table-header">
                <h3>List of Fisherfolk:</h3>
                {canCreate(user) && (
                  <button className="add-btn" onClick={() => { setShowAddModal(true); setIsEditing(false); setFormData(defaultForm); setDuplicateWarning(null); }}>
                    + Add Fisherfolk
                  </button>
                )}
              </div>

              <div className="table-controls">
                <div className="items-per-page">
                  <label>Show:</label>
                  <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span>items per page</span>
                </div>
                <div className="record-count">
                  Showing {paginatedFisherfolk.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1}–{Math.min(currentPage * itemsPerPage, filteredFisherfolk.length)} of {filteredFisherfolk.length} records
                </div>
              </div>

              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>RSBSA NUMBER</th>
                      <th>REGISTRATION NUMBER</th>
                      <th>REGISTRATION DATE</th>
                      <th>DATE OF RENEWAL</th>
                      <th>LASTNAME</th>
                      <th>FIRSTNAME</th>
                      <th>DISTRICT</th>
                      <th>CITY/MUNICIPALITY</th>
                      <th>BARANGAY</th>
                      {(canUpdate(user) || canDelete(user)) && <th>ACTIONS</th>}
                    </tr>
                    <tr className="filter-row">
                      <td colSpan={4}></td>
                      <td><input type="text" placeholder="Filter last name" className="filter-input" value={filters.lastName} onChange={handleFilterChange} name="lastName" /></td>
                      <td><input type="text" placeholder="Filter first name" className="filter-input" value={filters.firstName} onChange={handleFilterChange} name="firstName" /></td>
                      <td>
                        <select className="filter-input" value={filters.district} onChange={handleFilterChange} name="district">
                          <option value="">All Districts</option>
                          <option value="First District">First District</option>
                          <option value="Second District">Second District</option>
                          <option value="Third District">Third District</option>
                          <option value="Fourth District">Fourth District</option>
                        </select>
                      </td>
                      <td><input type="text" placeholder="Filter city/municipality" className="filter-input" value={filters.cityMunicipality} onChange={handleFilterChange} name="cityMunicipality" /></td>
                      <td><input type="text" placeholder="Filter barangay" className="filter-input" value={filters.barangay} onChange={handleFilterChange} name="barangay" /></td>
                      {(canUpdate(user) || canDelete(user)) && <td></td>}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="10" className="loading-cell">Loading...</td></tr>
                    ) : paginatedFisherfolk.length === 0 ? (
                      <tr><td colSpan="10" className="empty-cell">No fisherfolk found</td></tr>
                    ) : (
                      paginatedFisherfolk.map((fish) => (
                        <tr key={fish._id}>
                          <td>{fish.rsbsaNumber}</td>
                          <td>{fish.registrationNumber || '-'}</td>
                          <td>{fish.registrationDate ? new Date(fish.registrationDate).toLocaleDateString() : '-'}</td>
                          <td>{fish.renewalDate ? new Date(fish.renewalDate).toLocaleDateString() : '-'}</td>
                          <td>{fish.lastName}</td>
                          <td>{fish.firstName}</td>
                          <td>{fish.province?.replace(/\(Not a Province\)/gi, '').trim() || '-'}</td>
                          <td>{fish.cityMunicipality || '-'}</td>
                          <td>{fish.barangay || '-'}</td>
                          {(canUpdate(user) || canDelete(user)) && (
                            <td>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                {canUpdate(user) && (
                                  <button className="edit-btn-sm" onClick={() => handleEditClick(fish)}>Edit</button>
                                )}
                                {canUpdate(user) && (
                                  <button className="renew-btn-sm" onClick={() => handleRenewClick(fish)}>Renew</button>
                                )}
                                {canDelete(user) && (
                                  <button className="delete-btn-sm" onClick={() => handleDeleteClick(fish._id)}>Delete</button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Add/Edit Modal */}
          {showAddModal && (
            <div className="modal-overlay" onClick={closeModal}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>{isEditing ? 'Edit Fisherfolk' : 'Add New Fisherfolk'}</h2>

                {/* Duplicate warning */}
                {duplicateWarning && (
                  <div className={`duplicate-warning ${duplicateWarning.possibleDuplicate ? 'possible' : 'exact'}`}>
                    <strong>{duplicateWarning.possibleDuplicate ? 'Possible Duplicate Detected:' : 'Duplicate Detected:'}</strong>
                    <p>{duplicateWarning.message}</p>
                    {duplicateWarning.possibleDuplicate && (
                      <p className="dup-instruction">Please verify this is a different person before continuing, or update the RSBSA number.</p>
                    )}
                  </div>
                )}

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleAddFisherfolk} className="modal-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>RSBSA Number *</label>
                      <input
                        type="text"
                        required
                        value={formData.rsbsaNumber}
                        onChange={(e) => { setFormData({ ...formData, rsbsaNumber: e.target.value }); setDuplicateWarning(null); }}
                        placeholder="e.g. i26-1339130000-004"
                      />
                    </div>
                    <div className="form-group">
                      <label>Registration Number</label>
                      <input
                        type="text"
                        value={formData.registrationNumber}
                        onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                        placeholder="e.g. REG001"
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
                        placeholder="Enter first name"
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>District *</label>
                      <select
                        required
                        value={formData.province}
                        onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      >
                        <option value="">Select District</option>
                        <option value="First District">First District</option>
                        <option value="Second District">Second District</option>
                        <option value="Third District">Third District</option>
                        <option value="Fourth District">Fourth District</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>City/Municipality *</label>
                      <input
                        type="text"
                        required
                        value={formData.cityMunicipality}
                        onChange={(e) => setFormData({ ...formData, cityMunicipality: e.target.value })}
                        placeholder="e.g. Navotas"
                      />
                    </div>
                    <div className="form-group">
                      <label>Barangay *</label>
                      <input
                        type="text"
                        required
                        value={formData.barangay}
                        onChange={(e) => setFormData({ ...formData, barangay: e.target.value })}
                        placeholder="e.g. Barangay 649"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Main Livelihood *</label>
                      <select
                        required
                        value={formData.mainLivelihood}
                        onChange={(e) => setFormData({ ...formData, mainLivelihood: e.target.value })}
                      >
                        <option value="">Select main livelihood</option>
                        <option value="Fishing">Fishing</option>
                        <option value="Fish Farming">Fish Farming</option>
                        <option value="Fish Processing">Fish Processing</option>
                        <option value="Fish Vending">Fish Vending</option>
                        <option value="Boat Crew">Boat Crew</option>
                        <option value="Net Making">Net Making</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Alternative Livelihood</label>
                      <input
                        type="text"
                        value={formData.alternativeLivelihood}
                        onChange={(e) => setFormData({ ...formData, alternativeLivelihood: e.target.value })}
                        placeholder="e.g. Farming"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Registration Date *</label>
                      <input
                        type="date"
                        required
                        value={formData.registrationDate}
                        onChange={(e) => setFormData({ ...formData, registrationDate: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Status *</label>
                      <select
                        required
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="modal-buttons">
                    <button type="submit" className="save-btn" disabled={loading}>
                      {loading ? 'Saving...' : (createRequiresApproval(user) && !isEditing) ? 'Submit for Approval' : (isEditing ? 'Update' : 'Save')}
                    </button>
                    <button type="button" className="cancel-btn" onClick={closeModal}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Custom confirm dialog */}
      {confirmDialog && (
        <div className="confirm-overlay">
          <div className="confirm-dialog">
            <p className="confirm-message">{confirmDialog.message}</p>
            <div className="confirm-actions">
              <button className="confirm-btn confirm-btn-ok" onClick={confirmDialog.onConfirm}>OK</button>
              <button className="confirm-btn confirm-btn-cancel" onClick={() => setConfirmDialog(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
