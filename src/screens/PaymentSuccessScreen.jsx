import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { getPurchased } from '../utils/storage';
import { findCoursePackage, getTotalContentCount } from '../data/courses';
import { useCourses } from '../hooks/useCourses';

const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
  { text: "Education is not the filling of a pail, but the lighting of a fire.", author: "W.B. Yeats" },
  { text: "The more that you read, the more things you will know.", author: "Dr. Seuss" },
];

const PARTICLE_COLORS = ['#4F46E5', '#A78BFA', '#22C55E', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6', '#10B981', '#F97316', '#06B6D4', '#EF4444', '#84CC16'];

// Pre-compute all random values at module load time (outside render)
const PARTICLES = PARTICLE_COLORS.map((color, i) => ({
  color,
  delay: i * 0.28,
  startX: -120 + i * 22,
  duration: 3.5 + Math.random() * 2,
  repeatDelay: Math.random() * 3,
  size: 8 + Math.random() * 8,
}));

const QUOTE = QUOTES[Math.floor(Math.random() * QUOTES.length)];

function Particle({ color, delay, startX, duration, repeatDelay, size }) {
  return (
    <motion.div
      initial={{ y: 0, x: startX, opacity: 0.8, scale: 1 }}
      animate={{ y: -320, opacity: 0, scale: 0.3 }}
      transition={{ duration, delay, repeat: Infinity, repeatDelay, ease: 'easeOut' }}
      style={{ position: 'absolute', bottom: 80, width: size, height: size, borderRadius: '50%', background: color, pointerEvents: 'none' }}
    />
  );
}

export default function PaymentSuccessScreen() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { courses } = useCourses();

  // Resolve the most recently purchased course for display
  const enrolledCourse = useMemo(() => {
    if (!currentUser) return null;
    const purchased = getPurchased(currentUser.userId);
    if (!purchased.length) return null;
    const latest = purchased[purchased.length - 1];
    const full = courses.find(c => String(c.id) === String(latest.id)) || latest;
    const pkg = findCoursePackage(full.title || '');
    const totalLessons = pkg ? getTotalContentCount(pkg) : (full.lessons || 0);
    const moduleCount = pkg?.modules?.length || 0;
    return { title: full.title || 'Your Course', totalLessons, moduleCount, pkg };
  }, [currentUser, courses]);

  const goLearn = () => {
    if (enrolledCourse && currentUser) {
      const purchased = getPurchased(currentUser.userId);
      const latest = purchased[purchased.length - 1];
      if (latest) { navigate(`/course/${latest.id}/modules`, { replace: true }); return; }
    }
    navigate('/learn', { replace: true });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
      className="hide-scrollbar"
      style={{
        height: '100%', width: '100%', overflowY: 'auto',
        background: 'radial-gradient(ellipse at top, rgba(79,70,229,0.35) 0%, var(--bg-dark) 65%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '40px 24px 40px', position: 'relative', fontFamily: 'Inter,sans-serif',
      }}
    >
      {/* Floating particles */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        {PARTICLES.map((p, i) => <Particle key={i} {...p} />)}
      </div>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* GIF */}
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 14, stiffness: 180, delay: 0.1 }}
          style={{ marginBottom: 24 }}
        >
          <img
            src="https://media.giphy.com/media/g9582DNuQppxC/giphy.gif"
            alt=""
            style={{ width: 200, height: 200, borderRadius: '50%', border: '3px solid rgba(79,70,229,0.4)', objectFit: 'cover', display: 'block' }}
            onError={e => { e.target.style.display = 'none'; }}
          />
        </motion.div>

        {/* Emoji row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ fontSize: 32, letterSpacing: 6, marginBottom: 12 }}
        >
          🎉 🚀 🎓
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          style={{
            fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 10, textAlign: 'center',
            background: 'linear-gradient(135deg, var(--primary) 0%, #A78BFA 50%, var(--accent, #6366f1) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}
        >
          You're In!
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          style={{ fontSize: 16, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 20, lineHeight: 1.5 }}
        >
          Your learning journey starts now.
        </motion.p>

        {/* Course pill */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.75 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
            background: 'rgba(79,70,229,0.1)', border: '1px solid rgba(79,70,229,0.25)',
            borderRadius: 14, marginBottom: 28, maxWidth: '100%',
          }}
        >
          <span style={{ fontSize: 18 }}>🎓</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {enrolledCourse?.title || 'Your Course'}
          </span>
          <span style={{ fontSize: 10, fontWeight: 800, color: '#22C55E', background: 'rgba(34,197,94,0.12)', padding: '3px 8px', borderRadius: 6, flexShrink: 0 }}>
            ENROLLED
          </span>
        </motion.div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 10, width: '100%', marginBottom: 24 }}>
          {[
            { icon: '🎬', value: enrolledCourse?.totalLessons || '—', label: 'Lessons', delay: 0.9 },
            { icon: '⏱', value: enrolledCourse?.pkg?.duration || '—', label: 'Content', delay: 1.0 },
            { icon: '📚', value: enrolledCourse?.moduleCount || '—', label: 'Modules', delay: 1.1 },
          ].map(({ icon, value, label, delay }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
              style={{ flex: 1, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 8px', textAlign: 'center' }}
            >
              <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary-text)', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, fontWeight: 600 }}>{label}</div>
            </motion.div>
          ))}
        </div>

        {/* Quote card */}
        <motion.div
          initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2 }}
          style={{
            width: '100%', padding: '14px 16px', marginBottom: 28,
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderLeft: '3px solid var(--primary)', borderRadius: 12,
          }}
        >
          <p style={{ fontSize: 13, fontStyle: 'italic', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: 8 }}>
            "{QUOTE.text}"
          </p>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary-text)' }}>— {QUOTE.author}</span>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }}
          style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={goLearn}
            style={{
              width: '100%', padding: '15px', borderRadius: 14, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, var(--primary) 0%, #A78BFA 100%)',
              color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: 'Inter,sans-serif',
              boxShadow: '0 8px 24px rgba(79,70,229,0.35)',
            }}
          >
            Start Learning Now 🚀
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/home', { replace: true })}
            style={{
              width: '100%', padding: '13px', borderRadius: 14, border: '1px solid var(--border)',
              background: 'transparent', color: 'var(--text-muted)', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'Inter,sans-serif',
            }}
          >
            Back to Home
          </motion.button>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}
          style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 24, lineHeight: 1.6, opacity: 0.7 }}
        >
          🔒 Secure payment · Instant access · Cancel anytime
        </motion.p>

      </div>
    </motion.div>
  );
}
