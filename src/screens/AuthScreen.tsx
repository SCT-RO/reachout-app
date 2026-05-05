import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { createUser, setSession } from '../utils/storage';

// ─── Icons ────────────────────────────────────────────────────────────────────
const HiEnvelope = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/></svg>;
const HiLockClosed = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/></svg>;
const HiUser = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>;
const IconGoogle = () => <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>;

// ─── Floating Label Input ─────────────────────────────────────────────────────
function FloatInput({ id, type = 'text', label, icon, value, onChange, error }: {
  id: string;
  type?: string;
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div style={{ marginBottom: error ? 4 : 0 }}>
      <div className="input-wrap">
        <input
          id={id} className="input-field" type={type} placeholder=" "
          value={value} onChange={e => onChange(e.target.value)}
          style={error ? { borderColor: 'var(--error)' } : {}}
          autoComplete={type === 'password' ? 'current-password' : type === 'email' ? 'email' : 'name'}
        />
        <div className="input-icon">{icon}</div>
        <label className="input-label" htmlFor={id}>{label}</label>
      </div>
      {error && <div style={{ fontSize: 12, color: 'var(--error-text)', marginTop: 5, fontWeight: 500, paddingLeft: 4 }}>{error}</div>}
    </div>
  );
}

// ─── Forgot Password Modal ────────────────────────────────────────────────────
function ForgotPasswordModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="forgot-pw-title"
        initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }}
        transition={{ type: 'spring', damping: 24, stiffness: 200 }}
        onClick={e => e.stopPropagation()}
        style={{ background: 'var(--bg-surface)', width: '100%', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: '28px 24px 40px' }}
      >
        <div id="forgot-pw-title" style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Forgot Password?</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.5 }}>
          Enter your registered email and we'll send a reset link (demo mode — no real email sent).
        </div>
        {!sent ? (
          <>
            <div className="input-wrap" style={{ marginBottom: 16 }}>
              <input className="input-field" type="email" placeholder=" " value={email} onChange={e => setEmail(e.target.value)} id="fp-email" />
              <div className="input-icon"><HiEnvelope /></div>
              <label className="input-label" htmlFor="fp-email">Email Address</label>
            </div>
            <button className="btn-primary" onClick={() => email && setSent(true)} style={{ opacity: email ? 1 : 0.5 }}>Send Reset Link</button>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📬</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Check your inbox</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>A reset link has been sent to <strong>{email}</strong></div>
            <button className="btn-primary" onClick={onClose}>Got it</button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Main Auth Screen ─────────────────────────────────────────────────────────
export default function AuthScreen() {
  const [tab, setTab] = useState('signIn');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSubmit = async () => {
    const errs: Record<string, string> = {};
    if (tab === 'signUp' && !name.trim()) errs.name = 'Name is required.';
    if (!email.trim()) errs.email = 'Email is required.';
    else if (!validateEmail(email)) errs.email = 'Enter a valid email address.';
    if (!password) errs.password = 'Password is required.';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters.';

    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    const fn = tab === 'signIn' ? login(email, password) : signup(name, email, password);
    const result = await fn;
    setLoading(false);
    if (result?.error) setErrors({ form: result.error });
  };

  const handleGoogle = () => {
    const demoUser = createUser({ name: 'Google User', email: `google_${Date.now()}@demo.com`, password: 'google_oauth' });
    setSession(demoUser);
    navigate('/home', { replace: true });
  };

  const switchTab = (t) => { setTab(t); setErrors({}); setName(''); setEmail(''); setPassword(''); };

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', padding: '72px 28px 28px', background: 'var(--bg-dark)', overflowY: 'auto', position: 'relative' }}>
      <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 32, letterSpacing: '-0.02em' }}>
        {tab === 'signIn' ? 'Welcome Back' : 'Create Account'}
      </h1>

      {/* Tabs */}
      <div role="tablist" aria-label="Authentication options" style={{ display: 'flex', marginBottom: 32, position: 'relative' }}>
        {['signIn', 'signUp'].map(t => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            id={`tab-${t}`}
            aria-controls={`tabpanel-${t}`}
            style={{ flex: 1, textAlign: 'center', paddingBottom: 12, position: 'relative', cursor: 'pointer', color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 600, transition: 'color 0.2s', fontSize: 15, background: 'none', border: 'none', fontFamily: 'Inter,sans-serif', minHeight: 44 }}
            onClick={() => switchTab(t)}
          >
            {t === 'signIn' ? 'Sign In' : 'Sign Up'}
            {tab === t && <motion.div layoutId="auth-tab" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'var(--primary)', borderRadius: 2 }} />}
          </button>
        ))}
        <div aria-hidden="true" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'var(--border)', zIndex: -1 }} />
      </div>

      {/* Form error banner */}
      <AnimatePresence>
        {errors.form && (
          <motion.div role="alert" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: 'var(--error-text)', fontWeight: 500, marginBottom: 16 }}>
            {errors.form}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
        <AnimatePresence>
          {tab === 'signUp' && (
            <motion.div key="name-field" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
              <FloatInput id="name" label="Full Name" icon={<HiUser />} value={name} onChange={setName} error={errors.name} />
            </motion.div>
          )}
        </AnimatePresence>
        <FloatInput id="email" type="email" label="Email Address" icon={<HiEnvelope />} value={email} onChange={v => { setEmail(v); setErrors(p => ({ ...p, email: null, form: null })); }} error={errors.email} />
        <FloatInput id="password" type="password" label="Password" icon={<HiLockClosed />} value={password} onChange={v => { setPassword(v); setErrors(p => ({ ...p, password: null, form: null })); }} error={errors.password} />
      </div>

      {tab === 'signIn' && (
        <button
          style={{ fontSize: 13, color: 'var(--primary-text)', fontWeight: 600, textAlign: 'right', marginBottom: 28, cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'Inter,sans-serif', alignSelf: 'flex-end', display: 'block', width: '100%', minHeight: 44 }}
          onClick={() => setShowForgot(true)}
        >
          Forgot Password?
        </button>
      )}

      <button className="btn-primary" style={{ marginBottom: 24, opacity: loading ? 0.7 : 1 }} onClick={handleSubmit} disabled={loading}>
        {loading ? 'Please wait…' : tab === 'signIn' ? 'Sign In' : 'Sign Up'}
      </button>

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <div style={{ position: 'absolute', left: 0, right: 0, height: 1, background: 'var(--border)' }} />
        <div style={{ background: 'var(--bg-dark)', padding: '0 16px', position: 'relative', fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.08em' }}>OR</div>
      </div>
      <button className="btn-outline" onClick={handleGoogle}><IconGoogle /> Continue with Google</button>

      <AnimatePresence>
        {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
      </AnimatePresence>
    </div>
  );
}
