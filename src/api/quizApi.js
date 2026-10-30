// src/api/quizApi.js
// ─────────────────────────────────────────────────────────
// Axios instance pre-configured with the backend base URL.
// All API calls for the quiz application go through here.
// ─────────────────────────────────────────────────────────

import axios from 'axios';

// Create an Axios instance pointing at our Spring Boot backend
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Questions ────────────────────────────────────────────

/** GET /api/questions — fetch all questions (correct answer hidden) */
export const fetchQuestions = () => api.get('/questions');

/** GET /api/questions/{id} — fetch a single question */
export const fetchQuestionById = (id) => api.get(`/questions/${id}`);

/** POST /api/questions — create a new question (admin) */
export const createQuestion = (question) => api.post('/questions', question);

/** PUT /api/questions/{id} — update an existing question (admin) */
export const updateQuestion = (id, question) => api.put(`/questions/${id}`, question);

/** DELETE /api/questions/{id} — delete a question (admin) */
export const deleteQuestion = (id) => api.delete(`/questions/${id}`);

// ── Quiz Submission ──────────────────────────────────────

/**
 * POST /api/questions/submit — submit student answers for grading.
 *
 * @param {Array<{questionId: number, selectedOption: string}>} answers
 * @returns {Promise} resolves to { score, totalQuestions, correctAnswers }
 */
export const submitQuiz = (answers) =>
  api.post('/questions/submit', { answers });

export default api;
