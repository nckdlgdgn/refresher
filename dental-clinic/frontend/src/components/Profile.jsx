import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../config';
import './Profile.css';

export default function Profile({ profilePic, onProfilePicChange }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);

  // Edit form states
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');
      const role = localStorage.getItem('role');

      // Get user info from token/localStorage
      setUser({
        username: username || 'User',
        role: role || 'staff',
        email: localStorage.getItem('email') || ''
      });

      // Try to get full profile from API
      const res = await fetch(`${API_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(prev => ({ ...prev, ...data.user }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // Validate
    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    if (newPassword && newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    if (newPassword && !currentPassword) {
      setMessage({ type: 'error', text: 'Current password is required to change password' });
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const updateData = {};

      if (newEmail && newEmail !== user.email) {
        updateData.email = newEmail;
      }
      if (newPassword) {
        updateData.currentPassword = currentPassword;
        updateData.newPassword = newPassword;
      }

      if (Object.keys(updateData).length === 0) {
        setMessage({ type: 'error', text: 'No changes to save' });
        setSaving(false);
        return;
      }

      const res = await fetch(`${API_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage({ type: 'success', text: 'Profile updated successfully!' });

      // Update local state
      if (newEmail) {
        setUser(prev => ({ ...prev, email: newEmail }));
        localStorage.setItem('email', newEmail);
      }

      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setEditing(false);

    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const getRoleInfo = (role) => {
    switch (role) {
      case 'admin': return { label: 'Administrator', icon: '👑', color: '#9b59b6' };
      case 'dentist': return { label: 'Dentist', icon: '🦷', color: '#3498db' };
      case 'staff': return { label: 'Staff', icon: '👤', color: '#e67e22' };
      default: return { label: role, icon: '👤', color: '#666' };
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  const roleInfo = getRoleInfo(user?.role);

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>👤 My Profile</h1>
        <p>View and manage your account information</p>
      </div>

      <div className="profile-card">
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            {user?.username?.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="profile-name-role">
            <h2>{user?.username}</h2>
            <span className="profile-role-badge" style={{ background: roleInfo.color }}>
              {roleInfo.icon} {roleInfo.label}
            </span>
          </div>
        </div>

        <div className="profile-info">
          <div className="info-item">
            <span className="info-label">👤 Username</span>
            <span className="info-value">{user?.username}</span>
          </div>
          <div className="info-item">
            <span className="info-label">📧 Email</span>
            <span className="info-value">{user?.email || 'Not set'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">🎭 Role</span>
            <span className="info-value">{roleInfo.label}</span>
          </div>
        </div>

        {!editing ? (
          <button className="edit-profile-btn" onClick={() => { setEditing(true); setNewEmail(user?.email || ''); }}>
            ✏️ Edit Profile
          </button>
        ) : (
          <form className="edit-form" onSubmit={handleUpdateProfile}>
            <h3>Edit Profile</h3>

            <div className="form-group">
              <label>📧 Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
              />
            </div>

            <div className="form-divider">
              <span>Change Password (optional)</span>
            </div>

            <div className="form-group">
              <label>🔐 Current Password</label>
              <input
                type={showPasswords ? 'text' : 'password'}
                placeholder="Enter current password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>🔑 New Password</label>
              <input
                type={showPasswords ? 'text' : 'password'}
                placeholder="Enter new password (min 6 chars)"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>🔑 Confirm New Password</label>
              <input
                type={showPasswords ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>

            <label className="show-password-toggle">
              <input
                type="checkbox"
                checked={showPasswords}
                onChange={e => setShowPasswords(e.target.checked)}
              />
              Show passwords
            </label>

            {message.text && (
              <div className={`profile-message ${message.type}`}>
                {message.text}
              </div>
            )}

            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={() => { setEditing(false); setMessage({ type: '', text: '' }); }}>
                Cancel
              </button>
              <button type="submit" className="save-btn" disabled={saving}>
                {saving ? 'Saving...' : '💾 Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
