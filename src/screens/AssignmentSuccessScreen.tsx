import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { HiCheck } from '../components/Icons';

// 6 confetti dots that burst outward from the success circle
const CONFETTI = [
  { angle: 0,   color: '#4F46E5', dist: 72 },
  { angle: 60,  color: '#22C55E', dist: 80 },
  { angle: 120, color: '#F59E0B', dist: 72 },
  { angle: 180, color: '#6366F1', dist: 80 },
  { angle: 240, color: '#EF4444', dist: 72 },
  { angle: 300, color: '#8B5CF6', dist: 80 },
];

function formatTime(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const today = new Date().toDateString() === d.toDateString() ? 'Today' : d.toLocaleDateString();
  return `${today} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

export default function AssignmentSuccessScreen() {
  const navigate = useNavigate();
  const { showToast } = useApp();

  const assignment = JSON.parse(sessionStorage.getItem('ro_last_assignment') || 'null');

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', padding: '24px 28px', textAlign: 'center' }}
    >
      {/* Success circle + confetti burst */}
      <div style={{ position: 'relative', marginBottom: 28 }}>
        {CONFETTI.map((dot, i) => {
          const rad = (dot.angle * Math.PI) / 180;
          const tx = Math.cos(rad) * dot.dist;
          const ty = Math.sin(rad) * dot.dist;
          return (
            <motion.div
              key={i}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{ x: tx, y: ty, opacity: 0, scale: 0.4 }}
              transition={{ delay: 0.35 + i * 0.04, duration: 0.65, ease: 'easeOut' }}
              style={{ position: 'absolute', width: 10, height: 10, borderRadius: '50%', background: dot.color, top: '50%', left: '50%', marginTop: -5, marginLeft: -5 }}
            />
          );
        })}
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12, stiffness: 200 }}
          style={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 16px 40px rgba(79,70,229,0.4)' }}
        >
          <HiCheck size={48} />
        </motion.div>
      </div>

      <motion.h2
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        style={{ fontSize: 24, fontWeight: 800, marginBottom: 10, letterSpacing: '-0.02em' }}
      >
        Assignment Submitted!
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}
        style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6, maxWidth: 280, marginBottom: 28 }}
      >
        Your assignment has been received. Your instructor will review it and get back to you.
      </motion.p>

      {/* Assignment details card */}
      {assignment && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 16, marginBottom: 28, textAlign: 'left' }}
        >
          <div style={{ fontSize: 11, color: 'var(--accent-text)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Submission Details</div>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{assignment.courseName}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>{assignment.title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', flexShrink: 0 }} />
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatTime(assignment.submittedAt)}</div>
          </div>
        </motion.div>
      )}

      <motion.button
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
        className="btn-primary"
        style={{ width: '100%', marginBottom: 12 }}
        onClick={() => navigate('/home', { replace: true })}
      >
        Back to Home
      </motion.button>

      <motion.button
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.78 }}
        onClick={() => showToast('Coming soon 🚀')}
        style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, cursor: 'pointer', padding: '6px 12px', fontFamily: 'Inter,sans-serif' }}
      >
        View All Submissions
      </motion.button>
    </motion.div>
  );
}
