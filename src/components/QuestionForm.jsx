// src/components/QuestionForm.jsx
// ─────────────────────────────────────────────────────────────────────
// Modal form used in the Admin page to CREATE or EDIT a quiz question.
// Validates all fields before calling the parent's onSave callback.
// ─────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';

// Initial blank form state
const BLANK = {
  questionText: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctAnswer: '',
};

/**
 * Props:
 *   question  – existing Question object (null when creating new)
 *   onSave    – async fn(formData) — called with validated form data
 *   onCancel  – fn() — closes the modal
 *   saving    – boolean — disables form while saving
 */
export default function QuestionForm({ question, onSave, onCancel, saving }) {
  // ── Form State ─────────────────────────────────────────
  const [form, setForm] = useState(BLANK);
  const [errors, setErrors] = useState({});

  // When editing, pre-populate the form with the existing question data
  useEffect(() => {
    if (question) {
      setForm({
        questionText: question.questionText || '',
        optionA:      question.optionA      || '',
        optionB:      question.optionB      || '',
        optionC:      question.optionC      || '',
        optionD:      question.optionD      || '',
        correctAnswer: question.correctAnswer || '',
      });
    } else {
      setForm(BLANK);
    }
    setErrors({});
  }, [question]);

  // ── Handlers ───────────────────────────────────────────

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear the error for this field when user starts typing
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const newErrors = {};
    if (!form.questionText.trim()) newErrors.questionText = 'Question text is required.';
    if (!form.optionA.trim())      newErrors.optionA      = 'Option A is required.';
    if (!form.optionB.trim())      newErrors.optionB      = 'Option B is required.';
    if (!form.optionC.trim())      newErrors.optionC      = 'Option C is required.';
    if (!form.optionD.trim())      newErrors.optionD      = 'Option D is required.';
    if (!form.correctAnswer)       newErrors.correctAnswer = 'Please select the correct answer.';
    return newErrors;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    // Pass clean data to parent — trim whitespace
    onSave({
      questionText:  form.questionText.trim(),
      optionA:       form.optionA.trim(),
      optionB:       form.optionB.trim(),
      optionC:       form.optionC.trim(),
      optionD:       form.optionD.trim(),
      correctAnswer: form.correctAnswer,
    });
  }

  // ── Render ─────────────────────────────────────────────
  const isEditing = Boolean(question);

  return (
    <div className="modal-overlay" onClick={onCancel}>
      {/* Stop click from closing the modal when clicking inside it */}
      <div className="modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {isEditing ? '✏️ Edit Question' : '➕ New Question'}
          </h2>
          <button className="modal-close" onClick={onCancel} title="Close">✕</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>

          {/* Question Text */}
          <div className="form-group">
            <label className="form-label" htmlFor="questionText">Question Text *</label>
            <input
              id="questionText"
              name="questionText"
              className={`form-input ${errors.questionText ? 'error-input' : ''}`}
              value={form.questionText}
              onChange={handleChange}
              placeholder="e.g. What does HTML stand for?"
              autoFocus
            />
            {errors.questionText && <p className="field-error">{errors.questionText}</p>}
          </div>

          {/* Options A–D in a 2-column grid */}
          <div className="options-form-grid">
            {['A', 'B', 'C', 'D'].map((letter) => {
              const fieldName = `option${letter}`;
              return (
                <div className="form-group" key={letter}>
                  <label className="form-label" htmlFor={fieldName}>
                    Option {letter} *
                  </label>
                  <input
                    id={fieldName}
                    name={fieldName}
                    className={`form-input ${errors[fieldName] ? 'error-input' : ''}`}
                    value={form[fieldName]}
                    onChange={handleChange}
                    placeholder={`Answer ${letter}`}
                  />
                  {errors[fieldName] && <p className="field-error">{errors[fieldName]}</p>}
                </div>
              );
            })}
          </div>

          {/* Correct Answer Selector */}
          <div className="form-group">
            <label className="form-label" htmlFor="correctAnswer">Correct Answer *</label>
            <select
              id="correctAnswer"
              name="correctAnswer"
              className={`form-select ${errors.correctAnswer ? 'error-input' : ''}`}
              value={form.correctAnswer}
              onChange={handleChange}
            >
              <option value="">-- Select correct option --</option>
              <option value="A">A — {form.optionA || '(Option A text)'}</option>
              <option value="B">B — {form.optionB || '(Option B text)'}</option>
              <option value="C">C — {form.optionC || '(Option C text)'}</option>
              <option value="D">D — {form.optionD || '(Option D text)'}</option>
            </select>
            {errors.correctAnswer && <p className="field-error">{errors.correctAnswer}</p>}
          </div>

          {/* Footer Buttons */}
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
