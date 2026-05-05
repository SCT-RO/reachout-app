import { useState, useCallback } from 'react';
import type { CourseModule, Submodule } from '../types';
import { getProgress, saveProgress, getContentProgress, saveContentProgress, moduleQuizSubmitted, moduleAssignmentSubmitted } from '../utils/storage';

// ─── Standalone helpers (importable without the hook) ─────────────────────────

export function getAllContentIds(mod: CourseModule | null | undefined): string[] {
  if (!mod) return [];
  if (mod.type === 'content') return (mod.content || []).map(c => c.id);
  return (mod.submodules || []).flatMap((s: Submodule) => (s.content || []).map(c => c.id));
}

function checkQuizDone(userId: string, courseId: string, mod: CourseModule): boolean {
  if (mod.type !== 'submodules') {
    return !mod.quiz || moduleQuizSubmitted(userId, courseId, mod.id);
  }
  return (mod.submodules || []).every((sub: Submodule) =>
    !sub.quiz || moduleQuizSubmitted(userId, courseId, sub.id)
  );
}

function checkAssignmentDone(userId: string, courseId: string, mod: CourseModule): boolean {
  if (mod.type !== 'submodules') {
    return !mod.assignment || moduleAssignmentSubmitted(userId, courseId, mod.id);
  }
  return (mod.submodules || []).every((sub: Submodule) =>
    !sub.assignment || moduleAssignmentSubmitted(userId, courseId, sub.id)
  );
}

export function isModuleFullyComplete(userId: string, courseId: string, mod: CourseModule): boolean {
  if (!userId || !courseId || !mod) return false;
  const ids = getAllContentIds(mod);
  if (ids.length === 0) return false;
  const { completedContent } = getContentProgress(userId, courseId);
  if (!ids.every(id => completedContent.includes(id))) return false;
  return checkQuizDone(userId, courseId, mod) && checkAssignmentDone(userId, courseId, mod);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useProgress(userId: string | undefined, courseId: string | undefined) {
  // ── Legacy lesson progress (LessonPlayerScreen) ──────────────────────────
  const [progress, setProgress] = useState(() =>
    userId && courseId ? getProgress(userId, courseId) : { lessonsCompleted: [], percentComplete: 0, lastWatched: null }
  );

  const completeLesson = useCallback((lessonId: string, totalLessons: number) => {
    if (!userId || !courseId) return;
    setProgress(prev => {
      const completed = prev.lessonsCompleted.includes(lessonId)
        ? prev.lessonsCompleted
        : [...prev.lessonsCompleted, lessonId];
      const percent = Math.round((completed.length / totalLessons) * 100);
      const next = { lessonsCompleted: completed, percentComplete: percent, lastWatched: lessonId };
      saveProgress(userId, courseId, next);
      return next;
    });
  }, [userId, courseId]);

  const getProgressForCourse = useCallback((cId: string) => {
    if (!userId) return { lessonsCompleted: [], percentComplete: 0, lastWatched: null };
    return getProgress(userId, cId);
  }, [userId]);

  // ── Content-hierarchy progress ─────────────────────────────────────────────
  const completeContent = useCallback((contentId: string, totalContentCount: number) => {
    if (!userId || !courseId) return;
    const prev = getContentProgress(userId, courseId);
    if (prev.completedContent.includes(contentId)) return;
    const completed = [...prev.completedContent, contentId];
    const total = totalContentCount || Math.max(completed.length, 1);
    const next = {
      completedContent: completed,
      percentComplete: Math.round((completed.length / total) * 100),
      lastContentId: contentId,
      lastAccessedAt: new Date().toISOString(),
    };
    saveContentProgress(userId, courseId, next);
  }, [userId, courseId]);

  const isContentCompleted = useCallback((contentId: string) => {
    if (!userId || !courseId) return false;
    return getContentProgress(userId, courseId).completedContent.includes(contentId);
  }, [userId, courseId]);

  const getCourseProgress = useCallback(() => {
    if (!userId || !courseId) return { completedContent: [], percentComplete: 0, lastContentId: null };
    return getContentProgress(userId, courseId);
  }, [userId, courseId]);

  // ── Module status helpers (accept mod object + allModules array) ───────────
  const isModuleCompleted = useCallback((mod: CourseModule) => {
    if (!userId || !courseId) return false;
    return isModuleFullyComplete(userId, courseId, mod);
  }, [userId, courseId]);

  const isModuleUnlocked = useCallback((mod: CourseModule, allModules: CourseModule[]) => {
    if (!mod || !userId || !courseId) return false;
    if (mod.order === 1) return true;
    const prevMod = (allModules || []).find((m: CourseModule) => m.order === mod.order - 1);
    if (!prevMod) return true;
    return isModuleFullyComplete(userId, courseId, prevMod);
  }, [userId, courseId]);

  const getModuleStatus = useCallback((mod: CourseModule, allModules: CourseModule[]) => {
    if (!mod || !userId || !courseId) return 'locked';
    const prevMod = (allModules || []).find((m: CourseModule) => m.order === mod.order - 1);
    const unlocked = mod.order === 1 || !prevMod || isModuleFullyComplete(userId, courseId, prevMod);
    if (!unlocked) return 'locked';
    if (isModuleFullyComplete(userId, courseId, mod)) return 'completed';
    const ids = getAllContentIds(mod);
    const { completedContent } = getContentProgress(userId, courseId);
    const hasStarted = ids.some(id => completedContent.includes(id));
    return hasStarted ? 'in_progress' : 'unlocked';
  }, [userId, courseId]);

  return {
    progress, completeLesson, getProgressForCourse,
    completeContent, isContentCompleted, getCourseProgress,
    isModuleCompleted, isModuleUnlocked, getModuleStatus,
  };
}
