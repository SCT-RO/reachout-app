import { useState, useEffect, useCallback } from 'react';
import type { CourseModule } from '../types';
import { buildCourseStructure } from '../utils/courseBuilder';
import { findCoursePackage } from '../data/courses';

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function cacheKey(courseName: string): string {
  return `ro_structure_v2_${courseName}`;
}

function getCached(courseName: string): CourseModule[] | null {
  try {
    const raw = sessionStorage.getItem(cacheKey(courseName));
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) {
      sessionStorage.removeItem(cacheKey(courseName));
      return null;
    }
    // Bust cache if it pre-dates quiz/assignment fields
    const hasQuizzes = data?.[0]?.quiz !== undefined
      || data?.[0]?.submodules?.[0]?.quiz !== undefined;
    if (!hasQuizzes) {
      sessionStorage.removeItem(cacheKey(courseName));
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCache(courseName: string, data: CourseModule[]): void {
  try {
    sessionStorage.setItem(cacheKey(courseName), JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // sessionStorage full — skip caching
  }
}

function getFallback(courseName: string): CourseModule[] {
  const pkg = findCoursePackage(courseName);
  return pkg?.modules || [];
}

export function useCourseStructure(courseName: string | undefined) {
  const [modules, setModules] = useState<CourseModule[]>(() => {
    if (!courseName) return [];
    return getCached(courseName) || [];
  });
  const [isLoading, setIsLoading] = useState(() => {
    if (!courseName) return false;
    return !getCached(courseName);
  });
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (bust = false) => {
    if (!courseName) return;
    if (bust) sessionStorage.removeItem(cacheKey(courseName));

    const cached = bust ? null : getCached(courseName);
    if (cached) {
      setModules(cached);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await buildCourseStructure(courseName);
      setCache(courseName, result);
      setModules(result);
    } catch (err) {
      console.warn('[ReachOut] courseStructure fetch failed, using static data:', (err as Error).message);
      setError((err as Error).message);
      setModules(getFallback(courseName));
    } finally {
      setIsLoading(false);
    }
  }, [courseName]);

  useEffect(() => {
    if (courseName && !getCached(courseName)) load();
  }, [courseName, load]);

  const refetch = useCallback(() => load(true), [load]);

  return { modules, isLoading, error, refetch };
}
