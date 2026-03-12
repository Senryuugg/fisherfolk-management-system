'use client';

import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { boatsAPI, gearsAPI } from '../services/api';
import { canCreate, canUpdate, canDelete, createRequiresApproval } from '../utils/permissions';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../styles/BoatsGears.css';

const defaultForm = {
  frsNumber: '',
  boatName: '',
  mfbrNumber: '',
  fisherfolkName: '',
  boatType: '',
  engineType: '',
  grossTonnage: '',
  netTonnage: '',
  registrationDate: '',
  homePort: '',
  province: '',
  cityMunicipality: '',
  barangay: '',
  status: 'active',
  gearType: '',
  gearClassification: '',
  quantity: '',
};

export default function BoatsGears() {
  const { user, logout } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState('boats-gears');
  const [activeTab, setActiveTab] = useState('boats');
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalTab, setModalTab] = useState('boats');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [formData, setFormData] = useState(defaultForm);
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [boatsData, setBoatsData] = useState([]);
  const [gearsData, setGearsData] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchBoats();
    fetchGears();
  }, []);

  // Auto-clear success message only
  useEffect(() => {
    if (successMessage) { const t = setTimeout(() => setSuccessMessage(''), 5000); return () => clearTimeout(t); }
  }, [successMessage]);

  const fetchBoats = async () => {
    setLoading(true);
    try {
      const response = await boatsAPI.getAll();
      setBoatsData(response.data || []);
    } catch (err) {
      setError(`Failed to load boats: ${err.response?.data?.message || err.message}`);
      setBoatsData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchGears = async () => {
    setLoading(true);
    try {
      const response = await gearsAPI.getAll();
      setGearsData(response.data || []);
    } catch (err) {
      setError(`Failed to load gears: ${err.response?.data?.message || err.message}`);
      setGearsData([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredBoats = boatsData.filter((boat) => {
    if (!filters.search && !filters.status) return true;
    const s = filters.search.toLowerCase();
    const matchSearch = !s ||
      boat.mfbrNumber?.toLowerCase().includes(s) ||
      boat.fisherfolkName?.toLowerCase().includes(s) ||
      boat.boatName?.toLowerCase().includes(s);
    const matchStatus = !filters.status || boat.status === filters.status;
    return matchSearch && matchStatus;
  });

  const filteredGears = gearsData.filter((gear) => {
    if (!filters.search && !filters.status) return true;
    const s = filters.search.toLowerCase();
    const matchSearch = !s ||
      gear.fisherfolkName?.toLowerCase().includes(s) ||
      gear.gearType?.toLowerCase().includes(s) ||
      gear.frsNumber?.toLowerCase().includes(s);
    const matchStatus = !filters.status || gear.status === filters.status;
    return matchSearch && matchStatus;
  });

  const openAddModal = (tab) => {
    setIsEditing(false);
    setEditingId(null);
    setFormData(defaultForm);
    setError('');
    setModalTab(tab);
    setShowAddModal(true);
  };

  const openEditModal = (item, tab) => {
    setIsEditing(true);
    setEditingId(item._id);
    setError('');
    setModalTab(tab);
    setFormData({
      frsNumber: item.frsNumber || item.frsNo || '',
      boatName: item.boatName || '',
      mfbrNumber: item.mfbrNumber || item.mfbrNo || '',
      fisherfolkName: item.fisherfolkName || '',
      boatType: item.boatType || '',
      engineType: item.engineType || '',
      grossTonnage: item.grossTonnage || '',
      netTonnage: item.netTonnage || '',
      registrationDate: item.registrationDate ? item.registrationDate.substring(0, 10) : '',
      homePort: item.homePort || '',
      province: item.province || '',
      cityMunicipality: item.cityMunicipality || '',
      barangay: item.barangay || '',
      status: item.status || 'active',
      gearType: item.gearType || '',
      gearClassification: item.gearClassification || '',
      quantity: item.quantity || '',
    });
    setShowAddModal(true);
  };

  const handleDeleteClick = (id, type) => {
    setConfirmDialog({
      message: `Are you sure you want to delete this ${type} record? This cannot be undone.`,
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          if (type === 'boat') {
            await boatsAPI.delete(id);
            fetchBoats();
          } else {
            await gearsAPI.delete(id);
            fetchGears();
          }
          setSuccessMessage(`${type === 'boat' ? 'Boat' : 'Gear'} record deleted successfully.`);
        } catch (err) {
          setError(err.response?.data?.message || `Failed to delete ${type}.`);
        }
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (modalTab === 'boats') {
        if (!formData.mfbrNumber || !formData.fisherfolkName || !formData.boatName) {
          setError('Please fill in all required fields (MFBR No., Fisherfolk Name, Boat Name).');
          setLoading(false);
          return;
        }
        const payload = {
          frsNumber: formData.frsNumber,
          mfbrNumber: formData.mfbrNumber,
          fisherfolkName: formData.fisherfolkName,
          boatName: formData.boatName,
          boatType: formData.boatType,
          engineType: formData.engineType,
          grossTonnage: formData.grossTonnage,
          netTonnage: formData.netTonnage,
          homePort: formData.homePort,
          province: formData.province,
          cityMunicipality: formData.cityMunicipality,
          barangay: formData.barangay,
          registrationDate: formData.registrationDate || new Date().toISOString(),
          status: formData.status,
        };

        if (isEditing) {
          await boatsAPI.update(editingId, payload);
          setSuccessMessage('Boat record updated successfully.');
        } else {
          const response = await boatsAPI.create(payload);
          if (response.status === 202) {
            setSuccessMessage('Boat submitted for approval. An LGU Supervisor will review your submission.');
          } else {
            setSuccessMessage('Boat record added successfully.');
            fetchBoats();
          }
        }
        if (isEditing) fetchBoats();

      } else {
        if (!formData.gearType || !formData.fisherfolkName) {
          setError('Please fill in all required fields (Gear Type, Fisherfolk Name).');
          setLoading(false);
          return;
        }
        const payload = {
          frsNumber: formData.frsNumber,
          mfbrNumber: formData.mfbrNumber,
          fisherfolkName: formData.fisherfolkName,
          gearType: formData.gearType,
          gearClassification: formData.gearClassification,
          quantity: formData.quantity || 0,
          registrationDate: formData.registrationDate || new Date().toISOString(),
          status: formData.status,
        };

        if (isEditing) {
          await gearsAPI.update(editingId, payload);
          setSuccessMessage('Gear record updated successfully.');
        } else {
          const response = await gearsAPI.create(payload);
          if (response.status === 202) {
            setSuccessMessage('Gear submitted for approval. An LGU Supervisor will review your submission.');
          } else {
            setSuccessMessage('Gear record added successfully.');
            fetchGears();
          }
        }
        if (isEditing) fetchGears();
      }

      // Only close modal on success
      setShowAddModal(false);
      setFormData(defaultForm);
      setIsEditing(false);
      setEditingId(null);
    } catch (err) {
      // Keep modal open on error
      setError(err.response?.data?.message || `Failed to save: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowAddModal(false);
    setIsEditing(false);
    setEditingId(null);
    setFormData(defaultForm);
    setError('');
  };

  return (
    <div className="dashboard-container">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={logout} />
      <div className="main-content">
        <Header title="LIST OF REGISTERED BOATS AND GEARS" user={user} />
        <div className="content-area">

          {successMessage && <div className="success-message">{successMessage}</div>}
          {error && !showAddModal && <div className="error-message">{error}</div>}

          {createRequiresApproval(user) && (
            <div className="approval-notice">
              Note: As an LGU Editor, new records you add will be sent for approval before appearing in the list.
            </div>
          )}

          <div className="bg-tabs-section">
            {/* Tab header */}
            <div className="bg-tabs-header">
              <div className="bg-tabs">
                <button
                  className={`bg-tab ${activeTab === 'boats' ? 'active' : ''}`}
                  onClick={() => setActiveTab('boats')}
                >
                  Registered Boats ({boatsData.length})
                </button>
                <button
                  className={`bg-tab ${activeTab === 'gears' ? 'active' : ''}`}
                  onClick={() => setActiveTab('gears')}
                >
                  Registered Gears ({gearsData.length})
                </button>
              </div>
            </div>

            {/* ── BOATS TAB ─────────────────────────────────────────────── */}
            {activeTab === 'boats' && (
              <div className="tab-content">
                <div className="table-header">
                  <h3>List of Registered Boats:</h3>
                  {canCreate(user) && (
                    <button className="add-btn" onClick={() => openAddModal('boats')}>
                      + Add Boat
                    </button>
                  )}
                </div>

                <div className="table-controls">
                  <div className="items-per-page">
                    <label>Show:</label>
                    <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
                      {[10, 20, 30, 50].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                    <span>items per page — Showing {Math.min(itemsPerPage, filteredBoats.length)} of {filteredBoats.length} records</span>
                  </div>
                  <div className="search-box">
                    <input
                      type="text"
                      placeholder="Search by name, MFBR No., boat..."
                      value={filters.search}
                      onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
                    />
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    {(filters.search || filters.status) && (
                      <button className="reset-btn" onClick={() => setFilters({ search: '', status: '' })}>Clear</button>
                    )}
                  </div>
                </div>

                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>FRS No.</th>
                        <th>MFBR No.</th>
                        <th>Name of Fisherfolk</th>
                        <th>Boat Name</th>
                        <th>Boat Type</th>
                        <th>Address</th>
                        <th>Date Registered</th>
                        <th>Status</th>
                        {(canUpdate(user) || canDelete(user)) && <th>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan="9" className="empty-cell">Loading boats...</td></tr>
                      ) : filteredBoats.length === 0 ? (
                        <tr><td colSpan="9" className="empty-cell">No boats found</td></tr>
                      ) : (
                        filteredBoats.slice(0, itemsPerPage).map((boat, i) => (
                          <tr key={boat._id || i}>
              <td>{boat.frsNumber || '-'}</td>
              <td>{boat.mfbrNumber || '-'}</td>
                            <td>{boat.fisherfolkName || '-'}</td>
                            <td>{boat.boatName || '-'}</td>
                            <td>{boat.boatType || '-'}</td>
                            <td>{[boat.barangay, boat.cityMunicipality, boat.province].filter(Boolean).join(', ') || '-'}</td>
                            <td>{boat.registrationDate ? new Date(boat.registrationDate).toLocaleDateString() : '-'}</td>
                            <td>
                              <span className={`status-badge ${boat.status === 'active' ? 'active' : 'inactive'}`}>
                                {boat.status || 'active'}
                              </span>
                            </td>
                            {(canUpdate(user) || canDelete(user)) && (
                              <td className="action-cell">
                                {canUpdate(user) && (
                                  <button className="edit-btn-sm" onClick={() => openEditModal(boat, 'boats')}>Edit</button>
                                )}
                                {canDelete(user) && (
                                  <button className="delete-btn-sm" onClick={() => handleDeleteClick(boat._id, 'boat')}>Delete</button>
                                )}
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── GEARS TAB ─────────────────────────────────────────────── */}
            {activeTab === 'gears' && (
              <div className="tab-content">
                <div className="table-header">
                  <h3>List of Registered Gears:</h3>
                  {canCreate(user) && (
                    <button className="add-btn" onClick={() => openAddModal('gears')}>
                      + Add Gear
                    </button>
                  )}
                </div>

                <div className="table-controls">
                  <div className="items-per-page">
                    <label>Show:</label>
                    <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
                      {[10, 20, 30, 50].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                    <span>items per page — Showing {Math.min(itemsPerPage, filteredGears.length)} of {filteredGears.length} records</span>
                  </div>
                  <div className="search-box">
                    <input
                      type="text"
                      placeholder="Search by name, gear type, FRS No..."
                      value={filters.search}
                      onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
                    />
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    {(filters.search || filters.status) && (
                      <button className="reset-btn" onClick={() => setFilters({ search: '', status: '' })}>Clear</button>
                    )}
                  </div>
                </div>

                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>FRS No.</th>
                        <th>MFBR No.</th>
                        <th>Name of Fisherfolk</th>
                        <th>Gear Type</th>
                        <th>Gear Classification</th>
                        <th>Quantity</th>
                        <th>Date Registered</th>
                        <th>Status</th>
                        {(canUpdate(user) || canDelete(user)) && <th>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan="9" className="empty-cell">Loading gears...</td></tr>
                      ) : filteredGears.length === 0 ? (
                        <tr><td colSpan="9" className="empty-cell">No gears found</td></tr>
                      ) : (
                        filteredGears.slice(0, itemsPerPage).map((gear, i) => (
                          <tr key={gear._id || i}>
              <td>{gear.frsNumber || '-'}</td>
              <td>{gear.mfbrNumber || '-'}</td>
                            <td>{gear.fisherfolkName || '-'}</td>
                            <td>{gear.gearType || '-'}</td>
                            <td>{gear.gearClassification || '-'}</td>
                            <td>{gear.quantity ?? '-'}</td>
                            <td>{gear.registrationDate ? new Date(gear.registrationDate).toLocaleDateString() : '-'}</td>
                            <td>
                              <span className={`status-badge ${gear.status === 'active' ? 'active' : 'inactive'}`}>
                                {gear.status || 'active'}
                              </span>
                            </td>
                            {(canUpdate(user) || canDelete(user)) && (
                              <td className="action-cell">
                                {canUpdate(user) && (
                                  <button className="edit-btn-sm" onClick={() => openEditModal(gear, 'gears')}>Edit</button>
                                )}
                                {canDelete(user) && (
                                  <button className="delete-btn-sm" onClick={() => handleDeleteClick(gear._id, 'gear')}>Delete</button>
                                )}
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── ADD / EDIT MODAL ──────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEditing ? `Edit ${modalTab === 'boats' ? 'Boat' : 'Gear'}` : 'Add Boats / Gears'}</h2>
              <button type="button" className="modal-close-btn" onClick={closeModal}>&times;</button>
            </div>

            {!isEditing && (
              <div className="modal-tabs">
                <button type="button" className={`modal-tab-btn ${modalTab === 'boats' ? 'active' : ''}`} onClick={() => { setModalTab('boats'); setError(''); setFormData(defaultForm); }}>Boats</button>
                <button type="button" className={`modal-tab-btn ${modalTab === 'gears' ? 'active' : ''}`} onClick={() => { setModalTab('gears'); setError(''); setFormData(defaultForm); }}>Gears</button>
              </div>
            )}

            {error && <div className="error-message" style={{ position: 'static', transform: 'none', margin: '0 0 12px', fontSize: '13px' }}>{error}</div>}

            {/* Single form — fields swap based on modalTab */}
            <form className="modal-form" onSubmit={handleSubmit}>

              {/* ── BOAT FIELDS ── */}
              {modalTab === 'boats' && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>MFBR No. *</label>
                      <input type="text" required value={formData.mfbrNumber} onChange={(e) => setFormData({ ...formData, mfbrNumber: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>FRS No.</label>
                      <input type="text" value={formData.frsNumber} onChange={(e) => setFormData({ ...formData, frsNumber: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Name of Fisherfolk *</label>
                      <input type="text" required value={formData.fisherfolkName} onChange={(e) => setFormData({ ...formData, fisherfolkName: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Boat Name *</label>
                      <input type="text" required value={formData.boatName} onChange={(e) => setFormData({ ...formData, boatName: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Boat Type</label>
                      <select value={formData.boatType} onChange={(e) => setFormData({ ...formData, boatType: e.target.value })}>
                        <option value="">Select Type</option>
                        <option value="motorized">Motorized</option>
                        <option value="non-motorized">Non-Motorized</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Engine Type</label>
                      <input type="text" value={formData.engineType} onChange={(e) => setFormData({ ...formData, engineType: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Gross Tonnage</label>
                      <input type="text" value={formData.grossTonnage} onChange={(e) => setFormData({ ...formData, grossTonnage: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Net Tonnage</label>
                      <input type="text" value={formData.netTonnage} onChange={(e) => setFormData({ ...formData, netTonnage: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Home Port</label>
                      <input type="text" value={formData.homePort} onChange={(e) => setFormData({ ...formData, homePort: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Province</label>
                      <input type="text" value={formData.province} onChange={(e) => setFormData({ ...formData, province: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>City/Municipality</label>
                      <input type="text" value={formData.cityMunicipality} onChange={(e) => setFormData({ ...formData, cityMunicipality: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Barangay</label>
                      <input type="text" value={formData.barangay} onChange={(e) => setFormData({ ...formData, barangay: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Registration Date</label>
                      <input type="date" value={formData.registrationDate} onChange={(e) => setFormData({ ...formData, registrationDate: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Status</label>
                      <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* ── GEAR FIELDS ── */}
              {modalTab === 'gears' && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>FRS No.</label>
                      <input type="text" value={formData.frsNumber} onChange={(e) => setFormData({ ...formData, frsNumber: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>MFBR No.</label>
                      <input type="text" value={formData.mfbrNumber} onChange={(e) => setFormData({ ...formData, mfbrNumber: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Name of Fisherfolk *</label>
                      <input type="text" required value={formData.fisherfolkName} onChange={(e) => setFormData({ ...formData, fisherfolkName: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Gear Type *</label>
                      <input type="text" required value={formData.gearType} onChange={(e) => setFormData({ ...formData, gearType: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Gear Classification</label>
                      <select value={formData.gearClassification} onChange={(e) => setFormData({ ...formData, gearClassification: e.target.value })}>
                        <option value="">Select Classification</option>
                        <option value="hook-and-line">Hook and Line</option>
                        <option value="gill-net">Gill Net</option>
                        <option value="seine-net">Seine Net</option>
                        <option value="pot-trap">Pot/Trap</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Quantity</label>
                      <input type="number" min="0" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Registration Date</label>
                      <input type="date" value={formData.registrationDate} onChange={(e) => setFormData({ ...formData, registrationDate: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Status</label>
                      <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="modal-buttons">
                <button type="submit" className="save-btn" disabled={loading}>{loading ? 'Saving...' : (isEditing ? 'Update' : 'Submit')}</button>
                <button type="button" className="cancel-btn" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CONFIRM DIALOG ───────────────────────────────────────────────── */}
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
