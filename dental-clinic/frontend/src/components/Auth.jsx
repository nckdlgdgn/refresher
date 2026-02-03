import React, { useState } from 'react';
import './Auth.css';
import { API_URL } from '../config';

export default function Auth({ onAuth }) {
  const [mode, setMode] = useState('login'); // login, register, forgot, reset
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('staff');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      if (mode === 'login') {
        const res = await fetch(`${API_URL}/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error');
        onAuth(data.token, data.role, data.username || username);
      } else if (mode === 'register') {
        if (!email) throw new Error('Email is required');
        const res = await fetch(`${API_URL}/api/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password, role, email }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error');
        setMode('login');
        setSuccess('Registered successfully! Please login.');
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
        setMode('login');
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

  const renderForm = () => {
    if (mode === 'forgot') {
      return (
        <>
          <h2>🔐 Forgot Password</h2>
          <p className="form-subtitle">Enter your email to receive a reset code</p>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={loading} className={loading ? 'loading' : ''}>
            {loading ? 'Sending...' : 'Send Reset Code'}
          </button>
          <div className="auth-switch">
            <button type="button" onClick={() => { setMode('login'); setError(''); setSuccess(''); }}>
              ← Back to Login
            </button>
          </div>
        </>
      );
    }

    if (mode === 'reset') {
      return (
        <>
          <h2>🔑 Reset Password</h2>
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
          <div className="password-field">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="New Password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          <button type="submit" disabled={loading} className={loading ? 'loading' : ''}>
            {loading ? 'Resetting...' : 'Change Password'}
          </button>
          <div className="auth-switch">
            <button type="button" onClick={() => { setMode('login'); setError(''); setSuccess(''); }}>
              ← Back to Login
            </button>
          </div>
        </>
      );
    }

    return (
      <>
        <h2>{mode === 'login' ? '🦷 Welcome Back!' : '📝 Create Account'}</h2>
        {mode === 'register' && (
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
        />
        <div className="password-field">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="eye-btn"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            )}
          </button>
        </div>
        {mode === 'register' && (
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="dentist">Dentist</option>
          </select>
        )}
        <button type="submit" disabled={loading} className={loading ? 'loading' : ''}>
          {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}
        </button>
        {mode === 'login' && (
          <button 
            type="button" 
            className="forgot-btn"
            onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}
          >
            Forgot Password?
          </button>
        )}
        <div className="auth-switch">
          {mode === 'login' ? (
            <span>
              No account?{' '}
              <button type="button" onClick={() => { setMode('register'); setError(''); setSuccess(''); }}>Register</button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button type="button" onClick={() => { setMode('login'); setError(''); setSuccess(''); }}>Login</button>
            </span>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        {renderForm()}
        {success && <div className="auth-success">{success}</div>}
        {error && <div className="auth-error">{error}</div>}
      </form>
    </div>
  );
}
