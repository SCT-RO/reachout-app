import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiCheck } from '../components/Icons';

export default function PaymentSuccessScreen() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', padding: 28 }}
    >
      <motion.div
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 12, stiffness: 200 }}
        style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, color: '#fff', boxShadow: '0 12px 32px rgba(34,197,94,0.3)' }}
      >
        <HiCheck size={40} />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        style={{ fontSize: 26, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em' }}
      >
        Payment Successful!
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
        style={{ color: 'var(--text-muted)', marginBottom: 12, textAlign: 'center', fontSize: 15 }}
      >
        You're all set. Time to start learning.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.55 }}
        style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 12, padding: '10px 20px', marginBottom: 36, fontSize: 13, color: 'var(--success)', fontWeight: 600 }}
      >
        🎓 Courses added to My Learning
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
        className="btn-primary"
        style={{ width: '80%' }}
        onClick={() => navigate('/learn', { replace: true })}
      >
        Go to My Learning
      </motion.button>

      <motion.button
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
        style={{ marginTop: 12, fontSize: 14, color: 'var(--text-muted)', fontWeight: 500, cursor: 'pointer', padding: '8px 16px' }}
        onClick={() => navigate('/home', { replace: true })}
      >
        Browse more courses
      </motion.button>
    </motion.div>
  );
}
