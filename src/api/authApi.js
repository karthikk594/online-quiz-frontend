// src/api/authApi.js
// ─────────────────────────────────────────────────────────
// Axios calls for user authentication endpoints.
// ─────────────────────────────────────────────────────────

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

/**
 * POST /api/auth/register
 * @param {{ fullName, username, email, password, confirmPassword }} data
 */
export const registerUser = (data) => api.post('/auth/register', data);

/**
 * POST /api/auth/login
 * @param {{ username, password }} data
 */
export const loginUser = (data) => api.post('/auth/login', data);

export default api;
