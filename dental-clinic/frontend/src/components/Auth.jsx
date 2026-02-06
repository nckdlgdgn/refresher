import React, { useState } from 'react';
import './Auth.css';
import { API_URL } from '../config';

export default function Auth({ onAuth }) {
  // 'dentist-register' | 'dentist-login' | 'admin-login' | 'admin-register' | 'forgot' | 'reset'
  const [mode, setMode] = useState('dentist-register');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('dentist');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Determine if we're in dentist or admin/staff mode
  const isDentistMode = mode.startsWith('dentist');
  const isAdminMode = mode.startsWith('admin');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'dentist-login' || mode === 'admin-login') {
        const res = await fetch(`${API_URL}/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error');
        onAuth(data.token, data.role, data.username || username);
      } else if (mode === 'dentist-register' || mode === 'admin-register') {
        if (!email) throw new Error('Email is required');
        const registerRole = mode === 'dentist-register' ? 'dentist' : role;
        const res = await fetch(`${API_URL}/api/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password, role: registerRole, email }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error');
        setSuccess('Registered successfully! Please login.');
        if (mode === 'dentist-register') {
          setMode('dentist-login');
        } else {
          setMode('admin-login');
        }
        setEmail('');
      } else if (mode === 'forgot') {
        const res = await fetch(`${API_URL}/api/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error');
        setSuccess('Reset code sent to your email! Check your inbox.');
        setMode('reset');
      } else if (mode === 'reset') {
        const res = await fetch(`${API_URL}/api/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code: resetCode, newPassword }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error');
        setSuccess('Password changed! You can now login.');
        setMode('dentist-login');
        setResetCode('');
        setNewPassword('');
        setEmail('');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const togglePassword = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPassword(prev => !prev);
  };

  // Inline password field JSX helper (not a component)
  const renderPasswordInput = (value, setValue, placeholder = "Password") => (
    <div className="password-field">
      <input
        type={showPassword ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        required
        minLength={6}
        autoComplete="current-password"
      />
      <button
        type="button"
        className="eye-btn"
        onClick={togglePassword}
        onMouseDown={(e) => e.preventDefault()}
        tabIndex={-1}
      >
        {showPassword ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" /></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
        )}
      </button>
    </div>
  );

  const renderForgotPassword = () => (
    <>
      <div className="auth-logo">🔐</div>
      <h2>Forgot Password</h2>
      <p className="form-subtitle">Enter your email to receive a reset code</p>
      <input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <button type="submit" disabled={loading} className={`auth-btn primary ${loading ? 'loading' : ''}`}>
        {loading ? 'Sending...' : 'Send Reset Code'}
      </button>
      <button type="button" className="auth-btn ghost" onClick={() => { setMode('dentist-login'); clearMessages(); }}>
        ← Back to Login
      </button>
    </>
  );

  const renderResetPassword = () => (
    <>
      <div className="auth-logo">🔑</div>
      <h2>Reset Password</h2>
      <p className="form-subtitle">Enter the code sent to your email</p>
      <input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="6-Digit Reset Code"
        value={resetCode}
        onChange={e => setResetCode(e.target.value)}
        maxLength={6}
        required
        className="reset-code-input"
      />
      {renderPasswordInput(newPassword, setNewPassword, "New Password")}
      <button type="submit" disabled={loading} className={`auth-btn primary ${loading ? 'loading' : ''}`}>
        {loading ? 'Resetting...' : 'Change Password'}
      </button>
      <button type="button" className="auth-btn ghost" onClick={() => { setMode('dentist-login'); clearMessages(); }}>
        ← Back to Login
      </button>
    </>
  );

  const renderDentistForm = () => {
    const isLogin = mode === 'dentist-login';
    return (
      <>
        <div className="auth-logo dentist">🦷</div>
        <h2>{isLogin ? 'Dentist Login' : 'Register as Dentist'}</h2>
        <p className="form-subtitle">
          {isLogin ? 'Sign in to access your dental practice dashboard' : 'Create your dentist account to get started'}
        </p>

        {!isLogin && (
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        )}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          autoComplete="username"
        />
        {renderPasswordInput(password, setPassword)}

        <button type="submit" disabled={loading} className={`auth-btn primary ${loading ? 'loading' : ''}`}>
          {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
        </button>

        {isLogin && (
          <button type="button" className="forgot-btn" onClick={() => { setMode('forgot'); clearMessages(); }}>
            Forgot Password?
          </button>
        )}

        <div className="auth-switch">
          {isLogin ? (
            <span>New dentist? <button type="button" onClick={() => { setMode('dentist-register'); clearMessages(); }}>Register here</button></span>
          ) : (
            <span>Already registered? <button type="button" onClick={() => { setMode('dentist-login'); clearMessages(); }}>Sign in</button></span>
          )}
        </div>
      </>
    );
  };

  const renderAdminForm = () => {
    const isLogin = mode === 'admin-login';
    return (
      <>
        <div className="auth-logo admin">🏥</div>
        <h2>{isLogin ? 'Staff Portal' : 'Staff Registration'}</h2>
        <p className="form-subtitle">
          {isLogin ? 'Sign in to manage the clinic system' : 'Create an admin or staff account'}
        </p>

        {!isLogin && (
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        )}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          autoComplete="username"
        />
        {renderPasswordInput(password, setPassword)}

        {!isLogin && (
          <div className="role-selector">
            <label className={`role-option ${role === 'admin' ? 'active' : ''}`}>
              <input
                type="radio"
                name="role"
                value="admin"
                checked={role === 'admin'}
                onChange={e => setRole(e.target.value)}
              />
              <span className="role-icon">👑</span>
              <span className="role-label">Admin</span>
            </label>
            <label className={`role-option ${role === 'staff' ? 'active' : ''}`}>
              <input
                type="radio"
                name="role"
                value="staff"
                checked={role === 'staff'}
                onChange={e => setRole(e.target.value)}
              />
              <span className="role-icon">👤</span>
              <span className="role-label">Staff</span>
            </label>
          </div>
        )}

        <button type="submit" disabled={loading} className={`auth-btn primary ${loading ? 'loading' : ''}`}>
          {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
        </button>

        {isLogin && (
          <button type="button" className="forgot-btn" onClick={() => { setMode('forgot'); clearMessages(); }}>
            Forgot Password?
          </button>
        )}

        <div className="auth-switch">
          {isLogin ? (
            <span>Need an account? <button type="button" onClick={() => { setMode('admin-register'); clearMessages(); setRole('staff'); }}>Register here</button></span>
          ) : (
            <span>Already have an account? <button type="button" onClick={() => { setMode('admin-login'); clearMessages(); }}>Sign in</button></span>
          )}
        </div>
      </>
    );
  };

  const renderForm = () => {
    if (mode === 'forgot') return renderForgotPassword();
    if (mode === 'reset') return renderResetPassword();
    if (isDentistMode) return renderDentistForm();
    if (isAdminMode) return renderAdminForm();
    return renderDentistForm();
  };

  return (
    <div className="auth-container">
      {/* Mode Toggle */}
      <div className="auth-mode-toggle">
        <button
          className={`mode-btn ${isDentistMode ? 'active' : ''}`}
          onClick={() => { setMode('dentist-register'); clearMessages(); }}
          type="button"
        >
          <span className="mode-icon">🦷</span>
          <span className="mode-text">Dentist</span>
        </button>
        <button
          className={`mode-btn ${isAdminMode ? 'active' : ''}`}
          onClick={() => { setMode('admin-login'); clearMessages(); }}
          type="button"
        >
          <span className="mode-icon">🏥</span>
          <span className="mode-text">Admin / Staff</span>
        </button>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        {renderForm()}
        {success && <div className="auth-success">{success}</div>}
        {error && <div className="auth-error">{error}</div>}
      </form>

      {/* Footer */}
      <div className="auth-footer">
        <p>Classic Dental Clinic © 2024</p>
      </div>
    </div>
  );
}
