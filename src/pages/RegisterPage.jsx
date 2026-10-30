// src/pages/RegisterPage.jsx
// ─────────────────────────────────────────────────────────────────────
// Registration form page.
// Sends POST /api/auth/register with user details.
// On success, auto-logs in by calling onLogin(user).
// ─────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { registerUser } from '../api/authApi';

/**
 * Props:
 *   onLogin   – fn(user) called after successful registration (auto-login)
 *   onGoLogin – fn()     switches view back to Login page
 */
export default function RegisterPage({ onLogin, onGoLogin }) {
  // ── Form state ──────────────────────────────────────────────────────
  const [form, setForm] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors]       = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading]     = useState(false);

  // ── Handlers ────────────────────────────────────────────────────────

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    setServerError('');
  }

  function validate() {
    const errs = {};
    if (!form.fullName.trim())
      errs.fullName = 'Full name is required.';
    if (!form.username.trim())
      errs.username = 'Username is required.';
    else if (form.username.trim().length < 3)
      errs.username = 'Username must be at least 3 characters.';
    if (!form.email.trim())
      errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Please enter a valid email address.';
    if (!form.password)
      errs.password = 'Password is required.';
    else if (form.password.length < 6)
      errs.password = 'Password must be at least 6 characters.';
    if (!form.confirmPassword)
      errs.confirmPassword = 'Please confirm your password.';
    else if (form.password !== form.confirmPassword)
      errs.confirmPassword = 'Passwords do not match.';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setServerError('');
    try {
      const res = await registerUser(form);
      const user = res.data; // { id, fullName, username, email, createdAt, message }

      // Persist user in localStorage and auto-login
      localStorage.setItem('quizUser', JSON.stringify(user));
      onLogin(user);
    } catch (err) {
      // Show field errors from backend if available
      const fieldErrors = err.response?.data?.fieldErrors;
      if (fieldErrors) {
        setErrors(fieldErrors);
      } else {
        const msg = err.response?.data?.message || 'Registration failed. Please try again.';
        setServerError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">

        {/* Logo / brand */}
        <div className="auth-brand">
          <span className="auth-brand-icon">⚡</span>
          <span className="auth-brand-name">Quiz<span>Pro</span></span>
        </div>

        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Join QuizPro and start testing your knowledge</p>

        {/* Server error */}
        {serverError && (
          <div className="auth-alert auth-alert-error">
            <span>❌</span> {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>

          {/* Full Name */}
          <div className="auth-form-group">
            <label className="auth-label" htmlFor="fullName">Full Name</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">✏️</span>
              <input
                id="fullName"
                name="fullName"
                type="text"
                className={`auth-input ${errors.fullName ? 'auth-input-error' : ''}`}
                placeholder="Your full name"
                value={form.fullName}
                onChange={handleChange}
                autoFocus
                autoComplete="name"
              />
            </div>
            {errors.fullName && <p className="auth-field-error">{errors.fullName}</p>}
          </div>

          {/* Username */}
          <div className="auth-form-group">
            <label className="auth-label" htmlFor="reg-username">Username</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">👤</span>
              <input
                id="reg-username"
                name="username"
                type="text"
                className={`auth-input ${errors.username ? 'auth-input-error' : ''}`}
                placeholder="Choose a username (min 3 chars)"
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
              />
            </div>
            {errors.username && <p className="auth-field-error">{errors.username}</p>}
          </div>

          {/* Email */}
          <div className="auth-form-group">
            <label className="auth-label" htmlFor="email">Email Address</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">📧</span>
              <input
                id="email"
                name="email"
                type="email"
                className={`auth-input ${errors.email ? 'auth-input-error' : ''}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
            {errors.email && <p className="auth-field-error">{errors.email}</p>}
          </div>

          {/* Password row — two fields side by side */}
          <div className="auth-two-col">
            <div className="auth-form-group">
              <label className="auth-label" htmlFor="reg-password">Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">🔒</span>
                <input
                  id="reg-password"
                  name="password"
                  type="password"
                  className={`auth-input ${errors.password ? 'auth-input-error' : ''}`}
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
              </div>
              {errors.password && <p className="auth-field-error">{errors.password}</p>}
            </div>

            <div className="auth-form-group">
              <label className="auth-label" htmlFor="confirmPassword">Confirm Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">🔒</span>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  className={`auth-input ${errors.confirmPassword ? 'auth-input-error' : ''}`}
                  placeholder="Repeat your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
              </div>
              {errors.confirmPassword && (
                <p className="auth-field-error">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
            id="register-submit-btn"
          >
            {loading ? (
              <><span className="auth-btn-spinner" /> Creating account…</>
            ) : (
              'Create Account →'
            )}
          </button>
        </form>

        {/* Switch to login */}
        <p className="auth-switch">
          Already have an account?{' '}
          <button className="auth-link-btn" onClick={onGoLogin} id="go-login-btn">
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
}
