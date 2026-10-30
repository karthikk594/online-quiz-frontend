// src/pages/AdminPage.jsx
// ─────────────────────────────────────────────────────────────────────
// Admin panel to manage quiz questions.
//
// Features:
//   • View all questions in a table (loaded from GET /api/questions)
//   • Search/filter questions by text
//   • Create new questions (POST /api/questions)
//   • Edit existing questions (PUT /api/questions/{id})
//   • Delete questions with confirmation (DELETE /api/questions/{id})
// ─────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import {
  fetchQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from '../api/quizApi';
import QuestionForm from '../components/QuestionForm';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';

export default function AdminPage() {
  // ── State ────────────────────────────────────────────────────────────
  const [questions, setQuestions]     = useState([]);   // all questions from backend
  const [search, setSearch]           = useState('');   // search/filter text
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [successMsg, setSuccessMsg]   = useState('');
  const [errorMsg, setErrorMsg]       = useState('');

  // Modal state
  const [showForm, setShowForm]       = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null); // null = create mode

  // ── Load questions on mount ──────────────────────────────────────────
  useEffect(() => {
    loadQuestions();
  }, []);

  async function loadQuestions() {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetchQuestions();
      setQuestions(res.data);
    } catch (err) {
      setErrorMsg('Failed to load questions. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  // ── Clear messages after 4 seconds ──────────────────────────────────
  function showSuccess(msg) {
    setSuccessMsg(msg);
    setErrorMsg('');
    setTimeout(() => setSuccessMsg(''), 4000);
  }

  function showError(msg) {
    setErrorMsg(msg);
    setSuccessMsg('');
  }

  // ── Open modal for create ────────────────────────────────────────────
  function handleAddNew() {
    setEditingQuestion(null);
    setShowForm(true);
  }

  // ── Open modal for edit ──────────────────────────────────────────────
  function handleEdit(question) {
    setEditingQuestion(question);
    setShowForm(true);
  }

  // ── Close modal ──────────────────────────────────────────────────────
  function handleCancel() {
    setShowForm(false);
    setEditingQuestion(null);
  }

  // ── Create or Update ─────────────────────────────────────────────────
  async function handleSave(formData) {
    setSaving(true);
    try {
      if (editingQuestion) {
        // UPDATE existing question
        await updateQuestion(editingQuestion.id, formData);
        showSuccess(`✅ Question #${editingQuestion.id} updated successfully.`);
      } else {
        // CREATE new question
        await createQuestion(formData);
        showSuccess('✅ New question created successfully.');
      }
      setShowForm(false);
      setEditingQuestion(null);
      await loadQuestions(); // refresh the list
    } catch (err) {
      // Show validation errors from backend if available
      const fieldErrors = err.response?.data?.fieldErrors;
      if (fieldErrors) {
        const msgs = Object.entries(fieldErrors)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join(' | ');
        showError(`Validation Error: ${msgs}`);
      } else {
        showError(err.response?.data?.message || 'Failed to save question.');
      }
    } finally {
      setSaving(false);
    }
  }

  // ── Delete with confirmation ─────────────────────────────────────────
  async function handleDelete(question) {
    const confirmed = window.confirm(
      `Delete question:\n"${question.questionText}"?\n\nThis cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await deleteQuestion(question.id);
      showSuccess(`🗑️ Question #${question.id} deleted.`);
      // Remove from local state immediately (optimistic update)
      setQuestions((prev) => prev.filter((q) => q.id !== question.id));
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete question.');
    }
  }

  // ── Filtered questions (client-side search) ──────────────────────────
  const filtered = questions.filter((q) =>
    q.questionText.toLowerCase().includes(search.toLowerCase()) ||
    q.optionA.toLowerCase().includes(search.toLowerCase()) ||
    q.optionB.toLowerCase().includes(search.toLowerCase()) ||
    q.optionC.toLowerCase().includes(search.toLowerCase()) ||
    q.optionD.toLowerCase().includes(search.toLowerCase())
  );

  // ── Render ───────────────────────────────────────────────────────────
  if (loading) return <Spinner message="Loading questions…" />;

  return (
    <div className="admin-page">

      {/* ── Page Header ── */}
      <h1 className="page-title">🛠️ Admin Panel</h1>
      <p className="page-subtitle">
        Manage quiz questions — create, edit, or delete questions that students will answer.
      </p>

      {/* ── Messages ── */}
      {successMsg && <Alert type="success" message={successMsg} />}
      {errorMsg   && <Alert type="error"   message={errorMsg}   />}

      {/* ── Toolbar: Search + Add Button ── */}
      <div className="admin-toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="form-input"
            placeholder="Search questions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="search-questions"
          />
        </div>
        <button className="btn btn-primary" onClick={handleAddNew} id="add-question-btn">
          ➕ Add Question
        </button>
      </div>

      {/* ── Stats Bar ── */}
      <p className="text-muted" style={{ marginBottom: '1rem' }}>
        Showing {filtered.length} of {questions.length} question(s)
        {search && ` matching "${search}"`}
      </p>

      {/* ── Questions Table ── */}
      <div className="questions-table-wrap">
        <table className="questions-table">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>#</th>
              <th>Question</th>
              <th>Option A</th>
              <th>Option B</th>
              <th>Option C</th>
              <th>Option D</th>
              <th style={{ width: '80px', textAlign: 'center' }}>Answer</th>
              <th style={{ width: '130px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="no-data">
                    <div className="no-data-icon">📭</div>
                    <p>
                      {search
                        ? `No questions match "${search}"`
                        : 'No questions yet. Click "Add Question" to get started.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((q) => (
                <tr key={q.id}>
                  <td className="text-muted">{q.id}</td>
                  <td className="q-text-cell" title={q.questionText}>
                    {q.questionText}
                  </td>
                  <td className="text-muted">{q.optionA}</td>
                  <td className="text-muted">{q.optionB}</td>
                  <td className="text-muted">{q.optionC}</td>
                  <td className="text-muted">{q.optionD}</td>
                  <td style={{ textAlign: 'center' }}>
                    {/* NOTE: correctAnswer is NOT returned by the backend for GET /questions.
                        The admin page shows '?' to reflect this security design.
                        The edit form lets you set/change it. */}
                    <span className="answer-badge" title="Correct answer is hidden from GET /questions">?</span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleEdit(q)}
                        title="Edit question"
                        id={`edit-btn-${q.id}`}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(q)}
                        title="Delete question"
                        id={`delete-btn-${q.id}`}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Modal Form ── */}
      {showForm && (
        <QuestionForm
          question={editingQuestion}
          onSave={handleSave}
          onCancel={handleCancel}
          saving={saving}
        />
      )}
    </div>
  );
}
