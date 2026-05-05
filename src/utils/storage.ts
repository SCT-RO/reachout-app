import { hashPassword } from './hash';
import type { User, Session, Course, LessonProgress, ContentProgress, QuizResult, UserPrefs, SupportMessage, AssignmentSubmission } from '../types';

// ─── USERS ────────────────────────────────────────────────────────────────────
export function getUsers(): User[] {
  return JSON.parse(localStorage.getItem('ro_users') || '[]');
}

function saveUsers(users: User[]): void {
  localStorage.setItem('ro_users', JSON.stringify(users));
}

export function getUser(email: string): User | null {
  return getUsers().find((u: User) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export function createUser({ name, email, password }: { name: string; email: string; password: string }): User {
  const users = getUsers();
  const id = `u_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const user: User = {
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

export function validateUser(email: string, password: string): User | null {
  const user = getUser(email);
  if (!user) return null;
  if (user.passwordHash !== hashPassword(password)) return null;
  return user;
}

export function updateUser(userId: string, updates: Partial<User>): User | null {
  const users = getUsers();
  const idx = users.findIndex((u: User) => u.id === userId);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...updates };
  saveUsers(users);
  return users[idx];
}

// ─── SESSION ──────────────────────────────────────────────────────────────────
export function getSession(): Session | null {
  return JSON.parse(sessionStorage.getItem('ro_session') || 'null');
}

export function setSession(user: User): void {
  sessionStorage.setItem(
    'ro_session',
    JSON.stringify({ userId: user.id, email: user.email, name: user.name })
  );
}

export function clearSession(): void {
  sessionStorage.removeItem('ro_session');
}

// ─── CART ─────────────────────────────────────────────────────────────────────
export function getCart(userId: string): Course[] {
  return JSON.parse(localStorage.getItem(`ro_cart_${userId}`) || '[]');
}

export function saveCart(userId: string, items: Course[]): void {
  localStorage.setItem(`ro_cart_${userId}`, JSON.stringify(items));
}

// ─── PURCHASED ────────────────────────────────────────────────────────────────
export function getPurchased(userId: string): Course[] {
  return JSON.parse(localStorage.getItem(`ro_purchased_${userId}`) || '[]');
}

export function savePurchased(userId: string, items: Course[]): void {
  localStorage.setItem(`ro_purchased_${userId}`, JSON.stringify(items));
}

export function removePurchased(userId: string, courseId: string | number): void {
  const items = getPurchased(userId).filter((p: Course) => String(p.id) !== String(courseId));
  savePurchased(userId, items);
}

// ─── PROGRESS ─────────────────────────────────────────────────────────────────
export function getProgress(userId: string, courseId: string | number): LessonProgress {
  const key = `ro_progress_${userId}_${courseId}`;
  return JSON.parse(
    localStorage.getItem(key) ||
      JSON.stringify({ lessonsCompleted: [], percentComplete: 0, lastWatched: null })
  );
}

export function saveProgress(userId: string, courseId: string | number, data: LessonProgress): void {
  localStorage.setItem(`ro_progress_${userId}_${courseId}`, JSON.stringify(data));
}

// ─── QUIZ RESULTS ─────────────────────────────────────────────────────────────
export function getQuizResult(userId: string, courseId: string | number): QuizResult | null {
  return JSON.parse(localStorage.getItem(`ro_quiz_${userId}_${courseId}`) || 'null');
}

export function saveQuizResult(userId: string, courseId: string | number, result: QuizResult): void {
  localStorage.setItem(`ro_quiz_${userId}_${courseId}`, JSON.stringify(result));
}

// ─── USER PREFS ───────────────────────────────────────────────────────────────
export function getUserPrefs(userId: string): UserPrefs {
  return JSON.parse(
    localStorage.getItem(`ro_prefs_${userId}`) ||
      JSON.stringify({ darkMode: true })
  );
}

export function saveUserPrefs(userId: string, prefs: Partial<UserPrefs>): void {
  const existing = getUserPrefs(userId);
  localStorage.setItem(`ro_prefs_${userId}`, JSON.stringify({ ...existing, ...prefs }));
}

// ─── PROFILE UPDATES ──────────────────────────────────────────────────────────
export function updateUserProfile(userId: string, { name, email }: { name?: string; email?: string }): User | null {
  return updateUser(userId, {
    ...(name ? { name } : {}),
    ...(email ? { email: email.toLowerCase() } : {}),
  });
}

export function updateUserPassword(userId: string, newHash: string): User | null {
  return updateUser(userId, { passwordHash: newHash });
}

// ─── PHOTO ────────────────────────────────────────────────────────────────────
export function saveUserPhoto(userId: string, base64String: string): void {
  localStorage.setItem(`ro_photo_${userId}`, base64String);
}

export function getUserPhoto(userId: string): string | null {
  return localStorage.getItem(`ro_photo_${userId}`) || null;
}

export function removeUserPhoto(userId: string): void {
  localStorage.removeItem(`ro_photo_${userId}`);
}

// ─── ASSIGNMENTS ──────────────────────────────────────────────────────────────
export function getAssignments(userId: string): AssignmentSubmission[] {
  return JSON.parse(localStorage.getItem(`ro_assignments_${userId}`) || '[]');
}

export function saveAssignment(userId: string, assignmentData: AssignmentSubmission): void {
  const existing = getAssignments(userId);
  localStorage.setItem(`ro_assignments_${userId}`, JSON.stringify([...existing, assignmentData]));
}

// ─── CONTENT PROGRESS (hierarchy player) ─────────────────────────────────────
export function getContentProgress(userId: string, courseId: string | number): ContentProgress {
  const key = `ro_cp_${userId}_${courseId}`;
  return JSON.parse(
    localStorage.getItem(key) ||
      JSON.stringify({ completedContent: [], percentComplete: 0, lastContentId: null, lastAccessedAt: null })
  );
}

export function saveContentProgress(userId: string, courseId: string | number, data: ContentProgress): void {
  localStorage.setItem(`ro_cp_${userId}_${courseId}`, JSON.stringify(data));
}

// ─── BOOKMARKS ────────────────────────────────────────────────────────────────
export function getBookmarks(userId: string): string[] {
  return JSON.parse(localStorage.getItem(`ro_bookmarks_${userId}`) || '[]');
}

export function toggleBookmark(userId: string, courseId: string | number): boolean {
  const bookmarks = getBookmarks(userId);
  const exists = bookmarks.includes(String(courseId));
  const next = exists ? bookmarks.filter((id: string) => id !== String(courseId)) : [...bookmarks, String(courseId)];
  localStorage.setItem(`ro_bookmarks_${userId}`, JSON.stringify(next));
  return !exists;
}

export function isBookmarked(userId: string, courseId: string | number): boolean {
  return getBookmarks(userId).includes(String(courseId));
}

// ─── SUPPORT MESSAGES ─────────────────────────────────────────────────────────
export function getSupportMessages(userId: string): SupportMessage[] {
  return JSON.parse(localStorage.getItem(`ro_support_${userId}`) || '[]');
}

export function saveSupportMessages(userId: string, messages: SupportMessage[]): void {
  localStorage.setItem(`ro_support_${userId}`, JSON.stringify(messages));
}

// ─── MODULE QUIZ RESULTS ──────────────────────────────────────────────────────
export function getQuizResults(userId: string, courseId: string | number, moduleId: string): QuizResult | null {
  try { return JSON.parse(localStorage.getItem(`quizResults_${userId}_${courseId}_${moduleId}`) || 'null'); } catch { return null; }
}

export function saveQuizResults(userId: string, courseId: string | number, moduleId: string, results: QuizResult): void {
  localStorage.setItem(`quizResults_${userId}_${courseId}_${moduleId}`, JSON.stringify(results));
}

export function moduleQuizSubmitted(userId: string, courseId: string | number, moduleId: string): boolean {
  const r = getQuizResults(userId, courseId, moduleId);
  return r?.submitted === true;
}

// ─── MODULE ASSIGNMENT DATA ───────────────────────────────────────────────────
export function getModuleAssignmentData(userId: string, courseId: string | number, moduleId: string): { submitted?: boolean } | null {
  try { return JSON.parse(localStorage.getItem(`assignment_${userId}_${courseId}_${moduleId}`) || 'null'); } catch { return null; }
}

export function saveModuleAssignmentData(userId: string, courseId: string | number, moduleId: string, data: Record<string, unknown>): void {
  localStorage.setItem(`assignment_${userId}_${courseId}_${moduleId}`, JSON.stringify(data));
}

export function moduleAssignmentSubmitted(userId: string, courseId: string | number, moduleId: string): boolean {
  const a = getModuleAssignmentData(userId, courseId, moduleId);
  return a?.submitted === true;
}

export function getModuleCompletionStatus(
  userId: string,
  courseId: string | number,
  moduleId: string,
  completedContentIds: string[],
  totalContentCount: number
): { contentComplete: boolean; quizSubmitted: boolean; assignmentSubmitted: boolean; fullyComplete: boolean } {
  const contentComplete = totalContentCount > 0 && completedContentIds.length >= totalContentCount;
  const quizSubmitted = moduleQuizSubmitted(userId, courseId, moduleId);
  const assignmentSubmitted = moduleAssignmentSubmitted(userId, courseId, moduleId);
  return {
    contentComplete,
    quizSubmitted,
    assignmentSubmitted,
    fullyComplete: contentComplete && quizSubmitted && assignmentSubmitted,
  };
}
