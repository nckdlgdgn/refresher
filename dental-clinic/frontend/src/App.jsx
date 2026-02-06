
import React, { useState, useEffect } from 'react';
import './App.css';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Treatments from './components/Treatments';
import Dashboard from './components/Dashboard';
import Appointments from './components/Appointments';
import Calendar from './components/Calendar';
import Patients from './components/Patients';
import Dentists from './components/Dentists';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Accounts from './components/Accounts';
import Profile from './components/Profile';
import Auth from './components/Auth';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [role, setRole] = useState(() => localStorage.getItem('role'));
  const [username, setUsername] = useState(() => localStorage.getItem('username'));
  const [page, setPage] = useState('Dashboard');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [profilePic, setProfilePic] = useState(() => localStorage.getItem('profilePic') || null);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileMenuOpen]);

  const handleAuth = (jwt, userRole, user) => {
    setToken(jwt);
    setRole(userRole);
    setUsername(user);
    localStorage.setItem('token', jwt);
    localStorage.setItem('role', userRole);
    localStorage.setItem('username', user);
  };

  const handleLogout = () => {
    setToken(null);
    setRole(null);
    setUsername(null);
    setProfilePic(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('profilePic');
  };

  const handleProfilePicChange = (pic) => {
    setProfilePic(pic);
  };

  if (!token) {
    return <Auth onAuth={handleAuth} />;
  }

  let content;
  if (page === 'Dashboard') content = <Dashboard username={username} role={role} />;
  else if (page === 'Appointments') content = <Appointments />;
  else if (page === 'Calendar') content = <Calendar />;
  else if (page === 'Patients') content = <Patients />;
  else if (page === 'Dentists') content = <Dentists />;
  else if (page === 'Reports') content = <Reports />;
  else if (page === 'Settings') content = <Settings theme={theme} setTheme={setTheme} />;
  else if (page === 'Accounts') {
    if (role === 'admin') {
      content = <Accounts />;
    } else {
      content = (
        <div className="access-denied">
          <div className="access-denied-icon">🔒</div>
          <h2>Access Denied</h2>
          <p>Administrator privileges required to access this page.</p>
        </div>
      );
    }
  }
  else if (page === 'Treatments') content = <Treatments />;
  else if (page === 'Profile') content = <Profile profilePic={profilePic} onProfilePicChange={handleProfilePicChange} />;
  else content = (
    <div className="not-found">
      <h2>Page Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
    </div>
  );

  return (
    <div className={`app-container modern-app ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
        role={role}
        username={username}
        onLogout={handleLogout}
        onNavigate={setPage}
        mobileOpen={mobileMenuOpen}
        onMobileToggle={() => setMobileMenuOpen((o) => !o)}
        activePage={page}
        profilePic={profilePic}
      />
      <Header
        username={username}
        role={role}
        onNavigate={setPage}
        onLogout={handleLogout}
        profilePic={profilePic}
        onProfilePicChange={handleProfilePicChange}
      />
      <main className="main-content modern-main">
        <div className="page-content">
          {content}
        </div>
      </main>
    </div>
  );
}

export default App;
