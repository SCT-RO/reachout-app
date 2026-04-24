import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HiSparkles = ({ size = 24 }) => <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423L16.5 15.75l.394 1.183a2.25 2.25 0 001.423 1.423L19.5 18.75l-1.183.394a2.25 2.25 0 00-1.423 1.423z"/></svg>;
const HiXMark = ({ size = 20 }) => <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>;
const HiMicrophone = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"/></svg>;
const HiPaperAirplane = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/></svg>;

const INITIAL = [{ text: "Hi! I'm ARIA. How can I help with your learning journey?", isBot: true }];

function getBotReply(msg) {
  const m = msg.toLowerCase();
  if (m.includes('python')) return 'Python for Data Science is highly recommended! It covers pandas, NumPy, and scikit-learn. Want to check it out?';
  if (m.includes('price') || m.includes('cost') || m.includes('discount')) return 'Courses range from Free to ₹2499. Use promo code REACH20 at checkout for 20% off!';
  if (m.includes('progress') || m.includes('certificate')) return 'You can track your progress in "My Learning". Earn a certificate by scoring ≥70% on the course quiz!';
  if (m.includes('quiz')) return 'Each course has a quiz at the end. Score 70% or higher to earn your completion badge!';
  if (m.includes('help')) return 'I can help you find courses, check prices, or explain features. What would you like to know?';
  return "I can help you find courses, track your progress, or answer topic-specific questions!";
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping, isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;
    const msg = input;
    setMessages(p => [...p, { text: msg, isBot: false }]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(p => [...p, { text: getBotReply(msg), isBot: true }]);
    }, 1200);
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen(true)}
        style={{ position: 'absolute', bottom: 82, right: 20, width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--accent))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(79,70,229,0.45)', zIndex: 100, border: 'none', cursor: 'pointer' }}
      >
        <HiSparkles size={22} />
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: 500, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 500, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 200 }}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '68%', background: 'var(--bg-surface)', borderTopLeftRadius: 24, borderTopRightRadius: 24, zIndex: 101, display: 'flex', flexDirection: 'column', boxShadow: '0 -10px 40px rgba(0,0,0,0.4)' }}
          >
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-dark)', borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><HiSparkles size={20} /><span style={{ fontWeight: 700, fontSize: 15 }}>ARIA Assistant</span></div>
              <button onClick={() => setIsOpen(false)} style={{ color: 'var(--text-muted)', cursor: 'pointer' }}><HiXMark /></button>
            </div>
            <div className="hide-scrollbar" style={{ flex: 1, padding: 14, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.map((m, i) => (
                <div key={i} style={{ alignSelf: m.isBot ? 'flex-start' : 'flex-end', background: m.isBot ? 'var(--bg-dark)' : 'var(--primary)', padding: '10px 14px', borderRadius: 16, borderBottomLeftRadius: m.isBot ? 4 : 16, borderBottomRightRadius: m.isBot ? 16 : 4, maxWidth: '80%', fontSize: 13, lineHeight: 1.5, color: m.isBot ? 'var(--text-primary)' : '#fff' }}>{m.text}</div>
              ))}
              {isTyping && (
                <div style={{ alignSelf: 'flex-start', background: 'var(--bg-dark)', padding: '10px 14px', borderRadius: 16, borderBottomLeftRadius: 4 }}>
                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4 }} style={{ display: 'flex', gap: 4 }}>
                    {[0, 1, 2].map(n => <div key={n} style={{ width: 6, height: 6, background: 'var(--text-muted)', borderRadius: '50%' }} />)}
                  </motion.div>
                </div>
              )}
              <div ref={endRef} />
            </div>
            <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, background: 'var(--bg-dark)' }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} style={{ flex: 1, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 24, padding: '10px 14px', color: 'var(--text-primary)', fontSize: 13, outline: 'none', fontFamily: 'Inter,sans-serif' }} placeholder="Ask ARIA..." />
              <button style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', border: '1px solid var(--border)', flexShrink: 0, cursor: 'pointer' }}><HiMicrophone /></button>
              <button onClick={handleSend} style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: 'none', cursor: 'pointer' }}><HiPaperAirplane /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
