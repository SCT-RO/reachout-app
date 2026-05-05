import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useProgress, getAllContentIds } from '../hooks/useProgress';
import { useCourses } from '../hooks/useCourses';
import { useCourseStructure } from '../hooks/useCourseStructure';
import { getPurchased, isBookmarked, toggleBookmark, moduleQuizSubmitted, moduleAssignmentSubmitted } from '../utils/storage';
import { findCoursePackage } from '../data/courses';
import {
  HiArrowLeft, HiBookmark, HiChevronRight, HiLockClosed, HiCheckCircle, HiXMark,
} from '../components/Icons';

function sumDurations(contentList) {
  let total = 0;
  contentList.forEach(c => {
    if (c.duration) {
      const [m, s] = c.duration.split(':').map(Number);
      total += (m || 0) * 60 + (s || 0);
    }
  });
  if (total === 0) return null;
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function getModuleContentList(mod) {
  if (mod.type === 'content') return mod.content || [];
  return (mod.submodules || []).flatMap(s => s.content || []);
}

function ProgressDots({ mod, userId, courseId, completedContent }) {
  const allIds = getAllContentIds(mod);
  const contentDone = allIds.length > 0 && allIds.every(id => completedContent.includes(id));
  const hasQuiz = !!mod.quiz;
  const hasAssignment = !!mod.assignment;
  const quizDone = hasQuiz && moduleQuizSubmitted(userId, courseId, mod.id);
  const assignDone = hasAssignment && moduleAssignmentSubmitted(userId, courseId, mod.id);

  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center', marginTop: 5 }}>
      <div title="Content" style={{ width: 8, height: 8, borderRadius: '50%', background: contentDone ? '#22C55E' : 'var(--border)' }} />
      {hasQuiz && <div title="Quiz" style={{ width: 8, height: 8, borderRadius: '50%', background: quizDone ? '#22C55E' : 'var(--border)' }} />}
      {hasAssignment && <div title="Assignment" style={{ width: 8, height: 8, borderRadius: '50%', background: assignDone ? '#22C55E' : 'var(--border)' }} />}
    </div>
  );
}

export default function ModulesScreen() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { courses, isLoading: coursesLoading } = useCourses();
  const { getModuleStatus, getCourseProgress } = useProgress(currentUser?.userId, courseId);

  const course = courses.find(c => String(c.id) === courseId);
  const pkg = course ? findCoursePackage(course.title) : null;
  const { modules, isLoading: structLoading } = useCourseStructure(course?.title);
  const isLoading = coursesLoading || (structLoading && modules.length === 0);

  const isPurchased = useMemo(() => {
    if (!currentUser) return false;
    const purchased = getPurchased(currentUser.userId);
    return purchased.some(p => String(p.id) === courseId) || (course?.price === 0);
  }, [currentUser, courseId, course]);

  const [bookmarked, setBookmarked] = useState(() =>
    currentUser ? isBookmarked(currentUser.userId, courseId) : false
  );
  const [lockedSheet, setLockedSheet] = useState(null);

  const progressData = getCourseProgress();

  const moduleStatuses = useMemo(() => {
    if (!currentUser || modules.length === 0) return {};
    return Object.fromEntries(modules.map(m => [m.id, getModuleStatus(m, modules)]));
  }, [modules, currentUser, getModuleStatus]);

  const completedModulesCount = useMemo(() =>
    modules.filter(m => moduleStatuses[m.id] === 'completed').length,
  [modules, moduleStatuses]);

  const firstActionableMod = useMemo(() =>
    modules.find(m => ['unlocked', 'in_progress'].includes(moduleStatuses[m.id])),
  [modules, moduleStatuses]);

  const handleBookmark = () => {
    if (!currentUser) return;
    const next = toggleBookmark(currentUser.userId, courseId);
    setBookmarked(next);
  };

  const handleModuleTap = (mod, status) => {
    if (status === 'locked') {
      const prevMod = modules.find(m => m.order === mod.order - 1);
      setLockedSheet({ lockedMod: mod, prevMod });
      return;
    }
    navigate(`/course/${courseId}/module/${mod.id}`);
  };

  if (isLoading && !course) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', gap: 12 }}>
        <div style={{ fontSize: 40 }}>😕</div>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Course not found</div>
        <button className="btn-outline" style={{ width: 160 }} onClick={() => navigate('/home')}>← Back</button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.22 }}
      style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)', position: 'relative', overflow: 'hidden' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 16px 12px', flexShrink: 0, zIndex: 10 }}>
        <button onClick={() => navigate('/learn')} aria-label="Back" style={{ color: 'var(--text-primary)', padding: 4 }}>
          <HiArrowLeft size={22} />
        </button>
        <div style={{ flex: 1, fontSize: 15, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {course.title}
        </div>
        <button onClick={handleBookmark} aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark course'} style={{ color: bookmarked ? 'var(--primary-text)' : 'var(--text-muted)', padding: 4 }}>
          <HiBookmark size={22} filled={bookmarked} />
        </button>
      </div>

      <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingBottom: 24 }}>
        {/* Course Banner */}
        <div style={{ position: 'relative', height: 160, overflow: 'hidden', flexShrink: 0 }}>
          <img src={course.image || pkg?.thumbnail} alt="" role="presentation" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(24,24,27,0.95) 0%, rgba(24,24,27,0.3) 60%, transparent 100%)' }} />
          {pkg && (
            <div style={{ position: 'absolute', bottom: 14, left: 16, right: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 4, lineHeight: 1.2, textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}>{course.title}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                <img src={pkg.instructorImg} alt="" style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid rgba(255,255,255,0.4)' }} />
                <span style={{ color: 'rgba(255,255,255,0.8)' }}>{pkg.instructor}</span>
                <span style={{ background: 'rgba(245,158,11,0.2)', color: '#fbbf24', padding: '2px 7px', borderRadius: 6, fontWeight: 700, fontSize: 11 }}>
                  ★ {pkg.rating}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Progress Header Card */}
        {isPurchased && modules.length > 0 && (
          <div style={{ margin: '14px 16px 0', padding: '16px', background: 'var(--bg-surface)', borderRadius: 16, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Your Progress</div>
            <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${modules.length > 0 ? (completedModulesCount / modules.length) * 100 : 0}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{ height: '100%', background: completedModulesCount === modules.length && modules.length > 0 ? 'var(--success)' : 'var(--primary)', borderRadius: 3 }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {completedModulesCount === modules.length && modules.length > 0
                  ? '🎉 Course Complete!'
                  : `${completedModulesCount} of ${modules.length} modules completed`}
              </div>
              {firstActionableMod && (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  className="btn-primary"
                  style={{ fontSize: 12, padding: '6px 14px', minHeight: 'unset' }}
                  onClick={() => navigate(`/course/${courseId}/module/${firstActionableMod.id}`)}
                >
                  {completedModulesCount > 0 ? 'Continue →' : 'Start Learning →'}
                </motion.button>
              )}
            </div>
          </div>
        )}

        {/* Module List */}
        <div style={{ padding: '14px 16px 0' }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>{modules.length} Modules</div>
          {modules.map((mod, idx) => {
            const status = moduleStatuses[mod.id] || (isPurchased ? 'unlocked' : 'locked');
            const locked = status === 'locked';
            const completed = status === 'completed';
            const inProgress = status === 'in_progress';
            const allIds = getAllContentIds(mod);
            const label = mod.type === 'content'
              ? `${allIds.length} Lesson${allIds.length !== 1 ? 's' : ''}`
              : `${(mod.submodules || []).length} Submodule${(mod.submodules || []).length !== 1 ? 's' : ''}`;
            const dur = sumDurations(getModuleContentList(mod));

            const circleBackground = completed
              ? 'var(--success)'
              : inProgress
              ? '#F59E0B'
              : locked
              ? 'var(--border)'
              : 'var(--bg-dark)';
            const circleColor = completed || inProgress ? '#fff' : locked ? 'var(--text-muted)' : 'var(--text-primary)';

            return (
              <motion.button
                key={mod.id}
                whileTap={!locked ? { scale: 0.985 } : {}}
                onClick={() => handleModuleTap(mod, status)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '16px',
                  background: 'var(--bg-surface)', borderRadius: 14,
                  border: `1px solid ${completed ? 'rgba(34,197,94,0.25)' : 'var(--border)'}`,
                  opacity: locked ? 0.55 : 1,
                  cursor: !locked ? 'pointer' : 'default',
                  textAlign: 'left', width: '100%', color: 'var(--text-primary)',
                  marginBottom: 10,
                }}
              >
                {/* Status circle */}
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: circleBackground,
                  color: circleColor,
                  fontSize: 14, fontWeight: 800,
                  border: !completed && !inProgress && !locked ? '2px solid var(--border)' : 'none',
                }}>
                  {completed
                    ? <HiCheckCircle size={22} />
                    : locked
                    ? <HiLockClosed size={18} />
                    : idx + 1}
                </div>

                {/* Module info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mod.title}</div>
                    {completed && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#22C55E', background: 'rgba(34,197,94,0.1)', padding: '2px 7px', borderRadius: 5, flexShrink: 0 }}>Completed</span>
                    )}
                    {inProgress && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#F59E0B', background: 'rgba(245,158,11,0.1)', padding: '2px 7px', borderRadius: 5, flexShrink: 0 }}>In Progress</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{label}</span>
                    {dur && <><span>·</span><span>{dur}</span></>}
                  </div>
                  {(inProgress || completed) && currentUser && (
                    <ProgressDots
                      mod={mod}
                      userId={currentUser.userId}
                      courseId={courseId}
                      completedContent={progressData.completedContent || []}
                    />
                  )}
                </div>

                {/* Right icon */}
                {!locked && (
                  <HiChevronRight size={20} style={{ color: completed ? 'var(--text-muted)' : 'var(--primary-text)', flexShrink: 0 }} />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Locked Module Bottom Sheet */}
      <AnimatePresence>
        {lockedSheet && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 400, display: 'flex', alignItems: 'flex-end' }}
            onClick={() => setLockedSheet(null)}
          >
            <motion.div
              initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'var(--bg-surface)', width: '100%', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: '28px 24px 40px', position: 'relative' }}
            >
              <button
                onClick={() => setLockedSheet(null)}
                aria-label="Close"
                style={{ position: 'absolute', top: 16, right: 16, color: 'var(--text-muted)', padding: 4 }}
              >
                <HiXMark size={20} />
              </button>
              <div aria-hidden="true" style={{ width: 36, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 24px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(79,70,229,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-text)' }}>
                  <HiLockClosed size={24} />
                </div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>Module Locked</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.55, maxWidth: 280 }}>
                  Complete <strong style={{ color: 'var(--text-primary)' }}>{lockedSheet.prevMod?.title}</strong> to unlock this module.
                  You need to finish all lessons
                  {lockedSheet.prevMod?.quiz ? ', the quiz' : ''}
                  {lockedSheet.prevMod?.assignment ? ' and the assignment' : ''}.
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 }}>
                {lockedSheet.prevMod && (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    className="btn-primary"
                    onClick={() => { setLockedSheet(null); navigate(`/course/${courseId}/module/${lockedSheet.prevMod.id}`); }}
                  >
                    Go to {lockedSheet.prevMod.title}
                  </motion.button>
                )}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  className="btn-outline"
                  onClick={() => setLockedSheet(null)}
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
