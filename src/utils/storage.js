import { hashPassword } from './hash';

// ─── USERS ────────────────────────────────────────────────────────────────────
export function getUsers() {
  return JSON.parse(localStorage.getItem('ro_users') || '[]');
}

function saveUsers(users) {
  localStorage.setItem('ro_users', JSON.stringify(users));
}

export function getUser(email) {
  return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export function createUser({ name, email, password }) {
  const users = getUsers();
  const id = `u_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const user = {
    id,
    name,
    email: email.toLowerCase(),
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);
  return user;
}

export function validateUser(email, password) {
  const user = getUser(email);
  if (!user) return null;
  if (user.passwordHash !== hashPassword(password)) return null;
  return user;
}

export function updateUser(userId, updates) {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...updates };
  saveUsers(users);
  return users[idx];
}

// ─── SESSION ──────────────────────────────────────────────────────────────────
export function getSession() {
  return JSON.parse(sessionStorage.getItem('ro_session') || 'null');
}

export function setSession(user) {
  sessionStorage.setItem(
    'ro_session',
    JSON.stringify({ userId: user.id, email: user.email, name: user.name })
  );
}

export function clearSession() {
  sessionStorage.removeItem('ro_session');
}

// ─── CART ─────────────────────────────────────────────────────────────────────
export function getCart(userId) {
  return JSON.parse(localStorage.getItem(`ro_cart_${userId}`) || '[]');
}

export function saveCart(userId, items) {
  localStorage.setItem(`ro_cart_${userId}`, JSON.stringify(items));
}

// ─── PURCHASED ────────────────────────────────────────────────────────────────
export function getPurchased(userId) {
  return JSON.parse(localStorage.getItem(`ro_purchased_${userId}`) || '[]');
}

export function savePurchased(userId, items) {
  localStorage.setItem(`ro_purchased_${userId}`, JSON.stringify(items));
}

// ─── PROGRESS ─────────────────────────────────────────────────────────────────
export function getProgress(userId, courseId) {
  const key = `ro_progress_${userId}_${courseId}`;
  return JSON.parse(
    localStorage.getItem(key) ||
      JSON.stringify({ lessonsCompleted: [], percentComplete: 0, lastWatched: null })
  );
}

export function saveProgress(userId, courseId, data) {
  localStorage.setItem(`ro_progress_${userId}_${courseId}`, JSON.stringify(data));
}

// ─── QUIZ RESULTS ─────────────────────────────────────────────────────────────
export function getQuizResult(userId, courseId) {
  return JSON.parse(localStorage.getItem(`ro_quiz_${userId}_${courseId}`) || 'null');
}

export function saveQuizResult(userId, courseId, result) {
  localStorage.setItem(`ro_quiz_${userId}_${courseId}`, JSON.stringify(result));
}

// ─── USER PREFS ───────────────────────────────────────────────────────────────
export function getUserPrefs(userId) {
  return JSON.parse(
    localStorage.getItem(`ro_prefs_${userId}`) ||
      JSON.stringify({ darkMode: true })
  );
}

export function saveUserPrefs(userId, prefs) {
  const existing = getUserPrefs(userId);
  localStorage.setItem(`ro_prefs_${userId}`, JSON.stringify({ ...existing, ...prefs }));
}

// ─── PROFILE UPDATES ──────────────────────────────────────────────────────────
export function updateUserProfile(userId, { name, email }) {
  return updateUser(userId, {
    ...(name ? { name } : {}),
    ...(email ? { email: email.toLowerCase() } : {}),
  });
}

export function updateUserPassword(userId, newHash) {
  return updateUser(userId, { passwordHash: newHash });
}

// ─── PHOTO ────────────────────────────────────────────────────────────────────
export function saveUserPhoto(userId, base64String) {
  localStorage.setItem(`ro_photo_${userId}`, base64String);
}

export function getUserPhoto(userId) {
  return localStorage.getItem(`ro_photo_${userId}`) || null;
}

export function removeUserPhoto(userId) {
  localStorage.removeItem(`ro_photo_${userId}`);
}

// ─── ASSIGNMENTS ──────────────────────────────────────────────────────────────
export function getAssignments(userId) {
  return JSON.parse(localStorage.getItem(`ro_assignments_${userId}`) || '[]');
}

export function saveAssignment(userId, assignmentData) {
  const existing = getAssignments(userId);
  localStorage.setItem(`ro_assignments_${userId}`, JSON.stringify([...existing, assignmentData]));
}

// ─── SUPPORT MESSAGES ─────────────────────────────────────────────────────────
export function getSupportMessages(userId) {
  return JSON.parse(localStorage.getItem(`ro_support_${userId}`) || '[]');
}

export function saveSupportMessages(userId, messages) {
  localStorage.setItem(`ro_support_${userId}`, JSON.stringify(messages));
}
