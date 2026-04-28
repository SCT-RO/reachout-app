import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HiLockClosed, HiXMark } from './Icons';

export default function PaywallSheet({ course, onClose, visible }) {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 400, display: 'flex', alignItems: 'flex-end' }}
          onClick={onClose}
        >
          <motion.div
            role="dialog" aria-modal="true" aria-labelledby="paywall-title"
            initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            onClick={e => e.stopPropagation()}
            style={{ background: 'var(--bg-surface)', width: '100%', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: '28px 24px 40px', position: 'relative' }}
          >
            <button
              onClick={onClose}
              aria-label="Close"
              style={{ position: 'absolute', top: 16, right: 16, color: 'var(--text-muted)', padding: 4 }}
            >
              <HiXMark size={20} />
            </button>

            <div aria-hidden="true" style={{ width: 36, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 24px' }} />

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(79,70,229,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-text)', marginBottom: 4 }}>
                <HiLockClosed size={28} />
              </div>

              <div id="paywall-title" style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em' }}>
                This content is locked
              </div>

              <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, maxWidth: 260 }}>
                Enroll in <strong style={{ color: 'var(--text-primary)' }}>{course?.title}</strong> to access all modules and content.
              </div>

              <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4, color: course?.price === 0 ? 'var(--success)' : 'var(--text-primary)' }}>
                {course?.price === 0 ? 'Free' : `₹${course?.price?.toLocaleString()}`}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 }}>
              <motion.button
                whileTap={{ scale: 0.97 }}
                className="btn-primary"
                onClick={() => { onClose(); navigate(`/course/${course?.id}`); }}
              >
                {course?.price === 0 ? 'Enroll Now — Free' : `Enroll Now for ₹${course?.price?.toLocaleString()}`}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.97 }}
                className="btn-outline"
                onClick={onClose}
              >
                View Free Preview
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
