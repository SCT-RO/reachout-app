import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { getPurchased, getContentProgress, removePurchased } from '../utils/storage';
import { useCourses } from '../hooks/useCourses';
import { findCoursePackage, getTotalContentCount } from '../data/courses';
import BottomNav from '../components/BottomNav';
import Chatbot from '../components/Chatbot';
import { HiBookOpen, HiXMark } from '../components/Icons';

export default function MyLearningScreen() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { courses } = useCourses();
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [confirmRemove, setConfirmRemove] = useState(null);

  useEffect(() => {
    if (!currentUser || courses.length === 0) return;
    const purchased = getPurchased(currentUser.userId);
    const enriched = purchased
      .map(p => {
        const full = courses.find(c => String(c.id) === String(p.id)) || p;
        const pkg = findCoursePackage(full.title || p.title || '');
        let percentComplete = 0;
        if (pkg) {
          const cp = getContentProgress(currentUser.userId, String(full.id));
          const total = getTotalContentCount(pkg);
          percentComplete = total > 0 ? Math.round((cp.completedContent.length / total) * 100) : 0;
        }
        return { ...full, percentComplete };
      })
      .filter(Boolean);
    setPurchasedCourses(enriched);
  }, [currentUser, courses]);

  const handleRemove = (courseId) => {
    removePurchased(currentUser.userId, courseId);
    setPurchasedCourses(prev => prev.filter(c => String(c.id) !== String(courseId)));
    setConfirmRemove(null);
  };

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)', position: 'relative' }}>
      <div style={{ padding: '24px 20px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em' }}>My Learning</h1>
        {purchasedCourses.length > 0 && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{purchasedCourses.length} course{purchasedCourses.length !== 1 ? 's' : ''} enrolled</div>
        )}
      </div>

      <div className="hide-scrollbar" style={{ flex: 1, padding: '16px 20px', overflowY: 'auto', paddingBottom: 96 }}>
        {purchasedCourses.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70%', gap: 12 }}>
            <div style={{ color: 'var(--text-muted)', opacity: 0.35 }}><HiBookOpen size={56} /></div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-muted)' }}>No courses yet</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', opacity: 0.7, textAlign: 'center' }}>
              Purchase or enroll in a free course to start learning
            </div>
            <button className="btn-primary" style={{ width: 180, marginTop: 8 }} onClick={() => navigate('/home')}>
              Browse Courses
            </button>
          </div>
        ) : (
          purchasedCourses.map((c, idx) => {
            const pct = c.percentComplete || 0;
            const isDone = pct >= 100;
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ delay: idx * 0.06 }}
                style={{ position: 'relative', marginBottom: 14 }}
              >
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  onClick={() => navigate(`/course/${c.id}/modules`)}
                  aria-label={`${c.title} — ${pct}% complete${isDone ? ', completed' : ', continue learning'} — tap to open`}
                  style={{ display: 'flex', gap: 14, padding: 12, background: 'var(--bg-surface)', borderRadius: 16, cursor: 'pointer', border: '1px solid var(--border)', width: '100%', textAlign: 'left', fontFamily: 'Inter,sans-serif', color: 'var(--text-primary)' }}
                >
                  <img src={c.image} alt={c.title} style={{ width: 76, height: 76, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0, paddingRight: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', letterSpacing: '-0.01em', marginBottom: 2 }}>
                      {c.title}
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 5 }}>
                        <span>{pct}% complete</span>
                        {isDone
                          ? <span style={{ color: 'var(--success)', fontWeight: 700 }}>✓ Done</span>
                          : <span style={{ color: 'var(--accent-text)', fontWeight: 600 }}>Continue →</span>
                        }
                      </div>
                      <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: 0.1 + idx * 0.06, duration: 0.8, ease: 'easeOut' }}
                          style={{ height: '100%', background: isDone ? 'var(--success)' : 'var(--primary)', borderRadius: 3 }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.button>

                {/* Remove button */}
                <button
                  onClick={() => setConfirmRemove(c.id)}
                  aria-label={`Remove ${c.title}`}
                  style={{ position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: '50%', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer', border: 'none' }}
                >
                  <HiXMark size={13} />
                </button>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Confirm remove sheet */}
      <AnimatePresence>
        {confirmRemove && (() => {
          const course = purchasedCourses.find(c => String(c.id) === String(confirmRemove));
          return (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}
              onClick={() => setConfirmRemove(null)}
            >
              <motion.div
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                onClick={e => e.stopPropagation()}
                style={{ background: 'var(--bg-surface)', width: '100%', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: '24px 20px 36px' }}
              >
                <div style={{ width: 36, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 20px' }} />
                <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>Remove from My Learning?</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
                  "{course?.title}" will be removed. Your progress will be lost.
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn-outline" style={{ flex: 1 }} onClick={() => setConfirmRemove(null)}>Cancel</button>
                  <button
                    className="btn-primary"
                    style={{ flex: 1, background: 'var(--error, #ef4444)' }}
                    onClick={() => handleRemove(confirmRemove)}
                  >
                    Remove
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      <Chatbot />
      <BottomNav />
    </div>
  );
}
