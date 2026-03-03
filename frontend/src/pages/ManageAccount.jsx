'use client';

import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import {
  canCreateUsers, canDelete, canUpdate, isTopAdmin,
  ROLES, getRoleDisplayName, getRoleBadgeColor, getCreatableRoles,
  isLguSupervisor, isBfarSupervisor,
} from '../utils/permissions';
import { usersAPI } from '../services/api';
import '../styles/ManageAccount.css';

export default function ManageAccount() {
  const { user, logout, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('manage-account');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const defaultForm = {
    username: '',
    email: '',
    password: '',
    fullName: '',
    role: 'lgu_editor',
    department: 'lgu',
    city: '',
    region: '',
    active: true,
  };

  const [formData, setFormData] = useState(defaultForm);

  const handleLogout = () => { logout(); navigate('/login'); };

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll();
      setUsers(response.data || []);
    } catch (err) {
      setError('Failed to fetch users. ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // Auto-set department based on role
  const handleRoleChange = (e) => {
    const role = e.target.value;
    let dept = formData.department;
    if ([ROLES.BFAR_SUPERVISOR, ROLES.BFAR_VIEWER].includes(role)) dept = 'bfar';
    if ([ROLES.LGU_SUPERVISOR, ROLES.LGU_EDITOR].includes(role)) dept = 'lgu';
    if (role === ROLES.ADMIN) dept = 'admin';
    setFormData(prev => ({ ...prev, role, department: dept }));
  };

  const handleAddClick = () => {
    setIsEditing(false);
    setEditingId(null);
    const defaultRole = user?.role === ROLES.LGU_SUPERVISOR ? ROLES.LGU_EDITOR :
                        user?.role === ROLES.BFAR_SUPERVISOR ? ROLES.BFAR_VIEWER : ROLES.LGU_EDITOR;
    setFormData({ ...defaultForm, role: defaultRole });
    setShowForm(true);
    setError('');
  };

  const handleEditClick = (userData) => {
    setIsEditing(true);
    setEditingId(userData._id);
    setFormData({
      username: userData.username || '',
      email: userData.email || '',
      password: '',
      fullName: userData.fullName || '',
      role: userData.role || 'lgu_user',
      department: userData.department || 'lgu',
      city: userData.city || '',
      region: userData.region || '',
      active: userData.active !== false,
    });
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validate required fields
    if (!formData.username || !formData.email || !formData.fullName) {
      setError('Username, Email, and Full Name are required');
      return;
    }
    if (!isEditing && !formData.password) {
      setError('Password is required for new users');
      return;
    }

    try {
      if (isEditing) {
        const body = {
          username: formData.username,
          email: formData.email,
          fullName: formData.fullName,
          role: formData.role,
          department: formData.department,
          city: formData.city,
          region: formData.region,
          active: formData.active,
        };
        if (formData.password) body.password = formData.password;

        const response = await usersAPI.update(editingId, body);

        // Update AuthContext if editing self
        if (user && (editingId === user._id || editingId === user.id)) {
          updateUser({ username: body.username, email: body.email, fullName: body.fullName, role: body.role });
        }

        setSuccessMessage('User updated successfully');
      } else {
        await usersAPI.create(formData);
        setSuccessMessage('User created successfully');
      }

      setShowForm(false);
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      if (err.response?.data?.duplicate) {
        setError(`Duplicate: ${msg}`);
      } else {
        setError(msg);
      }
    }
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this user? This cannot be undone.')) {
      try {
        await usersAPI.delete(id);
        setSuccessMessage('User deleted successfully');
        fetchUsers();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setError('');
    setIsEditing(false);
    setEditingId(null);
  };

  // Determine which users this user can edit/delete
  const canEditUser = (targetUser) => {
    if (isTopAdmin(user)) return true;
    if (isLguSupervisor(user) && [ROLES.LGU_SUPERVISOR, ROLES.LGU_EDITOR].includes(targetUser.role)) return true;
    if (isBfarSupervisor(user) && targetUser.role !== ROLES.ADMIN) return true;
    return user?._id === targetUser._id || user?.id === targetUser._id;
  };

  const canDeleteUser = (targetUser) => {
    if (!isTopAdmin(user)) return false;
    return user?._id !== targetUser._id && user?.id !== targetUser._id;
  };

  const creatableRoles = getCreatableRoles(user);
  const filteredUsers = users.filter(u =>
    !searchTerm ||
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={handleLogout} />
      <div className="main-content">
        <Header title="MANAGE ACCOUNT" user={user} />
        <div className="manage-account-content">
          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}

          {!showForm && (
            <div>
              <div className="manage-header">
                <h2>User Management</h2>
                {canCreateUsers(user) && (
                  <button className="add-btn" onClick={handleAddClick}>+ Add New User</button>
                )}
              </div>

              {/* Search */}
              <div className="user-search-bar">
                <input
                  type="text"
                  placeholder="Search by name, username, or email..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              {loading ? (
                <p>Loading users...</p>
              ) : filteredUsers.length === 0 ? (
                <p>No users found</p>
              ) : (
                <div className="table-section">
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Department</th>
                        <th>City</th>
                        <th>Region</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((userData) => {
                        const badgeStyle = getRoleBadgeColor(userData.role);
                        return (
                          <tr key={userData._id}>
                            <td>{userData.username}</td>
                            <td>{userData.fullName}</td>
                            <td>{userData.email}</td>
                            <td>
                              <span
                                className="role-badge"
                                style={{ background: badgeStyle.bg, color: badgeStyle.text }}
                              >
                                {getRoleDisplayName(userData.role)}
                              </span>
                            </td>
                            <td>{userData.department || '-'}</td>
                            <td>{userData.city || '-'}</td>
                            <td>{userData.region || '-'}</td>
                            <td>
                              <span className={`status-badge ${userData.active !== false ? 'active' : 'inactive'}`}>
                                {userData.active !== false ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td>
                              <div className="action-buttons">
                                {canEditUser(userData) && (
                                  <button className="edit-btn" onClick={() => handleEditClick(userData)}>
                                    Edit
                                  </button>
                                )}
                                {canDeleteUser(userData) && (
                                  <button className="delete-btn" onClick={() => handleDeleteClick(userData._id)}>
                                    Delete
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {showForm && (
            <div className="form-section">
              <h2>{isEditing ? 'Edit User' : 'Add New User'}</h2>
              <form onSubmit={handleSubmit} className="user-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Username *</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleFormChange}
                      placeholder="Enter username"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      placeholder="Enter email"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Password {isEditing ? '(leave blank to keep)' : '*'}</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleFormChange}
                      placeholder={isEditing ? 'Leave blank to keep current' : 'Enter password (min 6 chars)'}
                      required={!isEditing}
                      minLength={6}
                    />
                  </div>

                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleFormChange}
                      placeholder="Enter full name"
                      required
                    />
                  </div>

                  {creatableRoles.length > 0 && (
                    <div className="form-group">
                      <label>Role *</label>
                      <select name="role" value={formData.role} onChange={handleRoleChange} required>
                        {creatableRoles.map(role => (
                          <option key={role} value={role}>{getRoleDisplayName(role)}</option>
                        ))}
                      </select>
                      <small className="help-text">
                        {formData.role === ROLES.LGU_EDITOR      && 'LGU Editors submit data that goes to approval queue'}
                        {formData.role === ROLES.LGU_SUPERVISOR   && 'LGU Supervisors approve submissions and manage their city data'}
                        {formData.role === ROLES.BFAR_VIEWER      && 'BFAR Viewers have read-only access to all data'}
                        {formData.role === ROLES.BFAR_SUPERVISOR  && 'BFAR Supervisors have full data access, manage users, and approve submissions'}
                        {formData.role === ROLES.ADMIN            && 'Admin has complete system access'}
                      </small>
                    </div>
                  )}

                  <div className="form-group">
                    <label>Department</label>
                    <select name="department" value={formData.department} onChange={handleFormChange}>
                      <option value="bfar">BFAR</option>
                      <option value="lgu">LGU</option>
                      {isTopAdmin(user) && <option value="admin">Admin</option>}
                    </select>
                  </div>

                  {[ROLES.LGU_SUPERVISOR, ROLES.LGU_EDITOR].includes(formData.role) && (
                    <div className="form-group">
                      <label>City / Municipality *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleFormChange}
                        placeholder="e.g. Navotas, Malabon"
                        required
                      />
                      <small className="help-text">LGU users can only see data for their assigned city</small>
                    </div>
                  )}

                  <div className="form-group">
                    <label>Region</label>
                    <input
                      type="text"
                      name="region"
                      value={formData.region}
                      onChange={handleFormChange}
                      placeholder="e.g. NCR, Region 1"
                    />
                  </div>

                  {(isTopAdmin(user) || isLguSupervisor(user) || isBfarSupervisor(user)) && (
                    <div className="form-group checkbox">
                      <label>
                        <input
                          type="checkbox"
                          name="active"
                          checked={formData.active}
                          onChange={handleFormChange}
                        />
                        <span>Active Account</span>
                      </label>
                    </div>
                  )}
                </div>

                <div className="form-buttons">
                  <button type="submit" className="submit-btn">
                    {isEditing ? 'Update User' : 'Create User'}
                  </button>
                  <button type="button" className="cancel-btn" onClick={handleCancel}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
