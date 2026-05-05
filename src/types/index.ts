// ─── User ─────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  photo?: string;
}

// ─── Session ──────────────────────────────────────────────────────────────────
export interface Session {
  userId: string;
  email: string;
  name: string;
}

// ─── Toast ────────────────────────────────────────────────────────────────────
export interface Toast {
  message: string;
  type: string;
}

// ─── Content Item ─────────────────────────────────────────────────────────────
export interface ContentItem {
  id: string;
  title: string;
  type: 'video' | 'audio' | 'pdf' | 'image';
  duration?: string | null;
  size?: string | null;
  thumbnail?: string | null;
  url?: string;
  isPreview?: boolean;
  description?: string | null;
  order?: number;
  moduleTitle?: string;
  submoduleTitle?: string;
}

// ─── Quiz Question ────────────────────────────────────────────────────────────
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

// ─── Quiz ─────────────────────────────────────────────────────────────────────
export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
}

// ─── Assignment ───────────────────────────────────────────────────────────────
export interface Assignment {
  id: string;
  title: string;
  briefDescription: string;
  objectives: string[];
  deliverables: string;
  acceptedFormats: string[];
  estimatedTime: string;
}

// ─── Submodule ────────────────────────────────────────────────────────────────
export interface Submodule {
  id: string;
  title: string;
  description?: string;
  order: number;
  moduleTitle?: string;
  content: ContentItem[];
  quiz?: Quiz | null;
  assignment?: Assignment | null;
}

// ─── Module ───────────────────────────────────────────────────────────────────
export interface CourseModule {
  id: string;
  title: string;
  description?: string;
  order: number;
  type: 'content' | 'submodules';
  duration?: string;
  courseName?: string;
  content?: ContentItem[];
  submodules?: Submodule[];
  quiz?: Quiz | null;
  assignment?: Assignment | null;
}

// ─── Course Package (static hierarchy) ───────────────────────────────────────
export interface CoursePackage {
  id: string;
  matchKeywords: string[];
  title: string;
  thumbnail: string;
  instructor: string;
  instructorImg: string;
  price: number;
  originalPrice?: number | null;
  rating: number;
  enrolled: number;
  category: string;
  description: string;
  featured: boolean;
  totalDuration?: string;
  totalLessons?: number;
  modules: CourseModule[];
}

// ─── Curriculum Item (legacy) ─────────────────────────────────────────────────
export interface CurriculumItem {
  id: string;
  title: string;
  duration: string;
  type: string;
  readTime?: string;
  pages?: number;
}

// ─── Course (Airtable / API) ──────────────────────────────────────────────────
export interface Course {
  id: number | string;
  title: string;
  category: string;
  instructor: string;
  instructorImg: string;
  price: number;
  originalPrice?: number | null;
  ccavenuePrice?: number | null;
  inAppPrice?: number | null;
  rating: number;
  enrolled: number;
  duration: string;
  lessons: number;
  image: string;
  featured: boolean;
  description: string;
  curriculum?: CurriculumItem[];
}

// ─── Progress ─────────────────────────────────────────────────────────────────
export interface LessonProgress {
  lessonsCompleted: string[];
  percentComplete: number;
  lastWatched: string | null;
}

export interface ContentProgress {
  completedContent: string[];
  percentComplete: number;
  lastContentId: string | null;
  lastAccessedAt: string | null;
}

// ─── Quiz Result ──────────────────────────────────────────────────────────────
export interface QuizAnswer {
  questionId: string;
  selected: number;
  correct: boolean;
}

export interface QuizAttempt {
  score: number;
  total: number;
  passed: boolean;
  answers: QuizAnswer[];
  completedAt: number;
}

export interface QuizResult {
  attempts: QuizAttempt[];
  bestScore: number;
  submitted: boolean;
}

// ─── Assignment Submission ────────────────────────────────────────────────────
export interface AssignmentSubmission {
  id: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  notes: string;
  submittedAt: number;
  attemptNumber: number;
}

export interface AssignmentResult {
  submissions: AssignmentSubmission[];
  submitted: boolean;
  latestSubmission?: AssignmentSubmission;
}

// ─── Module Completion Status ─────────────────────────────────────────────────
export interface ModuleCompletionStatus {
  contentComplete: boolean;
  quizSubmitted: boolean;
  assignmentSubmitted: boolean;
  fullyComplete: boolean;
}

// ─── Support Message ──────────────────────────────────────────────────────────
export interface SupportMessage {
  id: string;
  text: string;
  from: 'user' | 'admin';
  timestamp: number;
}

// ─── User Prefs ───────────────────────────────────────────────────────────────
export interface UserPrefs {
  darkMode: boolean;
}

// ─── Airtable ─────────────────────────────────────────────────────────────────
export interface AirtableRecord {
  id: string;
  fields: Record<string, unknown>;
}

export interface AirtableResponse {
  records: AirtableRecord[];
  offset?: string;
}
