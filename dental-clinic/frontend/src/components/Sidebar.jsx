import React from 'react';
import './Sidebar.css';



const icons = {
  Dashboard: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect x="3" y="11" width="7" height="10" rx="2" fill="#fff"/><rect x="14" y="3" width="7" height="18" rx="2" fill="#fff"/><rect x="3" y="3" width="7" height="6" rx="2" fill="#fff"/><rect x="14" y="11" width="7" height="10" rx="2" fill="#fff"/></svg>
  ),
  Appointments: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2" fill="#fff"/><rect x="7" y="2" width="2" height="4" rx="1" fill="#2e8b77"/><rect x="15" y="2" width="2" height="4" rx="1" fill="#2e8b77"/></svg>
  ),
  Calendar: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2" fill="#fff"/><rect x="7" y="2" width="2" height="4" rx="1" fill="#2e8b77"/><rect x="15" y="2" width="2" height="4" rx="1" fill="#2e8b77"/><rect x="7" y="10" width="2" height="2" rx="1" fill="#2e8b77"/></svg>
  ),
  Patients: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" fill="#fff"/><rect x="4" y="16" width="16" height="6" rx="3" fill="#fff"/></svg>
  ),
  Dentists: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><ellipse cx="12" cy="8" rx="6" ry="8" fill="#fff"/><ellipse cx="12" cy="20" rx="4" ry="2" fill="#2e8b77"/></svg>
  ),
  Reports: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" fill="#fff"/><rect x="8" y="8" width="8" height="2" rx="1" fill="#2e8b77"/><rect x="8" y="12" width="8" height="2" rx="1" fill="#2e8b77"/></svg>
  ),
  Settings: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fff"/><circle cx="12" cy="12" r="4" fill="#2e8b77"/></svg>
  ),
  Accounts: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="9" cy="7" r="4" fill="#fff"/><circle cx="17" cy="7" r="3" fill="#fff" opacity="0.7"/><rect x="2" y="14" width="14" height="6" rx="3" fill="#fff"/><rect x="12" y="15" width="10" height="5" rx="2.5" fill="#fff" opacity="0.7"/></svg>
  ),
  Profile: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="5" fill="#fff"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6" fill="#fff"/></svg>
  ),
  Logout: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" fill="#fff"/><path d="M16 12H8" stroke="#c0392b" strokeWidth="2" strokeLinecap="round"/></svg>
  ),
};

const navItemsByRole = {
  admin: [
    { label: 'Dashboard' },
    { label: 'Appointments' },
    { label: 'Calendar' },
    { label: 'Patients' },
    { label: 'Dentists' },
    { label: 'Accounts' },
    { label: 'Reports' },
    { label: 'Settings' },
    { label: 'Profile' },
    { label: 'Logout' },
  ],
  staff: [
    { label: 'Dashboard' },
    { label: 'Appointments' },
    { label: 'Calendar' },
    { label: 'Patients' },
    { label: 'Dentists' },
    { label: 'Settings' },
    { label: 'Profile' },
    { label: 'Logout' },
  ],
  dentist: [
    { label: 'Dashboard' },
    { label: 'Appointments' },
    { label: 'Calendar' },
    { label: 'Patients' },
    { label: 'Settings' },
    { label: 'Profile' },
    { label: 'Logout' },
  ],
};


const roleLabels = {
  admin: { label: 'Administrator', icon: '👑', color: '#9b59b6' },
  dentist: { label: 'Dentist', icon: '🦷', color: '#3498db' },
  staff: { label: 'Staff', icon: '👤', color: '#e67e22' },
};

export default function Sidebar({ collapsed, onToggle, role, username, onLogout, onNavigate }) {
  const navItems = navItemsByRole[role] || [];
  const roleInfo = roleLabels[role] || { label: role, icon: '👤', color: '#666' };
  
  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-header">
        <span className="sidebar-logo">🦷</span>
        {!collapsed && <span className="sidebar-title">Classic Dental</span>}
        <button className="sidebar-toggle" onClick={onToggle} title="Toggle sidebar">
          {collapsed ? '➡️' : '⬅️'}
        </button>
      </div>
      
      {/* User Info Section */}
      <div className={`sidebar-user-info ${collapsed ? 'collapsed' : ''}`}>
        <div className="user-avatar-sidebar">
          {username ? username.charAt(0).toUpperCase() : '?'}
        </div>
        {!collapsed && (
          <div className="user-details">
            <span className="user-name">{username || 'User'}</span>
            <span className="user-role-badge" style={{ background: roleInfo.color }}>
              {roleInfo.icon} {roleInfo.label}
            </span>
          </div>
        )}
        {collapsed && (
          <span className="collapsed-role-icon" title={roleInfo.label}>
            {roleInfo.icon}
          </span>
        )}
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <div
            className="sidebar-nav-item"
            key={item.label}
            title={collapsed ? item.label : ''}
            onClick={
              item.label === 'Logout'
                ? onLogout
                : () => onNavigate && onNavigate(item.label)
            }
            style={item.label === 'Logout' ? { color: '#c0392b' } : {}}
          >
            <span className="sidebar-nav-icon">{icons[item.label]}</span>
            {!collapsed && <span>{item.label}</span>}
          </div>
        ))}
      </nav>
    </aside>
  );
}
