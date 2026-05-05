import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useProgress, getAllContentIds } from '../hooks/useProgress';
import { useCourses } from '../hooks/useCourses';
import { useCourseStructure } from '../hooks/useCourseStructure';
import { useApp } from '../context/AppContext';
import { findCoursePackage, findContent, getTotalContentCount } from '../data/courses';
import {
  HiArrowLeft, HiPlay, HiPause, HiArrowUturnLeft, HiForward10,
  HiArrowDownTray, HiShare,
  HiVideoCamera, HiMusicalNote, HiDocument, HiPhoto,
} from '../components/Icons';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseSecs(dur) {
  if (!dur) return 60;
  const [m, s] = dur.split(':').map(Number);
  return (m || 0) * 60 + (s || 0);
}
function fmtTime(s) {
  const m = Math.floor(s / 60);
  return `${m}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
}

const lineWidths = [
  ['100%', '85%', '92%', '70%', '88%', '60%'],
  ['95%',  '78%', '100%','65%', '82%', '55%'],
  ['88%',  '100%','72%', '90%', '68%', '75%'],
];

const TYPE_META = {
  video: { label: 'VIDEO', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', Icon: HiVideoCamera },
  audio: { label: 'AUDIO', color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)', Icon: HiMusicalNote },
  pdf:   { label: 'PDF',   color: '#EF4444', bg: 'rgba(239,68,68,0.12)',  Icon: HiDocument },
  image: { label: 'IMAGE', color: '#22C55E', bg: 'rgba(34,197,94,0.12)',  Icon: HiPhoto },
};

// ─── Scrubber ─────────────────────────────────────────────────────────────────
function Scrubber({ elapsed, total, onScrub, color = '#fff' }) {
  const pct = total > 0 ? Math.min((elapsed / total) * 100, 100) : 0;
  return (
    <div style={{ height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, cursor: 'pointer', position: 'relative' }}
      onClick={e => { const r = e.currentTarget.getBoundingClientRect(); onScrub((e.clientX - r.left) / r.width * total); }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2, transition: 'width 0.3s linear' }} />
    </div>
  );
}

// ─── COMPACT VIDEO PLAYER (fixed 220px) ───────────────────────────────────────
function VideoPlayer({ item, pkg, isPlaying, elapsed, totalSecs, onPlayPause, onRewind, onForward, onScrub }) {
  const thumb = item.thumbnail || pkg.thumbnail;
  return (
    <div style={{ height: '100%', position: 'relative', background: '#000', overflow: 'hidden' }}>
      <img src={thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isPlaying ? 0.35 : 0.55 }} />
      {!isPlaying && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.button whileTap={{ scale: 0.9 }} onClick={onPlayPause}
            style={{ width: 54, height: 54, borderRadius: '50%', background: 'rgba(79,70,229,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <HiPlay size={22} />
          </motion.button>
        </div>
      )}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '6px 14px 12px', background: 'linear-gradient(transparent, rgba(0,0,0,0.9))' }}>
        <Scrubber elapsed={elapsed} total={totalSecs} onScrub={onScrub} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>{fmtTime(elapsed)}</span>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <motion.button whileTap={{ scale: 0.88 }} onClick={onRewind} style={{ color: '#fff', padding: 4 }}><HiArrowUturnLeft size={18} /></motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={onPlayPause}
              style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              {isPlaying ? <HiPause size={16} /> : <HiPlay size={16} />}
            </motion.button>
            <motion.button whileTap={{ scale: 0.88 }} onClick={onForward} style={{ color: '#fff', padding: 4 }}><HiForward10 size={18} /></motion.button>
          </div>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>{fmtTime(totalSecs)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── COMPACT AUDIO PLAYER (fixed 220px) ───────────────────────────────────────
function AudioPlayer({ item, pkg, isPlaying, elapsed, totalSecs, onPlayPause, onRewind, onForward, onScrub }) {
  return (
    <div style={{ height: '100%', background: 'linear-gradient(160deg,#1e1b4b 0%,#0f172a 55%,#1a1a2e 100%)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16 }}>
      <motion.div
        animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
        transition={isPlaying ? { repeat: Infinity, duration: 8, ease: 'linear' } : { duration: 0 }}
        style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(139,92,246,0.5)', flexShrink: 0 }}>
        <img src={pkg.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </motion.div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 20, marginBottom: 8 }}>
          {[0.55, 0.9, 0.4, 1, 0.65, 0.75, 0.45].map((h, i) => (
            <motion.div key={i}
              animate={isPlaying ? { scaleY: [h, 1, h * 0.4, 0.85, h] } : { scaleY: h * 0.3 }}
              transition={{ repeat: Infinity, duration: 0.7 + i * 0.09, ease: 'easeInOut' }}
              style={{ width: 3, height: 18, background: '#A78BFA', borderRadius: 2, transformOrigin: 'bottom', opacity: isPlaying ? 1 : 0.3 }} />
          ))}
        </div>
        <Scrubber elapsed={elapsed} total={totalSecs} onScrub={onScrub} color='#A78BFA' />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.45)', margin: '4px 0 8px' }}>
          <span>{fmtTime(elapsed)}</span><span>{fmtTime(totalSecs)}</span>
        </div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', justifyContent: 'center' }}>
          <motion.button whileTap={{ scale: 0.88 }} onClick={onRewind} style={{ color: '#fff', padding: 4 }}><HiArrowUturnLeft size={18} /></motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={onPlayPause}
            style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(139,92,246,0.7)', border: '2px solid rgba(139,92,246,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            {isPlaying ? <HiPause size={18} /> : <HiPlay size={18} />}
          </motion.button>
          <motion.button whileTap={{ scale: 0.88 }} onClick={onForward} style={{ color: '#fff', padding: 4 }}><HiForward10 size={18} /></motion.button>
        </div>
      </div>
    </div>
  );
}


// ─── COMPACT IMAGE VIEWER (fixed 220px) ───────────────────────────────────────
function ImagePlayer({ item, pkg, onShare }) {
  return (
    <div style={{ height: '100%', background: '#000', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img src={item.thumbnail || pkg.thumbnail} alt={item.title}
        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
      <button onClick={onShare} style={{ position: 'absolute', bottom: 10, right: 12, color: 'rgba(255,255,255,0.6)', padding: 4 }}>
        <HiShare size={16} />
      </button>
      <div style={{ position: 'absolute', bottom: 10, left: 12, fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
        Pinch to zoom · {item.size}
      </div>
    </div>
  );
}

// ─── CONTENT INFO ─────────────────────────────────────────────────────────────
function ContentInfo({ item }) {
  const meta = TYPE_META[item.type] || TYPE_META.video;
  return (
    <div style={{ padding: '16px 16px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: meta.color, background: meta.bg, padding: '3px 8px', borderRadius: 6, letterSpacing: '0.05em' }}>
          <meta.Icon size={11} /> {meta.label}
        </span>
        {item.duration && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.duration}</span>}
        {item.size && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.size}</span>}
      </div>
      <h2 style={{ fontSize: 17, fontWeight: 800, marginBottom: 8, lineHeight: 1.3 }}>{item.title}</h2>
      {item.description && <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.65 }}>{item.description}</p>}
    </div>
  );
}

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function ContentPlayerScreen() {
  const { courseId, contentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { courses, isLoading } = useCourses();
  const { showToast } = useApp();

  const course = courses.find(c => String(c.id) === courseId);
  const pkg = course ? findCoursePackage(course.title) : null;
  const { modules } = useCourseStructure(course?.title);
  // Use Airtable modules for content lookup; pkg still provides thumbnail/metadata
  const structPkg = modules.length > 0 ? { ...pkg, modules } : pkg;
  const found = structPkg ? findContent(structPkg, contentId) : null;
  const item = found?.item;
  const totalContent = structPkg ? getTotalContentCount(structPkg) : 0;

  const { completeContent, getModuleStatus } = useProgress(currentUser?.userId, courseId);
  const completedRef = useRef(false);

  // Redirect if parent module is locked
  const parentMod = useMemo(() =>
    modules.find(mod => getAllContentIds(mod).includes(contentId)),
  [modules, contentId]);

  const parentModStatus = useMemo(() => {
    if (!currentUser || !parentMod || modules.length === 0) return null;
    return getModuleStatus(parentMod, modules);
  }, [currentUser, parentMod, modules, getModuleStatus]);

  useEffect(() => {
    if (parentModStatus === 'locked') {
      navigate(`/course/${courseId}/modules`, { replace: true });
    }
  }, [parentModStatus, courseId, navigate]);

  // ── Playback state ─────────────────────────────────────────────────────────
  const totalSecs = item ? parseSecs(item.duration) : 60;
  const [elapsed, setElapsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef(null);
  const pdfScrollRef = useRef(null);

  const PDF_TOTAL_PAGES = 8;

  // Reset on content change
  useEffect(() => {
    setElapsed(0);
    setIsPlaying(false);
    completedRef.current = false;
    clearInterval(intervalRef.current);
  }, [contentId, courseId]);

  const handleComplete = useCallback(() => {
    if (!completedRef.current && currentUser && courseId && contentId) {
      completedRef.current = true;
      completeContent(contentId, totalContent);
      showToast('✓ Lesson complete', 'success');
    }
  }, [currentUser, courseId, contentId, completeContent, totalContent, showToast]);

  // Tick for video/audio
  const tick = useCallback(() => {
    setElapsed(prev => {
      const next = prev + 1;
      if (next >= totalSecs) {
        clearInterval(intervalRef.current);
        setIsPlaying(false);
        handleComplete();
        return totalSecs;
      }
      return next;
    });
  }, [totalSecs, handleComplete]);

  useEffect(() => {
    if ((item?.type === 'video' || item?.type === 'audio') && isPlaying) {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, tick, item?.type]);

  // Auto-complete image on open
  useEffect(() => {
    if (item?.type === 'image') handleComplete();
  }, [item?.type, handleComplete]);

  // PDF scroll-to-complete
  useEffect(() => {
    if (item?.type !== 'pdf') return;
    const container = pdfScrollRef.current;
    if (!container) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollTop + clientHeight >= scrollHeight - 50 && !completedRef.current) {
        completedRef.current = true;
        completeContent(contentId, totalContent);
        showToast('✓ PDF complete', 'success');
      }
    };
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [item?.type, completeContent, contentId, totalContent, showToast]);

  const handleBack = () => {
    const from = location.state?.from;
    if (from) navigate(from);
    else navigate(`/course/${courseId}/modules`);
  };

  if (isLoading && !course) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  if (!course || !item) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', gap: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Content not found</div>
        <button className="btn-outline" style={{ width: 160 }} onClick={() => navigate(-1)}>← Back</button>
      </div>
    );
  }

  const isDark = item.type === 'video' || item.type === 'audio';

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.22 }}
      style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)', position: 'relative', overflow: 'hidden' }}
    >
      {/* ── Top bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px 10px', flexShrink: 0,
        background: isDark ? (item.type === 'audio' ? '#1e1b4b' : '#000') : 'var(--bg-surface)',
        borderBottom: isDark ? 'none' : '1px solid var(--border)',
      }}>
        <button onClick={handleBack} aria-label="Back"
          style={{ color: isDark ? '#fff' : 'var(--text-primary)', padding: 4 }}>
          <HiArrowLeft size={22} />
        </button>
        <div style={{ flex: 1, fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: isDark ? '#fff' : 'var(--text-primary)' }}>
          {item.title}
        </div>
      </div>

      {item.type === 'pdf' ? (
        /* ── PDF: full scrollable page view ── */
        <div ref={pdfScrollRef} className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', paddingBottom: 40 }}>
          {/* Download row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            {item.size && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.size}</span>}
            <button onClick={() => showToast('Download started ↓')} style={{ color: 'var(--text-muted)', padding: 4 }}>
              <HiArrowDownTray size={18} />
            </button>
          </div>

          {/* All pages */}
          {Array.from({ length: PDF_TOTAL_PAGES }).map((_, i) => (
            <div key={i} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Page {i + 1}
              </div>
              {lineWidths[i % 3].map((w, j) => (
                <div key={j} style={{ height: 10, width: w, background: 'var(--border)', borderRadius: 4, marginBottom: 10, opacity: j === 0 ? 0.9 : 0.6 }} />
              ))}
            </div>
          ))}

          {/* Description */}
          {item.description && (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.65, marginTop: 8 }}>{item.description}</p>
          )}
        </div>
      ) : (
        <>
          {/* ── Player area (fixed 220px) ── */}
          <div style={{ height: 220, flexShrink: 0 }}>
            {item.type === 'video' && (
              <VideoPlayer item={item} pkg={pkg} isPlaying={isPlaying} elapsed={elapsed} totalSecs={totalSecs}
                onPlayPause={() => setIsPlaying(p => !p)}
                onRewind={() => setElapsed(e => Math.max(0, e - 10))}
                onForward={() => setElapsed(e => Math.min(totalSecs, e + 10))}
                onScrub={setElapsed} />
            )}
            {item.type === 'audio' && (
              <AudioPlayer item={item} pkg={pkg} isPlaying={isPlaying} elapsed={elapsed} totalSecs={totalSecs}
                onPlayPause={() => setIsPlaying(p => !p)}
                onRewind={() => setElapsed(e => Math.max(0, e - 10))}
                onForward={() => setElapsed(e => Math.min(totalSecs, e + 10))}
                onScrub={setElapsed} />
            )}
            {item.type === 'image' && (
              <ImagePlayer item={item} pkg={pkg} onShare={() => showToast('Shared!')} />
            )}
          </div>

          {/* ── Content info (scrollable) ── */}
          <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingBottom: 24 }}>
            <ContentInfo item={item} />
          </div>
        </>
      )}
    </motion.div>
  );
}
