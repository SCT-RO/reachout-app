import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getSession } from '../utils/storage';

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const session = getSession();
    const timer = setTimeout(() => {
      navigate(session ? '/home' : '/auth', { replace: true });
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', background: 'radial-gradient(circle at 50% 25%, rgba(79,70,229,0.3) 0%, var(--bg-dark) 60%)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <div style={{ width: 68, height: 68, background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 800, color: '#fff', boxShadow: '0 12px 32px rgba(79,70,229,0.5)', marginBottom: 28 }}>R</div>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
          style={{ fontSize: 38, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10, letterSpacing: '-0.03em' }}
        >ReachOut</motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.6 }}
          style={{ color: 'var(--text-muted)', fontSize: 16, letterSpacing: '0.03em' }}
        >Learn. Grow. Achieve.</motion.p>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.6 }}
        style={{ padding: '32px 28px' }}
      >
        <button className="btn-primary" onClick={() => navigate('/auth')} style={{ fontSize: 16, fontWeight: 700, padding: 18 }}>
          Get Started
        </button>
      </motion.div>
    </div>
  );
}
