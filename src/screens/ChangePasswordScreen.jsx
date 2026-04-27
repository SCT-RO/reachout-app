import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { validateUser, updateUserPassword } from '../utils/storage';
import { hashPassword } from '../utils/hash';
import { HiArrowLeft, HiLockClosed, HiEye, HiEyeSlash, HiCheck } from '../components/Icons';

// ─── Password strength helpers ────────────────────────────────────────────────
function getStrength(pwd) {
  if (!pwd || pwd.length < 6) return 'weak';
  const hasUpper = /[A-Z]/.test(pwd);
  const hasNum = /[0-9]/.test(pwd);
  const hasSpecial = /[!@#$%^&*]/.test(pwd);
  if (pwd.length >= 8 && hasUpper && hasNum && hasSpecial) return 'strong';
  return 'fair';
}

function getReqs(pwd) {
  return [
    { label: 'At least 8 characters', met: pwd.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(pwd) },
    { label: 'One number', met: /[0-9]/.test(pwd) },
    { label: 'One special character (!@#$%^&*)', met: /[!@#$%^&*]/.test(pwd) },
  ];
}

// ─── Password input with eye toggle ──────────────────────────────────────────
function PwdInput({ id, label, value, onChange, onBlur, error }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <div className="input-wrap">
        <input
          id={id}
          className="input-field"
          type={show ? 'text' : 'password'}
          placeholder=" "
          value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={onBlur}
          style={{ paddingRight: 44, ...(error ? { borderColor: 'var(--error)' } : {}) }}
        />
        <div className="input-icon"><HiLockClosed /></div>
        <label className="input-label" htmlFor={id}>{label}</label>
        <button
          type="button"
          onClick={() => setShow(p => !p)}
          style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
        >
          {show ? <HiEyeSlash /> : <HiEye />}
        </button>
      </div>
      <AnimatePresence>
        {error && (
          <motion.div
            key={error}
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="shake"
            style={{ fontSize: 12, color: 'var(--error-text)', marginTop: 5, paddingLeft: 4, fontWeight: 500 }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ChangePasswordScreen() {
  const navigate = useNavigate();
  const { currentUser, showToast } = useApp();

  const [current, setCurrent] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const strength = getStrength(newPwd);
  const reqs = getReqs(newPwd);
  const strengthColor = { weak: 'var(--error)', fair: 'var(--warning)', strong: 'var(--success)' }[strength];
  const strengthWidth = { weak: '33%', fair: '66%', strong: '100%' }[strength];

  const canSubmit = current && newPwd && confirm && reqs.every(r => r.met) && newPwd === confirm;

  const handleCurrentBlur = () => {
    if (!current) return;
    const valid = validateUser(currentUser.email, current);
    if (!valid) setErrors(p => ({ ...p, current: 'Current password is incorrect.' }));
    else setErrors(p => ({ ...p, current: null }));
  };

  const handleConfirmBlur = () => {
    if (confirm && newPwd !== confirm) setErrors(p => ({ ...p, confirm: 'Passwords do not match.' }));
    else setErrors(p => ({ ...p, confirm: null }));
  };

  const handleSubmit = () => {
    const errs = {};
    if (!validateUser(currentUser.email, current)) errs.current = 'Current password is incorrect.';
    if (!reqs.every(r => r.met)) errs.newPwd = 'Password does not meet all requirements.';
    if (newPwd !== confirm) errs.confirm = 'Passwords do not match.';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    updateUserPassword(currentUser.userId, hashPassword(newPwd));
    setSuccess(true);
    showToast('Password updated ✓');
    setTimeout(() => navigate('/profile'), 1600);
  };

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
      transition={{ duration: 0.22 }}
      style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)', position: 'relative' }}
    >
      {/* Header */}
      <div style={{ padding: '24px 20px 14px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <button onClick={() => navigate('/profile')} style={{ color: 'var(--text-primary)', cursor: 'pointer' }}><HiArrowLeft /></button>
        <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em' }}>Change Password</h1>
      </div>

      <div className="hide-scrollbar" style={{ flex: 1, padding: '24px 20px', overflowY: 'auto', paddingBottom: 100 }}>
        <AnimatePresence mode="wait">
          {success ? (
            // Success state
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70%', gap: 16 }}
            >
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 12px 28px rgba(34,197,94,0.3)' }}
              >
                <HiCheck size={36} />
              </motion.div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>Password Updated!</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Redirecting you back…</div>
            </motion.div>
          ) : (
            <motion.div key="form" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Current password */}
              <PwdInput
                id="cur-pwd" label="Current Password"
                value={current} onChange={v => { setCurrent(v); setErrors(p => ({ ...p, current: null })); }}
                onBlur={handleCurrentBlur} error={errors.current}
              />

              {/* New password + strength */}
              <div>
                <PwdInput
                  id="new-pwd" label="New Password"
                  value={newPwd} onChange={v => { setNewPwd(v); setErrors(p => ({ ...p, newPwd: null })); }}
                  error={errors.newPwd}
                />
                {newPwd && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 12 }}>
                    {/* Strength bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                        <motion.div
                          animate={{ width: strengthWidth, background: strengthColor }}
                          transition={{ duration: 0.3 }}
                          style={{ height: '100%', borderRadius: 2 }}
                        />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: strengthColor, textTransform: 'capitalize', minWidth: 40 }}>{strength}</span>
                    </div>
                    {/* Checklist */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {reqs.map(r => (
                        <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                          <div style={{ width: 16, height: 16, borderRadius: '50%', background: r.met ? 'var(--success)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s', flexShrink: 0 }}>
                            {r.met && <HiCheck size={10} />}
                          </div>
                          <span style={{ color: r.met ? 'var(--success)' : 'var(--text-muted)', transition: 'color 0.2s' }}>{r.label}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Confirm password */}
              <PwdInput
                id="con-pwd" label="Confirm New Password"
                value={confirm} onChange={v => { setConfirm(v); setErrors(p => ({ ...p, confirm: null })); }}
                onBlur={handleConfirmBlur} error={errors.confirm}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!success && (
        <div style={{ padding: '14px 20px 28px', borderTop: '1px solid var(--border)', background: 'var(--bg-dark)' }}>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{ opacity: canSubmit ? 1 : 0.45 }}
          >
            Update Password
          </button>
        </div>
      )}
    </motion.div>
  );
}
