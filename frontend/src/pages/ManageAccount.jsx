'use client';

import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { canCreateUsers, canDelete, canUpdate, isAdmin, isViewer, ROLES, getRoleDisplayName } from '../utils/permissions';
import '../styles/ManageAccount.css';

const API_URL = 'http://localhost:5000/api';

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

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    role: 'lgu',
    department: 'bfar',
    region: '',
    active: true,
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/auth/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddClick = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      fullName: '',
      role: 'lgu',
      department: 'bfar',
      region: '',
      active: true,
    });
    setShowForm(true);
    setError('');
  };

  const handleEditClick = (userData) => {
    setIsEditing(true);
    setEditingId(userData._id);
    setFormData({
      username: userData.username,
      email: userData.email,
      password: '',
      fullName: userData.fullName,
      role: userData.role,
      department: userData.department || 'bfar',
      region: userData.region || '',
      active: userData.active,
    });
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!formData.username || !formData.email || !formData.fullName) {
      setError('Please fill in all required fields');
      return;
    }

    if (isEditing && !formData.password) {
      // For editing, password is optional
    } else if (!isEditing && !formData.password) {
      setError('Password is required for new users');
      return;
    }

    try {
      let url, method, body;

      if (isEditing) {
        url = `${API_URL}/auth/users/${editingId}`;
        method = 'PUT';
        body = {
          username: formData.username,
          email: formData.email,
          fullName: formData.fullName,
          role: formData.role,
          department: formData.department,
          region: formData.region,
          active: formData.active,
        };
        if (formData.password) {
          body.password = formData.password;
        }
      } else {
        // Use the protected user creation endpoint
        url = `${API_URL}/auth/users`;
        method = 'POST';
        body = formData;
      }

      const token = localStorage.getItem('token');

      console.log('[v0] Creating/updating user with data:', body);
      console.log('[v0] Request URL:', url);

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      console.log('[v0] Response status:', response.status);
      console.log('[v0] Response headers:', response.headers.get('content-type'));

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('[v0] Non-JSON response received:', text.substring(0, 500));
        throw new Error(`Server returned non-JSON response. Status: ${response.status}. This usually means the API endpoint is not found or there's a server error.`);
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[v0] Error response:', errorData);
        throw new Error(errorData.message || 'Failed to save user');
      }

      const updatedUserData = await response.json();
      console.log('[v0] User update response:', updatedUserData);

      // If editing current user, update the AuthContext
      if (isEditing && user && (editingId === user._id || editingId === user.id)) {
        console.log('[v0] Updating current user in AuthContext');
        updateUser({
          username: body.username,
          email: body.email,
          fullName: body.fullName,
          role: body.role,
          department: body.department,
          region: body.region,
        });
      }

      setSuccessMessage(isEditing ? 'User updated successfully' : 'User added successfully');
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/auth/users/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to delete user');

        setSuccessMessage('User deleted successfully');
        fetchUsers();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setError('');
    setIsEditing(false);
    setEditingId(null);
  };

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
                  <button className="add-btn" onClick={handleAddClick}>
                    + Add New User
                  </button>
                )}
              </div>

              {loading ? (
                <p>Loading users...</p>
              ) : users.length === 0 ? (
                <p>No users found</p>
              ) : (
                <div className="table-section">
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Full Name</th>
                        <th>Role</th>
                        <th>Department</th>
                        <th>Region</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((userData) => (
                        <tr key={userData._id}>
                          <td>{userData.username}</td>
                          <td>{userData.email}</td>
                          <td>{userData.fullName}</td>
                          <td>
                            <span className="role-badge">{getRoleDisplayName(userData.role)}</span>
                          </td>
                          <td>{userData.department}</td>
                          <td>{userData.region || '-'}</td>
                          <td>
                            <span className={`status-badge ${userData.active ? 'active' : 'inactive'}`}>
                              {userData.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            {(isAdmin(user) || user.id === userData._id || user._id === userData._id) && (
                              <button
                                className="edit-btn"
                                onClick={() => handleEditClick(userData)}
                              >
                                Edit
                              </button>
                            )}
                            {canDelete(user) && (
                              <button
                                className="delete-btn"
                                onClick={() => handleDeleteClick(userData._id)}
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
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
                    <label>Password {isEditing ? '(Leave blank to keep current)' : '*'}</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleFormChange}
                      placeholder={isEditing ? 'Leave blank to keep current password' : 'Enter password'}
                      required={!isEditing}
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

                  <div className="form-group">
                    <label>Role</label>
                    <select name="role" value={formData.role} onChange={handleFormChange} disabled={isViewer(user)}>
                      {isAdmin(user) && <option value={ROLES.ADMIN}>Super Admin</option>}
                      {isAdmin(user) && <option value={ROLES.VIEWER}>Viewer</option>}
                      <option value={ROLES.LGU}>LGU User</option>
                    </select>
                    {isViewer(user) && (
                      <small className="help-text">Viewers can only create LGU user accounts</small>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Department</label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleFormChange}
                    >
                      <option value="bfar">BFAR</option>
                      <option value="lgu">LGU</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Region</label>
                    <input
                      type="text"
                      name="region"
                      value={formData.region}
                      onChange={handleFormChange}
                      placeholder="Enter region"
                    />
                  </div>

                  <div className="form-group checkbox">
                    <label>
                      <input
                        type="checkbox"
                        name="active"
                        checked={formData.active}
                        onChange={handleFormChange}
                      />
                      <span>Active</span>
                    </label>
                  </div>
                </div>

                <div className="form-buttons">
                  <button type="submit" className="submit-btn">
                    {isEditing ? 'Update User' : 'Add User'}
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
