import { useState, useCallback } from 'react';
import { getProgress, saveProgress } from '../utils/storage';

export function useProgress(userId, courseId) {
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

  return { progress, completeLesson, getProgressForCourse };
}
