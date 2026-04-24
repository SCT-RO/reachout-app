import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { getSupportMessages, saveSupportMessages } from '../utils/storage';
import { HiArrowLeft, HiPaperAirplane } from '../components/Icons';

const ADMIN_NAME = 'ReachOut Admin';

function getAutoReply(msg) {
  const m = msg.toLowerCase();
  if (m.includes('password') || m.includes('login') || m.includes('sign in'))
    return 'For password issues, go to Profile → Change Password. If you\'re locked out, try signing up with a new account and contact us with your registered email.';
  if (m.includes('payment') || m.includes('refund') || m.includes('billing') || m.includes('charge'))
    return 'For payment or refund queries, please note that all purchases are final per our policy. However, we can review your case — please share your registered email and transaction details.';
  if (m.includes('certificate') || m.includes('completion') || m.includes('badge'))
    return 'Certificates are issued automatically once you complete 100% of a course and pass the final quiz with a score of 70% or higher.';
  if (m.includes('course') || m.includes('content') || m.includes('access') || m.includes('video'))
    return 'All course content is available immediately after purchase. If you\'re facing access issues, try logging out and back in.';
  return 'Thanks for reaching out! I\'ve noted your message and our team will follow up within 24 hours. Is there anything else I can help with?';
}

function formatMsgTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function HelpSupportScreen() {
  const navigate = useNavigate();
  const { currentUser } = useApp();

  const firstName = currentUser?.name?.split(' ')[0] || 'there';
  const userId = currentUser?.userId;

  // Initialize messages, adding the welcome message if empty
  const [messages, setMessages] = useState(() => {
    if (!userId) return [];
    const stored = getSupportMessages(userId);
    if (stored.length === 0) {
      const welcome = [{
        id: `m_${Date.now()}`,
        text: `Hi ${firstName}! 👋 How can I help you today? Feel free to ask anything about your courses, technical issues, or billing.`,
        from: 'admin',
        timestamp: new Date().toISOString(),
      }];
      saveSupportMessages(userId, welcome);
      return welcome;
    }
    return stored;
  });

  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg = { id: `m_${Date.now()}`, text, from: 'user', timestamp: new Date().toISOString() };
    const next = [...messages, userMsg];
    setMessages(next);
    if (userId) saveSupportMessages(userId, next);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      setTyping(false);
      const reply = {
        id: `m_${Date.now() + 1}`,
        text: getAutoReply(text),
        from: 'admin',
        timestamp: new Date().toISOString(),
      };
      const withReply = [...next, reply];
      setMessages(withReply);
      if (userId) saveSupportMessages(userId, withReply);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
      transition={{ duration: 0.22 }}
      style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)', position: 'relative' }}
    >
      {/* Header */}
      <div style={{ padding: '20px 20px 14px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <button onClick={() => navigate('/profile')} style={{ color: 'var(--text-primary)', cursor: 'pointer' }}><HiArrowLeft /></button>
        <h1 style={{ flex: 1, fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em' }}>Help & Support</h1>
      </div>

      {/* Admin contact card */}
      <div style={{ margin: '14px 16px 0', padding: '12px 14px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
          RA
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{ADMIN_NAME}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)' }} />
              <span style={{ fontSize: 10, color: 'var(--success)', fontWeight: 600 }}>Online</span>
            </div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Support Team · Replies within a few hours</div>
        </div>
      </div>

      {/* Messages */}
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map(msg => {
          const isUser = msg.from === 'user';
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}
            >
              {!isUser && (
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3, paddingLeft: 4, fontWeight: 600 }}>{ADMIN_NAME}</div>
              )}
              <div style={{
                background: isUser ? 'var(--primary)' : 'var(--bg-surface)',
                color: isUser ? '#fff' : 'var(--text-primary)',
                padding: '10px 14px',
                borderRadius: 16,
                borderBottomRightRadius: isUser ? 4 : 16,
                borderBottomLeftRadius: isUser ? 16 : 4,
                maxWidth: '82%',
                fontSize: 13,
                lineHeight: 1.55,
                border: isUser ? 'none' : '1px solid var(--border)',
              }}>
                {msg.text}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3, paddingLeft: 4, paddingRight: 4 }}>
                {formatMsgTime(msg.timestamp)}
              </div>
            </motion.div>
          );
        })}

        {/* Typing indicator */}
        {typing && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3, paddingLeft: 4, fontWeight: 600 }}>{ADMIN_NAME}</div>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '10px 14px', borderRadius: 16, borderBottomLeftRadius: 4 }}>
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.4 }}
                style={{ display: 'flex', gap: 4, alignItems: 'center' }}
              >
                {[0, 1, 2].map(n => <div key={n} style={{ width: 6, height: 6, background: 'var(--text-muted)', borderRadius: '50%' }} />)}
              </motion.div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input bar */}
      <div style={{ padding: '10px 14px 28px', borderTop: '1px solid var(--border)', background: 'var(--bg-dark)', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Type a message…"
          style={{ flex: 1, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 24, padding: '10px 16px', color: 'var(--text-primary)', fontSize: 13, outline: 'none', fontFamily: 'Inter,sans-serif' }}
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleSend}
          style={{ width: 42, height: 42, borderRadius: '50%', background: input.trim() ? 'var(--primary)' : 'var(--bg-surface)', color: input.trim() ? '#fff' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.2s, color 0.2s', flexShrink: 0 }}
        >
          <HiPaperAirplane />
        </motion.button>
      </div>
    </motion.div>
  );
}
