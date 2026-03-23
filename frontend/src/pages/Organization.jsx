'use client';

import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { organizationAPI, committeesAPI, officersAPI } from '../services/api';
import { canCreate, canUpdate, canDelete } from '../utils/permissions';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../styles/Organization.css';

const today = () => new Date().toISOString().slice(0, 10);

const defaultOrg = {
  name: '',
  registrationDate: today(),
  address: '',
  contactPerson: '',
  status: 'active',
};

const defaultCommittee = {
  name: '',
  chairman: '',
  organization: '',
  members: '',
  dateFormed: today(),
};

const defaultOfficer = {
  name: '',
  position: '',
  organization: '',
  appointmentDate: today(),
};

export default function Organization() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('organization');
  const [activeTab, setActiveTab] = useState('organizations');

  // Data
  const [organizations, setOrganizations] = useState([]);
  const [committees, setCommittees] = useState([]);
  const [officers, setOfficers] = useState([]);

  // UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null);

  // Modal state
  const [modal, setModal] = useState(null); // null | 'org' | 'committee' | 'officer'
  const [editingId, setEditingId] = useState(null);

  // Form states
  const [orgForm, setOrgForm] = useState(defaultOrg);
  const [committeeForm, setCommitteeForm] = useState(defaultCommittee);
  const [officerForm, setOfficerForm] = useState(defaultOfficer);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3500);
  };

  // ── Fetch all data ──────────────────────────────────────────────────────────
  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [orgsRes, comRes, offRes] = await Promise.all([
        organizationAPI.getAll(),
        committeesAPI.getAll(),
        officersAPI.getAll(),
      ]);
      setOrganizations(orgsRes.data || []);
      setCommittees(comRes.data || []);
      setOfficers(offRes.data || []);
    } catch (err) {
      setError('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // ── Open modals ──────────────────────────────────────────────────────────────
  const openAddOrg = () => {
    setEditingId(null);
    setOrgForm(defaultOrg);
    setFormError('');
    setModal('org');
  };

  const openEditOrg = (org) => {
    setEditingId(org._id);
    setOrgForm({
      name: org.name,
      registrationDate: org.registrationDate?.slice(0, 10) || today(),
      address: org.address || '',
      contactPerson: org.contactPerson || '',
      status: org.status,
    });
    setFormError('');
    setModal('org');
  };

  const openAddCommittee = () => {
    setEditingId(null);
    setCommitteeForm(defaultCommittee);
    setFormError('');
    setModal('committee');
  };

  const openEditCommittee = (c) => {
    setEditingId(c._id);
    setCommitteeForm({
      name: c.name,
      chairman: c.chairman,
      organization: c.organization,
      members: c.members,
      dateFormed: c.dateFormed?.slice(0, 10) || today(),
    });
    setFormError('');
    setModal('committee');
  };

  const openAddOfficer = () => {
    setEditingId(null);
    setOfficerForm(defaultOfficer);
    setFormError('');
    setModal('officer');
  };

  const openEditOfficer = (o) => {
    setEditingId(o._id);
    setOfficerForm({
      name: o.name,
      position: o.position,
      organization: o.organization,
      appointmentDate: o.appointmentDate?.slice(0, 10) || today(),
    });
    setFormError('');
    setModal('officer');
  };

  const closeModal = () => {
    setModal(null);
    setEditingId(null);
    setFormError('');
  };

  // ── Submit handlers ──────────────────────────────────────────────────────────
  const handleOrgSubmit = async (e) => {
    e.preventDefault();
    if (!orgForm.name.trim()) { setFormError('Organization name is required.'); return; }
    if (!orgForm.registrationDate) { setFormError('Registration date is required.'); return; }
    setSubmitting(true);
    try {
      if (editingId) {
        const res = await organizationAPI.update(editingId, orgForm);
        setOrganizations((prev) => prev.map((o) => (o._id === editingId ? res.data : o)));
        showSuccess('Organization updated successfully.');
      } else {
        const res = await organizationAPI.create(orgForm);
        setOrganizations((prev) => [...prev, res.data]);
        showSuccess('Organization added successfully.');
      }
      closeModal();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save organization.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommitteeSubmit = async (e) => {
    e.preventDefault();
    if (!committeeForm.name.trim()) { setFormError('Committee name is required.'); return; }
    if (!committeeForm.organization.trim()) { setFormError('Organization is required.'); return; }
    if (!committeeForm.chairman.trim()) { setFormError('Chairman is required.'); return; }
    setSubmitting(true);
    try {
      if (editingId) {
        const res = await committeesAPI.update(editingId, committeeForm);
        setCommittees((prev) => prev.map((c) => (c._id === editingId ? res.data : c)));
        showSuccess('Committee updated successfully.');
      } else {
        const res = await committeesAPI.create(committeeForm);
        setCommittees((prev) => [...prev, res.data]);
        showSuccess('Committee added successfully.');
      }
      closeModal();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save committee.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOfficerSubmit = async (e) => {
    e.preventDefault();
    if (!officerForm.name.trim()) { setFormError('Name is required.'); return; }
    if (!officerForm.position.trim()) { setFormError('Position is required.'); return; }
    if (!officerForm.organization.trim()) { setFormError('Organization is required.'); return; }
    if (!officerForm.appointmentDate) { setFormError('Appointment date is required.'); return; }
    setSubmitting(true);
    try {
      if (editingId) {
        const res = await officersAPI.update(editingId, officerForm);
        setOfficers((prev) => prev.map((o) => (o._id === editingId ? res.data : o)));
        showSuccess('Officer updated successfully.');
      } else {
        const res = await officersAPI.create(officerForm);
        setOfficers((prev) => [...prev, res.data]);
        showSuccess('Officer added successfully.');
      }
      closeModal();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save officer.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDeleteOrg = (id) => {
    setConfirmDialog({
      message: 'Delete this organization?',
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await organizationAPI.delete(id);
          setOrganizations((prev) => prev.filter((o) => o._id !== id));
          showSuccess('Organization deleted.');
        } catch {
          setError('Failed to delete organization.');
        }
      },
    });
  };

  const handleDeleteCommittee = (id) => {
    setConfirmDialog({
      message: 'Delete this committee?',
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await committeesAPI.delete(id);
          setCommittees((prev) => prev.filter((c) => c._id !== id));
          showSuccess('Committee deleted.');
        } catch {
          setError('Failed to delete committee.');
        }
      },
    });
  };

  const handleDeleteOfficer = (id) => {
    setConfirmDialog({
      message: 'Delete this officer?',
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await officersAPI.delete(id);
          setOfficers((prev) => prev.filter((o) => o._id !== id));
          showSuccess('Officer deleted.');
        } catch {
          setError('Failed to delete officer.');
        }
      },
    });
  };

  // ── Filtered data ────────────────────────────────────────────────────────────
  const q = search.toLowerCase();
  const filteredOrgs = organizations.filter(
    (o) => o.name?.toLowerCase().includes(q) || o.category?.toLowerCase().includes(q)
  );
  const filteredCommittees = committees.filter(
    (c) => c.name?.toLowerCase().includes(q) || c.organization?.toLowerCase().includes(q)
  );
  const filteredOfficers = officers.filter(
    (o) => o.name?.toLowerCase().includes(q) || o.organization?.toLowerCase().includes(q)
  );

  const orgNames = organizations.map((o) => o.name);

  // Inline role checks — same pattern as FisherfolkList
  const userCanUpdate = user && ['admin','bfar_supervisor','lgu_supervisor','lgu_editor','lgu','lgu_admin','lgu_user','officer'].includes(user.role);
  const userCanDelete = user && ['admin','bfar_supervisor'].includes(user.role);
  const userCanCreate = user && ['admin','bfar_supervisor','lgu_supervisor','lgu_editor','lgu','lgu_admin','lgu_user','officer'].includes(user.role);

  // ── Tab header config — each tab has its own add handler ─────────────────────
  const tabConfig = {
    organizations: { label: 'Add Organization', onAdd: openAddOrg },
    committee:     { label: 'Add Committee',    onAdd: openAddCommittee },
    officers:      { label: 'Add Officer',      onAdd: openAddOfficer },
  };

  return (
    <div className="dashboard-container">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={handleLogout} />
      <div className="main-content">
        <Header title="ORGANIZATION" user={user} />
        <div className="content-area org-container">
          {successMessage && <div className="success-message">{successMessage}</div>}
          {error && <div className="error-banner">{error}</div>}

          <div className="org-table-section">
            {/* Tab bar + Add button — button label and handler change with active tab */}
            <div className="org-tabs-header">
              <div className="org-tabs">
                {[
                  { id: 'organizations', label: 'Organizations' },
                  { id: 'committee',     label: 'Committee' },
                  { id: 'officers',      label: 'Officers' },
                ].map((t) => (
                  <button
                    key={t.id}
                    className={`org-tab ${activeTab === t.id ? 'active' : ''}`}
                    onClick={() => { setActiveTab(t.id); setSearch(''); }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {userCanCreate && (
                <button className="add-org-btn" onClick={tabConfig[activeTab].onAdd}>
                  + {tabConfig[activeTab].label}
                </button>
              )}
            </div>

            {/* Search + count bar */}
            <div className="org-tab-content">
              <div className="org-top-bar">
                <input
                  className="org-search"
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <span className="org-count">
                  {activeTab === 'organizations' && `${filteredOrgs.length} organization(s)`}
                  {activeTab === 'committee'     && `${filteredCommittees.length} committee(s)`}
                  {activeTab === 'officers'      && `${filteredOfficers.length} officer(s)`}
                </span>
              </div>

              {loading ? (
                <div className="loading-row">Loading...</div>
              ) : (
                <>
                  {/* ── Organizations Tab ─────────────────────────────────────── */}
                  {activeTab === 'organizations' && (
                    <div className="org-list-container">
                      <table className="org-table">
                        <thead>
                          <tr>
                            <th>Organization Name</th>
                            <th>Registration Date</th>
                            <th>Contact Person</th>
                            <th>Members</th>
                            <th>Status</th>
                            {userCanUpdate && <th>Actions</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOrgs.length === 0 ? (
                            <tr><td colSpan="6" className="empty-text">No organizations found.</td></tr>
                          ) : (
                            filteredOrgs.map((org) => (
                              <tr key={org._id}>
                                <td>{org.name}</td>
                                <td>{org.registrationDate?.slice(0, 10)}</td>
                                <td>{org.contactPerson || '-'}</td>
                                <td>{org.members?.length ?? org.memberCount ?? '-'}</td>
                                <td><span className={`status-badge ${org.status}`}>{org.status}</span></td>
                                {userCanUpdate && (
                                  <td className="actions-cell">
                                    <button className="edit-btn" onClick={() => openEditOrg(org)}>Edit</button>
                                    {userCanDelete && (
                                      <button className="delete-btn" onClick={() => handleDeleteOrg(org._id)}>Delete</button>
                                    )}
                                  </td>
                                )}
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* ── Committee Tab ─────────────────────────────────────────── */}
                  {activeTab === 'committee' && (
                    <div className="org-list-container">
                      <table className="org-table">
                        <thead>
                          <tr>
                            <th>Committee Name</th>
                            <th>Chairman</th>
                            <th>Organization</th>
                            <th>Members</th>
                            <th>Date Formed</th>
                            {userCanUpdate && <th>Actions</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCommittees.length === 0 ? (
                            <tr><td colSpan="6" className="empty-text">No committees found.</td></tr>
                          ) : (
                            filteredCommittees.map((c) => (
                              <tr key={c._id}>
                                <td>{c.name}</td>
                                <td>{c.chairman}</td>
                                <td>{c.organization}</td>
                                <td>{c.members}</td>
                                <td>{c.dateFormed?.slice(0, 10)}</td>
                                {userCanUpdate && (
                                  <td className="actions-cell">
                                    <button className="edit-btn" onClick={() => openEditCommittee(c)}>Edit</button>
                                    {userCanDelete && (
                                      <button className="delete-btn" onClick={() => handleDeleteCommittee(c._id)}>Delete</button>
                                    )}
                                  </td>
                                )}
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* ── Officers Tab ──────────────────────────────────────────── */}
                  {activeTab === 'officers' && (
                    <div className="org-list-container">
                      <table className="org-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Position</th>
                            <th>Organization</th>
                            <th>Appointment Date</th>
                            {userCanUpdate && <th>Actions</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOfficers.length === 0 ? (
                            <tr><td colSpan="5" className="empty-text">No officers found.</td></tr>
                          ) : (
                            filteredOfficers.map((o) => (
                              <tr key={o._id}>
                                <td>{o.name}</td>
                                <td>{o.position}</td>
                                <td>{o.organization}</td>
                                <td>{o.appointmentDate?.slice(0, 10)}</td>
                                {userCanUpdate && (
                                  <td className="actions-cell">
                                    <button className="edit-btn" onClick={() => openEditOfficer(o)}>Edit</button>
                                    {userCanDelete && (
                                      <button className="delete-btn" onClick={() => handleDeleteOfficer(o._id)}>Delete</button>
                                    )}
                                  </td>
                                )}
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Add/Edit Organization Modal ────────────────────────────────────────── */}
      {modal === 'org' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? 'Edit Organization' : 'Add Organization'}</h2>
            {formError && <div className="error-message">{formError}</div>}
            <form className="org-form" onSubmit={handleOrgSubmit}>
              <div className="form-group">
                <label>Organization Name <span className="required">*</span></label>
                <input
                  required
                  value={orgForm.name}
                  onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                  placeholder="e.g. Tondo Fishing Association"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={orgForm.status}
                    onChange={(e) => setOrgForm({ ...orgForm, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Registration Date <span className="required">*</span></label>
                  <input
                    type="date"
                    required
                    value={orgForm.registrationDate}
                    onChange={(e) => setOrgForm({ ...orgForm, registrationDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Contact Person</label>
                  <input
                    value={orgForm.contactPerson}
                    onChange={(e) => setOrgForm({ ...orgForm, contactPerson: e.target.value })}
                    placeholder="e.g. Juan Santos"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Address</label>
                <input
                  value={orgForm.address}
                  onChange={(e) => setOrgForm({ ...orgForm, address: e.target.value })}
                  placeholder="Barangay, City"
                />
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? 'Saving...' : (editingId ? 'Update' : 'Add Organization')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add/Edit Committee Modal ──────────────────────────────────────────── */}
      {modal === 'committee' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? 'Edit Committee' : 'Add Committee'}</h2>
            {formError && <div className="error-message">{formError}</div>}
            <form className="org-form" onSubmit={handleCommitteeSubmit}>
              <div className="form-group">
                <label>Committee Name <span className="required">*</span></label>
                <input
                  required
                  value={committeeForm.name}
                  onChange={(e) => setCommitteeForm({ ...committeeForm, name: e.target.value })}
                  placeholder="e.g. Management Committee"
                />
              </div>
              <div className="form-group">
                <label>Organization <span className="required">*</span></label>
                {orgNames.length > 0 ? (
                  <select
                    required
                    value={committeeForm.organization}
                    onChange={(e) => setCommitteeForm({ ...committeeForm, organization: e.target.value })}
                  >
                    <option value="">-- Select Organization --</option>
                    {orgNames.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    required
                    value={committeeForm.organization}
                    onChange={(e) => setCommitteeForm({ ...committeeForm, organization: e.target.value })}
                    placeholder="Organization name"
                  />
                )}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Chairman <span className="required">*</span></label>
                  <input
                    required
                    value={committeeForm.chairman}
                    onChange={(e) => setCommitteeForm({ ...committeeForm, chairman: e.target.value })}
                    placeholder="e.g. SANTOS, JUAN"
                  />
                </div>
                <div className="form-group">
                  <label>Number of Members</label>
                  <input
                    type="number"
                    min="0"
                    value={committeeForm.members}
                    onChange={(e) => setCommitteeForm({ ...committeeForm, members: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Date Formed <span className="required">*</span></label>
                <input
                  type="date"
                  required
                  value={committeeForm.dateFormed}
                  onChange={(e) => setCommitteeForm({ ...committeeForm, dateFormed: e.target.value })}
                />
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? 'Saving...' : (editingId ? 'Update' : 'Add Committee')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add/Edit Officer Modal ────────────────────────────────────────────── */}
      {modal === 'officer' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? 'Edit Officer' : 'Add Officer'}</h2>
            {formError && <div className="error-message">{formError}</div>}
            <form className="org-form" onSubmit={handleOfficerSubmit}>
              <div className="form-group">
                <label>Full Name <span className="required">*</span></label>
                <input
                  required
                  value={officerForm.name}
                  onChange={(e) => setOfficerForm({ ...officerForm, name: e.target.value })}
                  placeholder="e.g. SANTOS, JUAN"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Position <span className="required">*</span></label>
                  <select
                    required
                    value={officerForm.position}
                    onChange={(e) => setOfficerForm({ ...officerForm, position: e.target.value })}
                  >
                    <option value="">-- Select Position --</option>
                    <option value="President">President</option>
                    <option value="Vice President">Vice President</option>
                    <option value="Secretary">Secretary</option>
                    <option value="Assistant Secretary">Assistant Secretary</option>
                    <option value="Treasurer">Treasurer</option>
                    <option value="Assistant Treasurer">Assistant Treasurer</option>
                    <option value="Auditor">Auditor</option>
                    <option value="PRO / Public Relations Officer">PRO / Public Relations Officer</option>
                    <option value="Board Member">Board Member</option>
                    <option value="Committee Chair">Committee Chair</option>
                    <option value="Sergeant-at-Arms">Sergeant-at-Arms</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Appointment Date <span className="required">*</span></label>
                  <input
                    type="date"
                    required
                    value={officerForm.appointmentDate}
                    onChange={(e) => setOfficerForm({ ...officerForm, appointmentDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Organization <span className="required">*</span></label>
                {orgNames.length > 0 ? (
                  <select
                    required
                    value={officerForm.organization}
                    onChange={(e) => setOfficerForm({ ...officerForm, organization: e.target.value })}
                  >
                    <option value="">-- Select Organization --</option>
                    {orgNames.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    required
                    value={officerForm.organization}
                    onChange={(e) => setOfficerForm({ ...officerForm, organization: e.target.value })}
                    placeholder="Organization name"
                  />
                )}
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? 'Saving...' : (editingId ? 'Update' : 'Add Officer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
