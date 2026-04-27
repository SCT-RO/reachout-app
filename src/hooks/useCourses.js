import { useState, useEffect, useCallback } from 'react';
import { fetchCourses } from '../utils/notion';

const CACHE_KEY = 'ro_courses_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCache(data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // sessionStorage full — skip caching
  }
}

export function useCourses() {
  const [courses, setCourses] = useState(() => getCached() || []);
  const [isLoading, setIsLoading] = useState(() => !getCached());
  const [error, setError] = useState(null);

  const load = useCallback(async (bustCache = false) => {
    if (bustCache) sessionStorage.removeItem(CACHE_KEY);

    const cached = bustCache ? null : getCached();
    if (cached) {
      setCourses(cached);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchCourses();
      setCache(data);
      setCourses(data);
    } catch (err) {
      setError(err.message || 'Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!getCached()) load();
  }, [load]);

  const refetch = useCallback(() => load(true), [load]);

  return { courses, isLoading, error, refetch };
}
