
import React, { useState, useEffect } from 'react';
import './App.css';


import Sidebar from './components/Sidebar';
import Treatments from './components/Treatments';
import Dashboard from './components/Dashboard';
import Appointments from './components/Appointments';
import Calendar from './components/Calendar';
import Patients from './components/Patients';
import Dentists from './components/Dentists';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Auth from './components/Auth';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [role, setRole] = useState(() => localStorage.getItem('role'));
  const [page, setPage] = useState('Dashboard');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleAuth = (jwt, userRole) => {
    setToken(jwt);
    setRole(userRole);
    localStorage.setItem('token', jwt);
    localStorage.setItem('role', userRole);
  };

  const handleLogout = () => {
    setToken(null);
    setRole(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  };

  if (!token) {
    return <Auth onAuth={handleAuth} />;
  }

  let content;
  if (page === 'Dashboard') content = <Dashboard />;
  else if (page === 'Appointments') content = <Appointments />;
  else if (page === 'Calendar') content = <Calendar />;
  else if (page === 'Patients') content = <Patients />;
  else if (page === 'Dentists') content = <Dentists />;
  else if (page === 'Reports') content = <Reports />;
  else if (page === 'Settings') content = <Settings theme={theme} setTheme={setTheme} />;
  else if (page === 'Treatments') content = <Treatments />;
  else content = <div style={{padding:'2rem'}}>Page not found</div>;

  return (
    <div className={`app-container modern-app ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
        role={role}
        onLogout={handleLogout}
        onNavigate={setPage}
      />
      <main className="main-content modern-main">
        {content}
      </main>
    </div>
  );
}

export default App;
