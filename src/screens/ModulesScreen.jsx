import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useProgress } from '../hooks/useProgress';
import { useCourses } from '../hooks/useCourses';
import { getPurchased, isBookmarked, toggleBookmark } from '../utils/storage';
import { findCoursePackage, getAllContent, getTotalContentCount } from '../data/courses';
import {
  HiArrowLeft, HiBookmark, HiChevronRight, HiLockClosed, HiCheckCircle,
} from '../components/Icons';

const CONTENT_COLORS = { video: '#3B82F6', audio: '#8B5CF6', pdf: '#EF4444', image: '#22C55E' };

function TypeDot({ type }) {
  return <span style={{ width: 7, height: 7, borderRadius: '50%', background: CONTENT_COLORS[type] || '#aaa', display: 'inline-block', flexShrink: 0 }} />;
}

function getModuleContentList(mod) {
  if (mod.type === 'content') return mod.content || [];
  return (mod.submodules || []).flatMap(s => s.content || []);
}

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

export default function ModulesScreen() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { courses, isLoading } = useCourses();
  const { isModuleCompleted, isModuleUnlocked, getCourseProgress } = useProgress(currentUser?.userId, courseId);

  const course = courses.find(c => String(c.id) === courseId);
  const pkg = course ? findCoursePackage(course.title) : null;

  const isPurchased = useMemo(() => {
    if (!currentUser) return false;
    const purchased = getPurchased(currentUser.userId);
    return purchased.some(p => String(p.id) === courseId) || (course?.price === 0);
  }, [currentUser, courseId, course]);

  const [bookmarked, setBookmarked] = useState(() =>
    currentUser ? isBookmarked(currentUser.userId, courseId) : false
  );

  const progressData = getCourseProgress();
  const totalContent = pkg ? getTotalContentCount(pkg) : 0;
  const completedCount = progressData.completedContent?.length || 0;
  const pct = totalContent > 0 ? Math.round((completedCount / totalContent) * 100) : 0;
  const hasPreview = pkg?.modules?.some(m =>
    getModuleContentList(m).some(c => c.isPreview)
  );

  const handleBookmark = () => {
    if (!currentUser) return;
    const next = toggleBookmark(currentUser.userId, courseId);
    setBookmarked(next);
  };

  const handleContinue = () => {
    if (!pkg) return;
    const lastId = progressData.lastContentId;
    if (lastId) {
      navigate(`/course/${courseId}/content/${lastId}`);
      return;
    }
    const first = getAllContent(pkg)[0];
    if (first) navigate(`/course/${courseId}/content/${first.id}`);
  };

  const handleModuleTap = (mod) => {
    if (!isModuleUnlocked(mod.id, pkg)) return;
    navigate(`/course/${courseId}/module/${mod.id}`);
  };

  if (isLoading && !course) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  if (!course || !pkg) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', gap: 12 }}>
        <div style={{ fontSize: 40 }}>😕</div>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Course not found</div>
        <button className="btn-outline" style={{ width: 160 }} onClick={() => navigate(-1)}>← Back</button>
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
          <img src={course.image || pkg.thumbnail} alt="" role="presentation" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(24,24,27,0.95) 0%, rgba(24,24,27,0.3) 60%, transparent 100%)' }} />
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
        </div>

        {/* Free preview note */}
        {!isPurchased && hasPreview && (
          <div style={{ margin: '12px 16px 0', padding: '10px 14px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 12, fontSize: 12, color: 'var(--warning)' }}>
            👁 Some content is available as free preview
          </div>
        )}

        {/* Progress Overview Card */}
        <div style={{ margin: '14px 16px 0', padding: '16px', background: 'var(--bg-surface)', borderRadius: 16, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: pct === 100 ? 'var(--success)' : 'var(--primary-text)', lineHeight: 1 }}>{pct}%</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                {completedCount} of {totalContent} lessons completed
              </div>
            </div>
            {pct > 0 && (
              <motion.button
                whileTap={{ scale: 0.96 }}
                className="btn-primary"
                style={{ fontSize: 13, padding: '8px 16px', minHeight: 'unset' }}
                onClick={handleContinue}
              >
                Continue →
              </motion.button>
            )}
          </div>
          <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ height: '100%', background: pct === 100 ? 'var(--success)' : 'var(--primary)', borderRadius: 3 }}
            />
          </div>
        </div>

        {/* Module List */}
        <div style={{ padding: '14px 16px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{pkg.modules.length} Modules</div>
          {pkg.modules.map((mod, idx) => {
            const allContent = getModuleContentList(mod);
            const unlocked = isModuleUnlocked(mod.id, pkg);
            const completed = isModuleCompleted(mod.id, pkg);
            const completedInMod = progressData.completedContent?.filter(id =>
              allContent.some(c => c.id === id)
            ).length || 0;
            const dur = sumDurations(allContent);
            const label = mod.type === 'content'
              ? `${allContent.length} Lesson${allContent.length !== 1 ? 's' : ''}`
              : `${(mod.submodules || []).length} Submodule${(mod.submodules || []).length !== 1 ? 's' : ''}`;

            return (
              <motion.button
                key={mod.id}
                whileTap={unlocked ? { scale: 0.985 } : {}}
                onClick={() => handleModuleTap(mod)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '14px 14px',
                  background: 'var(--bg-surface)', borderRadius: 14,
                  border: `1px solid ${completed ? 'rgba(34,197,94,0.25)' : 'var(--border)'}`,
                  opacity: !unlocked && !isPurchased && !allContent.some(c => c.isPreview) ? 0.55 : 1,
                  cursor: unlocked ? 'pointer' : 'default',
                  textAlign: 'left', width: '100%', color: 'var(--text-primary)',
                }}
              >
                {/* Number circle */}
                <div style={{
                  width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 800,
                  background: completed ? 'var(--success)' : completedInMod > 0 ? 'var(--primary)' : 'var(--border)',
                  color: completed || completedInMod > 0 ? '#fff' : 'var(--text-muted)',
                  border: !completed && completedInMod === 0 ? '2px solid var(--border)' : 'none',
                }}>
                  {completed ? '✓' : idx + 1}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{mod.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                    <span>{label}</span>
                    {dur && <><span>·</span><span>{dur}</span></>}
                  </div>
                </div>

                {/* Status pill */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  {completed ? (
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--success-text)', background: 'rgba(34,197,94,0.1)', padding: '3px 8px', borderRadius: 6 }}>Completed</span>
                  ) : !unlocked ? (
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', background: 'var(--border)', padding: '3px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <HiLockClosed size={11} /> Locked
                    </span>
                  ) : completedInMod > 0 ? (
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--warning)', background: 'rgba(245,158,11,0.1)', padding: '3px 8px', borderRadius: 6 }}>
                      {completedInMod}/{allContent.length}
                    </span>
                  ) : null}
                  {unlocked && <HiChevronRight />}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
