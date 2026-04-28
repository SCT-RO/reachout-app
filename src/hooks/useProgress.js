import { useState, useCallback } from 'react';
import { getProgress, saveProgress, getContentProgress, saveContentProgress } from '../utils/storage';

// ─── Helpers shared by module/unlock logic ─────────────────────────────────
function getModuleAllContent(mod) {
  if (mod.type === 'content') return mod.content || [];
  return (mod.submodules || []).flatMap(s => s.content || []);
}

export function useProgress(userId, courseId) {
  // ── Legacy lesson progress (LessonPlayerScreen) ──────────────────────────
  const [progress, setProgress] = useState(() =>
    userId && courseId ? getProgress(userId, courseId) : { lessonsCompleted: [], percentComplete: 0, lastWatched: null }
  );

  const completeLesson = useCallback((lessonId, totalLessons) => {
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

  const getProgressForCourse = useCallback((cId) => {
    if (!userId) return { lessonsCompleted: [], percentComplete: 0, lastWatched: null };
    return getProgress(userId, cId);
  }, [userId]);

  // ── Content-hierarchy progress ─────────────────────────────────────────
  const completeContent = useCallback((contentId, totalContentCount) => {
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

  const isContentCompleted = useCallback((contentId) => {
    if (!userId || !courseId) return false;
    return getContentProgress(userId, courseId).completedContent.includes(contentId);
  }, [userId, courseId]);

  const getCourseProgress = useCallback(() => {
    if (!userId || !courseId) return { completedContent: [], percentComplete: 0, lastContentId: null };
    return getContentProgress(userId, courseId);
  }, [userId, courseId]);

  const isModuleCompleted = useCallback((moduleId, pkg) => {
    if (!userId || !courseId || !pkg) return false;
    const mod = pkg.modules.find(m => m.id === moduleId);
    if (!mod) return false;
    const allContent = getModuleAllContent(mod);
    if (allContent.length === 0) return false;
    const { completedContent } = getContentProgress(userId, courseId);
    return allContent.every(c => completedContent.includes(c.id));
  }, [userId, courseId]);

  const isModuleUnlocked = useCallback((moduleId, pkg) => {
    if (!userId || !courseId || !pkg) return false;
    const mod = pkg.modules.find(m => m.id === moduleId);
    if (!mod) return false;
    if (mod.order === 1) return true;
    const prevMod = pkg.modules.find(m => m.order === mod.order - 1);
    if (!prevMod) return true;
    const allContent = getModuleAllContent(prevMod);
    if (allContent.length === 0) return true;
    const { completedContent } = getContentProgress(userId, courseId);
    return allContent.every(c => completedContent.includes(c.id));
  }, [userId, courseId]);

  return {
    progress, completeLesson, getProgressForCourse,
    completeContent, isContentCompleted, getCourseProgress,
    isModuleCompleted, isModuleUnlocked,
  };
}
