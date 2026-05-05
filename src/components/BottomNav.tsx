import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

const HiHome = ({ size = 24 }) => <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/></svg>;
const HiBookOpen = ({ size = 24 }) => <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/></svg>;
const HiUser = ({ size = 24 }) => <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>;

const tabs = [
  { id: 'home', label: 'Home', Icon: HiHome, path: '/home' },
  { id: 'learn', label: 'My Learning', Icon: HiBookOpen, path: '/learn' },
  { id: 'profile', label: 'Profile', Icon: HiUser, path: '/profile' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const activeId = tabs.find(t => location.pathname === t.path)?.id || 'home';

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      background: 'var(--bg-dark)',
      backdropFilter: 'blur(16px)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '10px 0 22px',
      zIndex: 50,
    }}>
      {tabs.map(tab => {
        const isActive = activeId === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            aria-label={tab.label}
            aria-current={isActive ? 'page' : undefined}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              color: isActive ? 'var(--primary-text)' : 'var(--text-muted)',
              flex: 1, position: 'relative', cursor: 'pointer', transition: 'color 0.2s',
              background: 'none', border: 'none', padding: '0', minHeight: 44,
            }}
          >
            <div style={{ position: 'relative' }}>
              <tab.Icon size={24} />
            </div>
            <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, letterSpacing: '0.01em' }}>
              {tab.label}
            </span>
            {isActive && (
              <motion.div
                layoutId="nav-indicator"
                style={{
                  position: 'absolute', top: -11, width: 28, height: 3,
                  background: 'var(--primary)', borderRadius: '0 0 3px 3px',
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
