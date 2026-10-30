// src/pages/QuizPage.jsx
// ─────────────────────────────────────────────────────────────────────
// The main student-facing quiz page.
//
// Flow:
//   1. Fetch all questions from GET /api/questions
//   2. Student selects one option per question (radio style)
//   3. Student clicks "Submit Quiz"
//   4. POST /api/questions/submit sends answers
//   5. Display score + reveal correct/wrong answers inline
// ─────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { fetchQuestions, submitQuiz } from '../api/quizApi';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';

export default function QuizPage() {
  // ── State ────────────────────────────────────────────────────────────
  const [questions, setQuestions]   = useState([]);   // loaded from backend
  const [answers, setAnswers]       = useState({});   // { questionId: 'A'|'B'|'C'|'D' }
  const [result, setResult]         = useState(null); // { score, totalQuestions, correctAnswers }
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');
  const [validationMsg, setValidationMsg] = useState('');

  // ── Load questions on mount ──────────────────────────────────────────
  useEffect(() => {
    loadQuestions();
  }, []);

  async function loadQuestions() {
    setLoading(true);
    setError('');
    try {
      const res = await fetchQuestions();
      setQuestions(res.data);
    } catch (err) {
      setError('Could not load questions. Please make sure the backend is running on http://localhost:8080');
    } finally {
      setLoading(false);
    }
  }

  // ── Handle option selection ──────────────────────────────────────────
  function handleSelect(questionId, option) {
    // Ignore selections after submission
    if (result) return;
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
    setValidationMsg('');
  }

  // ── Submit quiz ──────────────────────────────────────────────────────
  async function handleSubmit() {
    // Client-side validation: all questions must be answered
    const unanswered = questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      setValidationMsg(
        `⚠️ Please answer all questions before submitting. ${unanswered.length} question(s) remaining.`
      );
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      // Build the answers array expected by the backend
      const answersPayload = questions.map((q) => ({
        questionId:     q.id,
        selectedOption: answers[q.id],
      }));

      const res = await submitQuiz(answersPayload);
      setResult(res.data); // { score, totalQuestions, correctAnswers }
    } catch (err) {
      const msg = err.response?.data?.message || 'Submission failed. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  // ── Retry quiz ───────────────────────────────────────────────────────
  function handleRetry() {
    setAnswers({});
    setResult(null);
    setError('');
    setValidationMsg('');
  }

  // ── Derived values ───────────────────────────────────────────────────
  const answeredCount = Object.keys(answers).length;
  const totalCount    = questions.length;

  // ── Helper: get the CSS class for an option after submission ─────────
  function getOptionClass(question, option) {
    if (!result) {
      return answers[question.id] === option ? 'selected' : '';
    }
    const correct = result.correctAnswers[question.id];
    if (option === correct) return 'correct';
    if (option === answers[question.id] && option !== correct) return 'wrong';
    return '';
  }

  // ── Render ───────────────────────────────────────────────────────────
  if (loading) return <Spinner message="Loading quiz questions…" />;

  return (
    <div className="quiz-page">

      {/* ── Result Card (shown after submission) ── */}
      {result && (
        <div className="result-card" style={{ '--pct': Math.round((result.score / result.totalQuestions) * 100) }}>
          <div className="result-score-circle">
            <span className="score-number">
              {result.score}/{result.totalQuestions}
            </span>
          </div>

          <h2 className="result-title">
            {result.score === result.totalQuestions
              ? '🎉 Perfect Score!'
              : result.score >= result.totalQuestions / 2
              ? '👍 Good Job!'
              : '📚 Keep Practising!'}
          </h2>
          <p className="result-subtitle">
            You scored {result.score} out of {result.totalQuestions} questions correctly.
          </p>

          <div className="result-stats">
            <div className="stat">
              <span className="stat-value correct-stat">{result.score}</span>
              <span className="stat-label">Correct</span>
            </div>
            <div className="stat">
              <span className="stat-value wrong-stat">{result.totalQuestions - result.score}</span>
              <span className="stat-label">Wrong</span>
            </div>
            <div className="stat">
              <span className="stat-value">{Math.round((result.score / result.totalQuestions) * 100)}%</span>
              <span className="stat-label">Score</span>
            </div>
          </div>

          <div className="result-actions">
            <button className="btn btn-primary btn-lg" onClick={handleRetry}>
              🔄 Try Again
            </button>
          </div>
        </div>
      )}

      {/* ── Global error ── */}
      {error && <Alert type="error" message={error} />}

      {/* ── No questions ── */}
      {!loading && questions.length === 0 && (
        <Alert type="info" message="No questions found. Ask an admin to add some questions first." />
      )}

      {/* ── Progress bar (only before submission) ── */}
      {!result && questions.length > 0 && (
        <div className="quiz-progress">
          <div className="progress-info">
            <span>Progress</span>
            <span><strong>{answeredCount}</strong> / {totalCount} answered</span>
          </div>
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{ width: `${totalCount ? (answeredCount / totalCount) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Question Cards ── */}
      {questions.map((question, index) => {
        const options = [
          { key: 'A', text: question.optionA },
          { key: 'B', text: question.optionB },
          { key: 'C', text: question.optionC },
          { key: 'D', text: question.optionD },
        ];

        return (
          <div className="question-card" key={question.id}>
            {/* Question number badge */}
            <div className="question-number">Q{index + 1}</div>

            {/* Question text */}
            <p className="question-text">{question.questionText}</p>

            {/* Answer options */}
            <div className="options-grid">
              {options.map(({ key, text }) => {
                const optionClass = getOptionClass(question, key);
                const isDisabled  = Boolean(result); // lock after submission

                return (
                  <label
                    key={key}
                    className={`option-label ${optionClass} ${isDisabled ? 'disabled' : ''}`}
                    onClick={() => handleSelect(question.id, key)}
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={key}
                      checked={answers[question.id] === key}
                      onChange={() => handleSelect(question.id, key)}
                      disabled={isDisabled}
                    />
                    <span className="option-key">{key}</span>
                    <span className="option-text">{text}</span>

                    {/* Badge shown after submission */}
                    {result && optionClass === 'correct' && (
                      <span className="option-badge badge-correct">✓ Correct</span>
                    )}
                    {result && optionClass === 'wrong' && (
                      <span className="option-badge badge-wrong">✗ Wrong</span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* ── Submit Bar ── */}
      {questions.length > 0 && !result && (
        <div className="submit-bar">
          <div className="submit-bar-info">
            {validationMsg
              ? <span style={{ color: 'var(--color-warning)' }}>{validationMsg}</span>
              : <span>Answered <strong>{answeredCount}</strong> of <strong>{totalCount}</strong> questions</span>
            }
          </div>
          <button
            className="btn btn-success btn-lg"
            onClick={handleSubmit}
            disabled={submitting || answeredCount === 0}
          >
            {submitting ? '⏳ Submitting…' : '🚀 Submit Quiz'}
          </button>
        </div>
      )}

    </div>
  );
}
