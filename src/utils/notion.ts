import { courses as staticCourses } from '../data/courses';

/**
 * Fetch courses from the Vercel API route (which calls Notion server-side).
 * Falls back to static courses.js data on any failure.
 */
export async function fetchCourses() {
  try {
    const res = await fetch('/api/courses');
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.courses) || data.courses.length === 0) {
      throw new Error('Empty courses list from Airtable');
    }
    return data.courses;
  } catch (err) {
    console.warn('[ReachOut] Airtable fetch failed, using static data:', (err as Error).message);
    return staticCourses;
  }
}
