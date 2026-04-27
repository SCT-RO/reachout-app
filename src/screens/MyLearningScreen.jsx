import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { getPurchased, getProgress } from '../utils/storage';
import { courses } from '../data/courses';
import BottomNav from '../components/BottomNav';
import Chatbot from '../components/Chatbot';
import { HiBookOpen } from '../components/Icons';

export default function MyLearningScreen() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [purchasedCourses, setPurchasedCourses] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    const purchased = getPurchased(currentUser.userId);
    // Map purchased items to full course objects, merging with real-time progress
    const enriched = purchased
      .map(p => {
        const full = courses.find(c => c.id === p.id) || p;
        const progress = getProgress(currentUser.userId, full.id);
        return { ...full, percentComplete: progress.percentComplete };
      })
      .filter(Boolean);
    setPurchasedCourses(enriched);
  }, [currentUser]);

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
              <motion.button
                key={c.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                whileHover={{ scale: 1.01 }}
                onClick={() => navigate(`/lesson/${c.id}`)}
                aria-label={`${c.title} — ${pct}% complete${isDone ? ', completed' : ', continue learning'}`}
                style={{ display: 'flex', gap: 14, marginBottom: 14, padding: 12, background: 'var(--bg-surface)', borderRadius: 16, cursor: 'pointer', border: '1px solid var(--border)', width: '100%', textAlign: 'left', fontFamily: 'Inter,sans-serif', color: 'var(--text-primary)' }}
              >
                <img src={c.image} alt={c.title} style={{ width: 76, height: 76, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} crossOrigin="anonymous" />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', letterSpacing: '-0.01em', marginBottom: 2 }}>
                      {c.title}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.instructor}</div>
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
            );
          })
        )}
      </div>

      <Chatbot />
      <BottomNav />
    </div>
  );
}
