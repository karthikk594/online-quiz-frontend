// src/App.jsx
// ─────────────────────────────────────────────────────────────────────
// Root application component.
//
// Auth flow:
//   - On load, check localStorage for a saved user session
//   - If not logged in → show LoginPage or RegisterPage
//   - If logged in     → show the header + Quiz / Admin pages
//   - Logout clears localStorage and returns to LoginPage
// ─────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import './App.css';

import QuizPage     from './pages/QuizPage';
import AdminPage    from './pages/AdminPage';
import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

const PAGES = { QUIZ: 'quiz', ADMIN: 'admin' };
const VIEWS = { LOGIN: 'login', REGISTER: 'register', APP: 'app' };

export default function App() {
  // ── Auth state ──────────────────────────────────────────────────────
  // Try to restore a previous session from localStorage
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('quizUser');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Which auth screen to show when not logged in
  const [authView, setAuthView] = useState(VIEWS.LOGIN);

  // Which main page to show when logged in
  const [currentPage, setCurrentPage] = useState(PAGES.QUIZ);

  // ── Auth handlers ────────────────────────────────────────────────────

  function handleLogin(user) {
    setCurrentUser(user);
  }

  function handleLogout() {
    localStorage.removeItem('quizUser');
    setCurrentUser(null);
    setAuthView(VIEWS.LOGIN);
    setCurrentPage(PAGES.QUIZ);
  }

  // ── Not logged in → show auth pages ─────────────────────────────────
  if (!currentUser) {
    if (authView === VIEWS.REGISTER) {
      return (
        <RegisterPage
          onLogin={handleLogin}
          onGoLogin={() => setAuthView(VIEWS.LOGIN)}
        />
      );
    }
    return (
      <LoginPage
        onLogin={handleLogin}
        onGoRegister={() => setAuthView(VIEWS.REGISTER)}
      />
    );
  }

  // ── Logged in → show main application ───────────────────────────────
  return (
    <div className="app">

      {/* ── Header / Navigation ── */}
      <header className="header">
        <div className="header-inner">

          {/* Brand */}
          <div className="header-brand">
            <span className="brand-icon">⚡</span>
            <span>Quiz<span className="accent">Pro</span></span>
          </div>

          {/* Nav tabs */}
          <nav className="nav">
            <button
              className={`nav-btn ${currentPage === PAGES.QUIZ ? 'active' : ''}`}
              onClick={() => setCurrentPage(PAGES.QUIZ)}
              id="nav-quiz"
            >
              🎓 Take Quiz
            </button>
            <button
              className={`nav-btn ${currentPage === PAGES.ADMIN ? 'active' : ''}`}
              onClick={() => setCurrentPage(PAGES.ADMIN)}
              id="nav-admin"
            >
              🛠️ Admin
            </button>
          </nav>

          {/* User info + logout */}
          <div className="header-user">
            <div className="user-avatar">
              {currentUser.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <span className="user-name">{currentUser.fullName}</span>
              <span className="user-handle">@{currentUser.username}</span>
            </div>
            <button
              className="logout-btn"
              onClick={handleLogout}
              title="Sign out"
              id="logout-btn"
            >
              ↩ Logout
            </button>
          </div>
        </div>
      </header>

      {/* ── Page content ── */}
      <main className="main-content">
        {currentPage === PAGES.QUIZ  && <QuizPage  />}
        {currentPage === PAGES.ADMIN && <AdminPage />}
      </main>

    </div>
  );
}
