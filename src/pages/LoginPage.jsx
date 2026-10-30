// src/pages/LoginPage.jsx
// ─────────────────────────────────────────────────────────────────────
// Login form page.
// Sends POST /api/auth/login with { username, password }.
// On success, saves user info to localStorage and calls onLogin(user).
// ─────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { loginUser } from '../api/authApi';

/**
 * Props:
 *   onLogin      – fn(user) called after successful login
 *   onGoRegister – fn()     switches view to Register page
 */
export default function LoginPage({ onLogin, onGoRegister }) {
  // ── Form state ──────────────────────────────────────────────────────
  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  // ── Handlers ────────────────────────────────────────────────────────

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    setServerError('');
  }

  function validate() {
    const errs = {};
    if (!form.username.trim()) errs.username = 'Username is required.';
    if (!form.password.trim()) errs.password = 'Password is required.';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setServerError('');
    try {
      const res = await loginUser(form);
      const user = res.data; // { id, fullName, username, email, createdAt, message }

      // Persist user in localStorage so the session survives page refresh
      localStorage.setItem('quizUser', JSON.stringify(user));

      onLogin(user); // tell App.jsx the user is now logged in
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Logo / brand */}
        <div className="auth-brand">
          <span className="auth-brand-icon">⚡</span>
          <span className="auth-brand-name">Quiz<span>Pro</span></span>
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to continue to your quiz</p>

        {/* Server error message */}
        {serverError && (
          <div className="auth-alert auth-alert-error">
            <span>❌</span> {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>

          {/* Username */}
          <div className="auth-form-group">
            <label className="auth-label" htmlFor="username">Username</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">👤</span>
              <input
                id="username"
                name="username"
                type="text"
                className={`auth-input ${errors.username ? 'auth-input-error' : ''}`}
                placeholder="Enter your username"
                value={form.username}
                onChange={handleChange}
                autoFocus
                autoComplete="username"
              />
            </div>
            {errors.username && <p className="auth-field-error">{errors.username}</p>}
          </div>

          {/* Password */}
          <div className="auth-form-group">
            <label className="auth-label" htmlFor="password">Password</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">🔒</span>
              <input
                id="password"
                name="password"
                type="password"
                className={`auth-input ${errors.password ? 'auth-input-error' : ''}`}
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>
            {errors.password && <p className="auth-field-error">{errors.password}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
            id="login-submit-btn"
          >
            {loading ? (
              <><span className="auth-btn-spinner" /> Signing in…</>
            ) : (
              'Sign In →'
            )}
          </button>
        </form>

        {/* Switch to register */}
        <p className="auth-switch">
          Don't have an account?{' '}
          <button className="auth-link-btn" onClick={onGoRegister} id="go-register-btn">
            Register here
          </button>
        </p>
      </div>
    </div>
  );
}
