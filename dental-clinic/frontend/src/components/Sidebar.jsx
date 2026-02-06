import React from 'react';
import './Sidebar.css';

const icons = {
  Dashboard: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="2" fill="currentColor" opacity="0.9"/>
      <rect x="14" y="3" width="7" height="7" rx="2" fill="currentColor" opacity="0.7"/>
      <rect x="3" y="14" width="7" height="7" rx="2" fill="currentColor" opacity="0.7"/>
      <rect x="14" y="14" width="7" height="7" rx="2" fill="currentColor" opacity="0.9"/>
    </svg>
  ),
  Appointments: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <rect x="3" y="6" width="18" height="15" rx="2" fill="currentColor" opacity="0.9"/>
      <rect x="7" y="3" width="2" height="5" rx="1" fill="currentColor"/>
      <rect x="15" y="3" width="2" height="5" rx="1" fill="currentColor"/>
      <circle cx="8" cy="13" r="1.5" fill="white" opacity="0.9"/>
      <circle cx="12" cy="13" r="1.5" fill="white" opacity="0.7"/>
      <circle cx="16" cy="13" r="1.5" fill="white" opacity="0.5"/>
    </svg>
  ),
  Calendar: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <rect x="3" y="6" width="18" height="15" rx="2" fill="currentColor" opacity="0.9"/>
      <rect x="7" y="3" width="2" height="5" rx="1" fill="currentColor"/>
      <rect x="15" y="3" width="2" height="5" rx="1" fill="currentColor"/>
      <rect x="6" y="11" width="3" height="3" rx="0.5" fill="white" opacity="0.9"/>
      <rect x="10.5" y="11" width="3" height="3" rx="0.5" fill="white" opacity="0.7"/>
      <rect x="15" y="11" width="3" height="3" rx="0.5" fill="white" opacity="0.5"/>
    </svg>
  ),
  Patients: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4" fill="currentColor" opacity="0.9"/>
      <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" fill="currentColor" opacity="0.7"/>
    </svg>
  ),
  Dentists: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path d="M12 2C9 2 7 5 7 9c0 3 1 5 2 7 .5 1 1 3 1.5 4 .3.7.8 1.5 1.5 1.5s1.2-.8 1.5-1.5c.5-1 1-3 1.5-4 1-2 2-4 2-7 0-4-2-7-5-7z" fill="currentColor" opacity="0.9"/>
      <circle cx="10" cy="7" r="1" fill="white" opacity="0.7"/>
      <circle cx="14" cy="7" r="1" fill="white" opacity="0.7"/>
    </svg>
  ),
  Reports: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" opacity="0.9"/>
      <rect x="6" y="14" width="3" height="5" rx="0.5" fill="white" opacity="0.9"/>
      <rect x="10.5" y="10" width="3" height="9" rx="0.5" fill="white" opacity="0.8"/>
      <rect x="15" y="7" width="3" height="12" rx="0.5" fill="white" opacity="0.7"/>
    </svg>
  ),
  Settings: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.2"/>
      <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.9"/>
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Accounts: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <circle cx="9" cy="7" r="4" fill="currentColor" opacity="0.9"/>
      <circle cx="17" cy="7" r="3" fill="currentColor" opacity="0.6"/>
      <path d="M2 18c0-3 3-5 7-5s7 2 7 5" fill="currentColor" opacity="0.7"/>
      <path d="M14 18c0-2 2-4 5-4s5 2 5 4" fill="currentColor" opacity="0.5"/>
    </svg>
  ),
  Profile: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="5" fill="currentColor" opacity="0.9"/>
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" fill="currentColor" opacity="0.7"/>
    </svg>
  ),
  Treatments: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor" opacity="0.2"/>
      <path d="M12 7v10M7 12h10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
  Logout: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

const navItemsByRole = {
  admin: [
    { label: 'Dashboard' },
    { label: 'Appointments' },
    { label: 'Calendar' },
    { label: 'Patients' },
    { label: 'Dentists' },
    { label: 'Treatments' },
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
    { label: 'Treatments' },
    { label: 'Settings' },
    { label: 'Profile' },
    { label: 'Logout' },
  ],
  dentist: [
    { label: 'Dashboard' },
    { label: 'Appointments' },
    { label: 'Calendar' },
    { label: 'Patients' },
    { label: 'Treatments' },
    { label: 'Settings' },
    { label: 'Profile' },
    { label: 'Logout' },
  ],
};

const roleLabels = {
  admin: { label: 'Administrator', icon: '👑', color: '#8b5cf6' },
  dentist: { label: 'Dentist', icon: '🦷', color: '#3b82f6' },
  staff: { label: 'Staff', icon: '👤', color: '#f59e0b' },
};

export default function Sidebar({ 
  collapsed, 
  onToggle, 
  role, 
  username, 
  onLogout, 
  onNavigate,
  mobileOpen,
  onMobileToggle,
  activePage
}) {
  const navItems = navItemsByRole[role] || navItemsByRole.staff;
  const roleInfo = roleLabels[role] || { label: role, icon: '👤', color: '#666' };

  const handleNavClick = (label) => {
    if (label === 'Logout') {
      onLogout();
    } else {
      onNavigate && onNavigate(label);
    }
    // Close mobile menu after navigation
    if (onMobileToggle && window.innerWidth <= 768) {
      onMobileToggle();
    }
  };

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button 
        className={`mobile-menu-toggle ${mobileOpen ? 'active' : ''}`}
        onClick={onMobileToggle}
        aria-label="Toggle menu"
      >
        <div className="hamburger">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>

      {/* Mobile Overlay */}
      <div 
        className={`sidebar-overlay ${mobileOpen ? 'visible' : ''}`}
        onClick={onMobileToggle}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <span className="sidebar-logo">🦷</span>
          <span className="sidebar-title">Classic Dental</span>
          <button className="sidebar-toggle" onClick={onToggle} title="Toggle sidebar">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              {collapsed ? (
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              ) : (
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              )}
            </svg>
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
              className={`sidebar-nav-item ${activePage === item.label ? 'active' : ''} ${item.label === 'Logout' ? 'logout-item' : ''}`}
              key={item.label}
              title={collapsed ? item.label : ''}
              onClick={() => handleNavClick(item.label)}
              style={item.label === 'Logout' ? { color: '#fca5a5' } : {}}
            >
              <span className="sidebar-nav-icon">{icons[item.label]}</span>
              {!collapsed && <span>{item.label}</span>}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
