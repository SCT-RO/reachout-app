import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { getUserPhoto, getPurchased } from '../utils/storage';
import BottomNav from '../components/BottomNav';
import Chatbot from '../components/Chatbot';
import {
  HiPencilSquare, HiLockClosed, HiPaperClip, HiAcademicCap,
  HiSun, HiMoon, HiQuestionMarkCircle, HiShieldCheck, HiStar,
  HiArrowRightOnRectangle, HiChevronRight, HiCamera,
} from '../components/Icons';

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

// Reusable row inside a settings card
function MenuRow({ icon, label, onPress, rightEl, danger }: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void | Promise<void>;
  rightEl?: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <motion.div
      whileTap={{ opacity: 0.7 }}
      onClick={onPress}
      style={{ padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
    >
      <div style={{ color: danger ? 'var(--error)' : 'var(--text-muted)', display: 'flex' }}>{icon}</div>
      <div style={{ flex: 1, fontSize: 14, fontWeight: 500, color: danger ? 'var(--error)' : 'var(--text-primary)' }}>{label}</div>
      {rightEl || <div style={{ color: 'var(--text-muted)' }}><HiChevronRight /></div>}
    </motion.div>
  );
}

function SectionCard({ label, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', paddingLeft: 4, marginBottom: 6 }}>{label}</div>
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: 'var(--border)', marginLeft: 48 }} />;
}

// Dark mode inline toggle
function DarkToggleRow({ isDark, toggleDark }: { isDark: boolean; toggleDark: () => void }) {
  return (
    <div style={{ padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ color: 'var(--text-muted)', display: 'flex' }}>
        {isDark ? <HiMoon /> : <HiSun />}
      </div>
      <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>Dark Mode</div>
      <div
        onClick={toggleDark}
        style={{ width: 48, height: 26, borderRadius: 13, background: isDark ? 'var(--primary)' : 'var(--border)', position: 'relative', cursor: 'pointer', transition: 'background 0.25s ease', flexShrink: 0 }}
      >
        <motion.div
          animate={{ x: isDark ? 24 : 2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          style={{ position: 'absolute', top: 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }}
        />
      </div>
    </div>
  );
}

// Logout confirmation bottom sheet
function LogoutSheet({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ y: 120 }} animate={{ y: 0 }} exit={{ y: 120 }}
        transition={{ type: 'spring', damping: 26, stiffness: 220 }}
        onClick={e => e.stopPropagation()}
        style={{ background: 'var(--bg-surface)', width: '100%', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: '24px 24px 36px' }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 20px' }} />
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.01em' }}>Log out?</div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.5 }}>
          Are you sure you want to log out? Your data is safely saved.
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-outline" style={{ flex: 1 }} onClick={onCancel}>Cancel</button>
          <button
            onClick={onConfirm}
            style={{ flex: 1, background: 'var(--error)', color: '#fff', borderRadius: 14, fontSize: 15, fontWeight: 600, padding: 16, cursor: 'pointer', border: 'none', fontFamily: 'Inter,sans-serif' }}
          >
            Log out
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ProfileScreen() {
  const navigate = useNavigate();
  const { currentUser, logout, isDark, toggleDark, showToast } = useApp();
  const [showLogout, setShowLogout] = useState(false);

  const photo = currentUser ? getUserPhoto(currentUser.userId) : null;
  const isPro = currentUser ? getPurchased(currentUser.userId).length > 0 : false;

  const comingSoon = () => showToast('Coming soon 🚀', 'success');

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)', position: 'relative' }}>
      <div style={{ padding: '20px 20px 10px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em' }}>Profile</h1>
      </div>

      <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '20px', paddingBottom: 96 }}>

        {/* Avatar + identity */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
          <div style={{ position: 'relative', marginBottom: 14 }}>
            {photo ? (
              <img src={photo} alt="avatar" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '2.5px solid var(--primary)' }} />
            ) : (
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#fff', border: '2.5px solid var(--primary)' }}>
                {getInitials(currentUser?.name)}
              </div>
            )}
            <div
              onClick={() => navigate('/profile/edit')}
              style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid var(--bg-dark)' }}
            >
              <HiCamera />
            </div>
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em', marginBottom: 4 }}>{currentUser?.name || 'User'}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>{currentUser?.email}</div>
          {isPro && (
            <div style={{ background: 'rgba(79,70,229,0.12)', color: 'var(--primary-text)', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 8, letterSpacing: '0.06em' }}>
              PRO LEARNER
            </div>
          )}
        </div>

        {/* ACCOUNT */}
        <SectionCard label="Account">
          <MenuRow icon={<HiPencilSquare />} label="Edit Profile" onPress={() => navigate('/profile/edit')} />
          <Divider />
          <MenuRow icon={<HiLockClosed />} label="Change Password" onPress={() => navigate('/profile/password')} />
        </SectionCard>

        {/* LEARNING */}
        <SectionCard label="Learning">
          <MenuRow icon={<HiPaperClip />} label="Submit Assignment" onPress={() => navigate('/profile/assignment')} />
          <Divider />
          <MenuRow icon={<HiAcademicCap />} label="My Certificates" onPress={comingSoon} />
        </SectionCard>

        {/* PREFERENCES */}
        <SectionCard label="Preferences">
          <DarkToggleRow isDark={isDark} toggleDark={toggleDark} />
        </SectionCard>

        {/* SUPPORT */}
        <SectionCard label="Support">
          <MenuRow icon={<HiQuestionMarkCircle />} label="Help & Support" onPress={() => navigate('/profile/support')} />
          <Divider />
          <MenuRow icon={<HiShieldCheck />} label="Privacy Policy" onPress={comingSoon} />
          <Divider />
          <MenuRow icon={<HiStar filled />} label="Rate the App" onPress={comingSoon} />
        </SectionCard>

        {/* Logout */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowLogout(true)}
          style={{ width: '100%', padding: '13px 16px', borderRadius: 14, border: '1.5px solid rgba(239,68,68,0.25)', color: 'rgba(239,68,68,0.85)', fontSize: 14, fontWeight: 600, background: 'rgba(239,68,68,0.04)', fontFamily: 'Inter,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}
        >
          <HiArrowRightOnRectangle /> Log out
        </motion.button>
      </div>

      <AnimatePresence>
        {showLogout && <LogoutSheet onConfirm={logout} onCancel={() => setShowLogout(false)} />}
      </AnimatePresence>

      <Chatbot />
      <BottomNav />
    </div>
  );
}
