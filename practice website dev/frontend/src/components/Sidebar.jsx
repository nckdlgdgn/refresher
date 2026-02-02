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
    { label: 'Reports' },
    { label: 'Settings' },
    { label: 'Logout' },
  ],
  staff: [
    { label: 'Dashboard' },
    { label: 'Appointments' },
    { label: 'Calendar' },
    { label: 'Patients' },
    { label: 'Dentists' },
    { label: 'Settings' },
    { label: 'Logout' },
  ],
  dentist: [
    { label: 'Dashboard' },
    { label: 'Appointments' },
    { label: 'Calendar' },
    { label: 'Settings' },
    { label: 'Logout' },
  ],
};


export default function Sidebar({ collapsed, onToggle, role, onLogout, onNavigate }) {
  const navItems = navItemsByRole[role] || [];
  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-header">
        <span className="sidebar-logo">🦷</span>
        {!collapsed && <span className="sidebar-title">Classic Dental</span>}
        <button className="sidebar-toggle" onClick={onToggle} title="Toggle sidebar">
          {collapsed ? '➡️' : '⬅️'}
        </button>
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
