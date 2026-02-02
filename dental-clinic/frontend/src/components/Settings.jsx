import React from 'react';
import './Settings.css';

const themes = [
  { id: 'light', name: 'Light Mode', icon: '☀️', description: 'Clean and bright interface' },
  { id: 'dark', name: 'Dark Mode', icon: '🌙', description: 'Easy on the eyes at night' },
  { id: 'seagreen', name: 'Sea Green', icon: '🌊', description: 'Classic dental theme' },
  { id: 'ocean', name: 'Ocean Blue', icon: '🐋', description: 'Calm blue tones' },
  { id: 'sunset', name: 'Sunset', icon: '🌅', description: 'Warm orange gradients' },
  { id: 'lavender', name: 'Lavender', icon: '💜', description: 'Soft purple aesthetic' },
];

export default function Settings({ theme, setTheme }) {
  const username = localStorage.getItem('username') || 'User';
  const role = localStorage.getItem('role') || 'staff';

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2>⚙️ Settings</h2>
      </div>

      {/* User Info */}
      <div className="settings-section">
        <h3>👤 Account Information</h3>
        <div className="settings-card">
          <div className="user-info">
            <div className="user-avatar">{username.charAt(0).toUpperCase()}</div>
            <div className="user-details">
              <h4>{username}</h4>
              <p className="user-role">{role.charAt(0).toUpperCase() + role.slice(1)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Theme Selection */}
      <div className="settings-section">
        <h3>🎨 Appearance</h3>
        <p className="section-description">Choose your preferred theme for the application</p>
        <div className="themes-grid">
          {themes.map((t) => (
            <div
              key={t.id}
              className={`theme-card ${theme === t.id ? 'active' : ''}`}
              onClick={() => setTheme(t.id)}
            >
              <div className={`theme-preview theme-${t.id}`}>
                <span className="theme-icon">{t.icon}</span>
              </div>
              <div className="theme-info">
                <h4>{t.name}</h4>
                <p>{t.description}</p>
              </div>
              {theme === t.id && (
                <div className="theme-check">✓</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Settings */}
      <div className="settings-section">
        <h3>🔧 Preferences</h3>
        <div className="settings-card">
          <div className="setting-row">
            <div className="setting-info">
              <h4>Email Notifications</h4>
              <p>Receive appointment reminders via email</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="setting-row">
            <div className="setting-info">
              <h4>SMS Notifications</h4>
              <p>Get text messages for urgent updates</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="setting-row">
            <div className="setting-info">
              <h4>Sound Alerts</h4>
              <p>Play sound for new appointments</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="settings-section">
        <h3>ℹ️ About</h3>
        <div className="settings-card about-card">
          <p><strong>Classic Dental Scheduling System</strong></p>
          <p>Version 1.0.0</p>
          <p className="copyright">© 2026 Classic Dental Clinic. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}