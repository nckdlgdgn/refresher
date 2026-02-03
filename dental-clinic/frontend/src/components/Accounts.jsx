import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import './Accounts.css';

export default function Accounts() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to fetch users');
      }
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setActionMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/users/${selectedUser.id}/reset-password`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setActionMessage({ type: 'success', text: `Password reset for ${selectedUser.username}!` });
      setTimeout(() => {
        setShowResetModal(false);
        setNewPassword('');
        setActionMessage({ type: '', text: '' });
      }, 1500);
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setActionMessage({ type: 'success', text: `User ${selectedUser.username} deleted!` });
      setTimeout(() => {
        setShowDeleteModal(false);
        setActionMessage({ type: '', text: '' });
        fetchUsers();
      }, 1500);
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = filter === 'all' 
    ? users 
    : users.filter(u => u.role === filter);

  const getRoleBadgeClass = (role) => {
    switch(role) {
      case 'admin': return 'badge-admin';
      case 'dentist': return 'badge-dentist';
      case 'staff': return 'badge-staff';
      default: return 'badge-default';
    }
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'admin': return '👑';
      case 'dentist': return '🦷';
      case 'staff': return '👤';
      default: return '👤';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stats = {
    total: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    dentist: users.filter(u => u.role === 'dentist').length,
    staff: users.filter(u => u.role === 'staff').length
  };

  return (
    <div className="accounts-page">
      <div className="accounts-header">
        <div className="header-title">
          <h1>👥 User Accounts</h1>
          <p>Manage all registered accounts in the system</p>
        </div>
        <button className="refresh-btn" onClick={fetchUsers} disabled={loading}>
          {loading ? '⏳' : '🔄'} Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card total" onClick={() => setFilter('all')}>
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Total Users</span>
          </div>
        </div>
        <div className="stat-card admin" onClick={() => setFilter('admin')}>
          <div className="stat-icon">👑</div>
          <div className="stat-info">
            <span className="stat-number">{stats.admin}</span>
            <span className="stat-label">Admins</span>
          </div>
        </div>
        <div className="stat-card dentist" onClick={() => setFilter('dentist')}>
          <div className="stat-icon">🦷</div>
          <div className="stat-info">
            <span className="stat-number">{stats.dentist}</span>
            <span className="stat-label">Dentists</span>
          </div>
        </div>
        <div className="stat-card staff" onClick={() => setFilter('staff')}>
          <div className="stat-icon">👤</div>
          <div className="stat-info">
            <span className="stat-number">{stats.staff}</span>
            <span className="stat-label">Staff</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button 
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({stats.total})
        </button>
        <button 
          className={`filter-tab ${filter === 'admin' ? 'active' : ''}`}
          onClick={() => setFilter('admin')}
        >
          Admins ({stats.admin})
        </button>
        <button 
          className={`filter-tab ${filter === 'dentist' ? 'active' : ''}`}
          onClick={() => setFilter('dentist')}
        >
          Dentists ({stats.dentist})
        </button>
        <button 
          className={`filter-tab ${filter === 'staff' ? 'active' : ''}`}
          onClick={() => setFilter('staff')}
        >
          Staff ({stats.staff})
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <span>⚠️ {error}</span>
          <button onClick={fetchUsers}>Try Again</button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading accounts...</p>
        </div>
      )}

      {/* Users Table */}
      {!loading && !error && (
        <div className="users-table-container">
          {filteredUsers.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <h3>No users found</h3>
              <p>{filter === 'all' ? 'No accounts registered yet' : `No ${filter} accounts found`}</p>
            </div>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr key={user.id} style={{ animationDelay: `${index * 0.05}s` }}>
                    <td className="id-cell">#{user.id}</td>
                    <td className="username-cell">
                      <span className="user-avatar">{user.username.charAt(0).toUpperCase()}</span>
                      <span className="username-text">{user.username}</span>
                    </td>
                    <td className="email-cell">
                      <span className="email-text">{user.email || '—'}</span>
                    </td>
                    <td>
                      <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                        {getRoleIcon(user.role)} {user.role}
                      </span>
                    </td>
                    <td className="date-cell">{formatDate(user.created_at)}</td>
                    <td className="actions-cell">
                      <button 
                        className="action-btn reset-btn"
                        onClick={() => { setSelectedUser(user); setShowResetModal(true); }}
                        title="Reset Password"
                      >
                        🔑
                      </button>
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => { setSelectedUser(user); setShowDeleteModal(true); }}
                        title="Delete User"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="modal-overlay" onClick={() => { setShowResetModal(false); setNewPassword(''); setActionMessage({ type: '', text: '' }); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>🔑 Reset Password</h3>
            <p>Set new password for <strong>{selectedUser?.username}</strong></p>
            <input
              type="password"
              placeholder="New Password (min 6 chars)"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              minLength={6}
            />
            {actionMessage.text && (
              <div className={`action-message ${actionMessage.type}`}>
                {actionMessage.text}
              </div>
            )}
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => { setShowResetModal(false); setNewPassword(''); setActionMessage({ type: '', text: '' }); }}>
                Cancel
              </button>
              <button className="confirm-btn" onClick={handleResetPassword} disabled={actionLoading}>
                {actionLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => { setShowDeleteModal(false); setActionMessage({ type: '', text: '' }); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>🗑️ Delete User</h3>
            <p>Are you sure you want to delete <strong>{selectedUser?.username}</strong>?</p>
            <p className="warning-text">⚠️ This action cannot be undone!</p>
            {actionMessage.text && (
              <div className={`action-message ${actionMessage.type}`}>
                {actionMessage.text}
              </div>
            )}
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => { setShowDeleteModal(false); setActionMessage({ type: '', text: '' }); }}>
                Cancel
              </button>
              <button className="delete-confirm-btn" onClick={handleDeleteUser} disabled={actionLoading}>
                {actionLoading ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
