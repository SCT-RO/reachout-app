import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import {
  getUserPhoto, saveUserPhoto, removeUserPhoto,
  getUsers,
} from '../utils/storage';
import { HiArrowLeft, HiCamera, HiPhoto, HiTrash, HiXMark } from '../components/Icons';

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

// Shake wrapper — re-mounts key to retrigger animation
function ShakeField({ error, children }) {
  return (
    <div>
      {children}
      <AnimatePresence>
        {error && (
          <motion.div
            key={error}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            style={{ fontSize: 12, color: 'var(--error)', marginTop: 5, paddingLeft: 4, fontWeight: 500 }}
            className="shake"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Floating label input (same pattern as AuthScreen)
function FloatInput({ id, type = 'text', label, value, onChange, error }) {
  return (
    <ShakeField error={error}>
      <div className="input-wrap">
        <input
          id={id} className="input-field" type={type} placeholder=" "
          value={value} onChange={e => onChange(e.target.value)}
          style={error ? { borderColor: 'var(--error)' } : {}}
        />
        <label className="input-label" htmlFor={id}>{label}</label>
      </div>
    </ShakeField>
  );
}

// Bottom sheet for photo action options
function PhotoSheet({ hasPhoto, onCamera, onLibrary, onRemove, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }}
        transition={{ type: 'spring', damping: 26, stiffness: 220 }}
        onClick={e => e.stopPropagation()}
        style={{ background: 'var(--bg-surface)', width: '100%', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: '20px 20px 36px' }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 20px' }} />
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, textAlign: 'center' }}>Change Photo</div>
        {[
          { label: 'Take Photo', icon: <HiCamera />, onClick: onCamera },
          { label: 'Choose from Library', icon: <HiPhoto />, onClick: onLibrary },
          ...(hasPhoto ? [{ label: 'Remove Photo', icon: <HiTrash />, onClick: onRemove, danger: true }] : []),
        ].map(opt => (
          <motion.button
            key={opt.label}
            whileTap={{ scale: 0.97 }}
            onClick={opt.onClick}
            style={{ width: '100%', padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12, borderRadius: 12, background: 'var(--bg-dark)', border: 'none', color: opt.danger ? 'var(--error)' : 'var(--text-primary)', fontSize: 14, fontWeight: 600, fontFamily: 'Inter,sans-serif', cursor: 'pointer', marginBottom: 8 }}
          >
            <span style={{ color: opt.danger ? 'var(--error)' : 'var(--text-muted)' }}>{opt.icon}</span>
            {opt.label}
          </motion.button>
        ))}
        <button onClick={onCancel} style={{ width: '100%', padding: 13, color: 'var(--text-muted)', fontSize: 14, fontWeight: 600, fontFamily: 'Inter,sans-serif', cursor: 'pointer', marginTop: 4 }}>Cancel</button>
      </motion.div>
    </motion.div>
  );
}

export default function EditProfileScreen() {
  const navigate = useNavigate();
  const { currentUser, updateProfile, showToast } = useApp();

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [photo, setPhoto] = useState(() => currentUser ? getUserPhoto(currentUser.userId) : null);
  const [errors, setErrors] = useState({});
  const [showPhotoSheet, setShowPhotoSheet] = useState(false);
  const [emailNote, setEmailNote] = useState(false);

  const cameraRef = useRef(null);
  const libraryRef = useRef(null);

  const hasChanged =
    name !== (currentUser?.name || '') ||
    email !== (currentUser?.email || '') ||
    photo !== (currentUser ? getUserPhoto(currentUser.userId) : null);

  const validateEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setShowPhotoSheet(false);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const b64 = ev.target.result;
      setPhoto(b64);
      saveUserPhoto(currentUser.userId, b64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    removeUserPhoto(currentUser.userId);
    setPhoto(null);
    setShowPhotoSheet(false);
  };

  const handleSave = () => {
    const errs = {};
    if (!name.trim() || name.trim().length < 2) errs.name = 'Name must be at least 2 characters.';
    if (/\d/.test(name)) errs.name = 'Name cannot contain numbers.';
    if (!validateEmail(email)) errs.email = 'Invalid email format.';
    if (email !== currentUser?.email) {
      const allUsers = getUsers();
      const taken = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.id !== currentUser.userId);
      if (taken) errs.email = 'This email is already in use.';
    }
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});

    updateProfile({ name: name.trim(), email: email.trim().toLowerCase() });

    if (email !== currentUser?.email) setEmailNote(true);
    showToast('Profile updated ✓');
    navigate('/profile');
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
        <h1 style={{ flex: 1, fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em' }}>Edit Profile</h1>
        <button
          onClick={handleSave}
          disabled={!hasChanged}
          style={{ fontSize: 14, fontWeight: 700, color: hasChanged ? 'var(--primary)' : 'var(--text-muted)', cursor: hasChanged ? 'pointer' : 'default', transition: 'color 0.2s', fontFamily: 'Inter,sans-serif' }}
        >
          Save
        </button>
      </div>

      <div className="hide-scrollbar" style={{ flex: 1, padding: '24px 20px', overflowY: 'auto', paddingBottom: 100 }}>

        {/* Avatar */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <div style={{ position: 'relative' }}>
            <motion.div whileTap={{ scale: 0.95 }} onClick={() => setShowPhotoSheet(true)} style={{ cursor: 'pointer' }}>
              {photo ? (
                <img src={photo} alt="avatar" style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }} />
              ) : (
                <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, fontWeight: 800, color: '#fff' }}>
                  {getInitials(name || currentUser?.name)}
                </div>
              )}
            </motion.div>
            <div
              onClick={() => setShowPhotoSheet(true)}
              style={{ position: 'absolute', bottom: 2, right: 2, width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid var(--bg-dark)' }}
            >
              <HiCamera />
            </div>
          </div>
        </div>

        {/* Hidden file inputs */}
        <input ref={cameraRef} type="file" accept="image/*" capture="camera" style={{ display: 'none' }} onChange={handleFileChange} />
        <input ref={libraryRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />

        {/* Form fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <FloatInput
            id="edit-name" label="Full Name" value={name}
            onChange={v => { setName(v); setErrors(p => ({ ...p, name: null })); }}
            error={errors.name}
          />
          <FloatInput
            id="edit-email" type="email" label="Email Address" value={email}
            onChange={v => { setEmail(v); setErrors(p => ({ ...p, email: null })); }}
            error={errors.email}
          />
          {emailNote && (
            <div style={{ fontSize: 12, color: 'var(--warning)', padding: '8px 12px', background: 'rgba(245,158,11,0.08)', borderRadius: 10, border: '1px solid rgba(245,158,11,0.2)' }}>
              You'll use your new email to sign in next time.
            </div>
          )}
        </div>
      </div>

      {/* Save button (bottom) */}
      <div style={{ padding: '14px 20px 28px', borderTop: '1px solid var(--border)', background: 'var(--bg-dark)' }}>
        <button className="btn-primary" onClick={handleSave} disabled={!hasChanged} style={{ opacity: hasChanged ? 1 : 0.45 }}>
          Save Changes
        </button>
      </div>

      <AnimatePresence>
        {showPhotoSheet && (
          <PhotoSheet
            hasPhoto={!!photo}
            onCamera={() => { setShowPhotoSheet(false); setTimeout(() => cameraRef.current?.click(), 100); }}
            onLibrary={() => { setShowPhotoSheet(false); setTimeout(() => libraryRef.current?.click(), 100); }}
            onRemove={handleRemovePhoto}
            onCancel={() => setShowPhotoSheet(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
