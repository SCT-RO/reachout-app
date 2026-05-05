import { motion } from 'framer-motion';

export default function Toast({ message, type = 'success' }: { message: string; type?: string }) {
  const bg = type === 'error' ? 'var(--error)' : type === 'warning' ? 'var(--warning)' : 'var(--success)';
  return (
    <motion.div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -50, opacity: 0 }}
      style={{
        position: 'absolute',
        top: 44,
        left: '8%',
        right: '8%',
        background: bg,
        color: '#fff',
        padding: '11px 16px',
        borderRadius: 12,
        textAlign: 'center',
        fontWeight: 600,
        zIndex: 1000,
        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        fontSize: 14,
      }}
    >
      {message}
    </motion.div>
  );
}
