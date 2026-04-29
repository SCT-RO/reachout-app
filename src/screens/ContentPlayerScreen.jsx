import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useProgress } from '../hooks/useProgress';
import { useCourses } from '../hooks/useCourses';
import { useApp } from '../context/AppContext';
import { findCoursePackage, getAllContent, findContent, getTotalContentCount } from '../data/courses';
import {
  HiArrowLeft, HiPlay, HiPause, HiArrowUturnLeft, HiForward10,
  HiArrowDownTray, HiShare, HiXMark, HiHandThumbUp, HiStar,
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
function getInitials(name = '') {
  const p = name.trim().split(/\s+/);
  return p.length >= 2 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
}

const TYPE_META = {
  video: { label: 'VIDEO', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', Icon: HiVideoCamera },
  audio: { label: 'AUDIO', color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)', Icon: HiMusicalNote },
  pdf:   { label: 'PDF',   color: '#EF4444', bg: 'rgba(239,68,68,0.12)',  Icon: HiDocument },
  image: { label: 'IMAGE', color: '#22C55E', bg: 'rgba(34,197,94,0.12)',  Icon: HiPhoto },
};

const SEED_REVIEWS = [
  { id: 1, name: 'Aarav K.', initials: 'AK', rating: 5, text: 'Explained really clearly — the examples made it click straight away.', likes: 18, time: '2d ago' },
  { id: 2, name: 'Meera S.', initials: 'MS', rating: 4, text: 'Good content. Would love a bit more depth on the advanced topics.', likes: 6, time: '1d ago' },
  { id: 3, name: 'Dev P.',   initials: 'DP', rating: 5, text: 'Best lesson in the whole module. Highly recommend taking notes here!', likes: 31, time: '5h ago' },
];

function reviewsKey(courseId, contentId) {
  return `ro_reviews_${courseId}_${contentId}`;
}
function loadReviews(courseId, contentId) {
  try { return JSON.parse(localStorage.getItem(reviewsKey(courseId, contentId)) || 'null') || SEED_REVIEWS; } catch { return SEED_REVIEWS; }
}
function saveReviews(courseId, contentId, data) {
  try { localStorage.setItem(reviewsKey(courseId, contentId), JSON.stringify(data)); } catch {}
}

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

// ─── Next Up Card ─────────────────────────────────────────────────────────────
function NextUpCard({ next, courseId, onDismiss, navigate }) {
  const [cd, setCd] = useState(5);
  useEffect(() => {
    if (cd <= 0) { navigate(`/course/${courseId}/content/${next.id}`); return; }
    const t = setTimeout(() => setCd(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cd, next, courseId, navigate]);

  return (
    <motion.div
      initial={{ y: 160 }} animate={{ y: 0 }} exit={{ y: 160 }}
      transition={{ type: 'spring', damping: 28, stiffness: 220 }}
      style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--bg-surface)', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: '18px 20px 28px', border: '1px solid var(--border)', zIndex: 300 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Up Next</div>
        <button onClick={onDismiss} style={{ color: 'var(--text-muted)', padding: 2 }}><HiXMark size={16} /></button>
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--text-primary)' }}>{next.title}</div>
      <div style={{ display: 'flex', gap: 10 }}>
        <motion.button whileTap={{ scale: 0.97 }} className="btn-primary"
          style={{ flex: 1, fontSize: 13, minHeight: 'unset', padding: '10px 0' }}
          onClick={() => navigate(`/course/${courseId}/content/${next.id}`)}>
          Play Now
        </motion.button>
        <div style={{ width: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 10 }}>{cd}s</div>
      </div>
    </motion.div>
  );
}

// ─── COMPACT VIDEO PLAYER (fixed 220px) ───────────────────────────────────────
function VideoPlayer({ item, pkg, isPlaying, elapsed, totalSecs, onPlayPause, onRewind, onForward, onScrub }) {
  const thumb = item.thumbnail || pkg.thumbnail;
  return (
    <div style={{ height: '100%', position: 'relative', background: '#000', overflow: 'hidden' }}>
      <img src={thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isPlaying ? 0.35 : 0.55 }} />
      {/* Center play */}
      {!isPlaying && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.button whileTap={{ scale: 0.9 }} onClick={onPlayPause}
            style={{ width: 54, height: 54, borderRadius: '50%', background: 'rgba(79,70,229,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <HiPlay size={22} />
          </motion.button>
        </div>
      )}
      {/* Bottom controls */}
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
      {/* Artwork */}
      <motion.div
        animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
        transition={isPlaying ? { repeat: Infinity, duration: 8, ease: 'linear' } : { duration: 0 }}
        style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(139,92,246,0.5)', flexShrink: 0 }}>
        <img src={pkg.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </motion.div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Equalizer */}
        <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 20, marginBottom: 8 }}>
          {[0.55, 0.9, 0.4, 1, 0.65, 0.75, 0.45].map((h, i) => (
            <motion.div key={i}
              animate={isPlaying ? { scaleY: [h, 1, h * 0.4, 0.85, h] } : { scaleY: h * 0.3 }}
              transition={{ repeat: Infinity, duration: 0.7 + i * 0.09, ease: 'easeInOut' }}
              style={{ width: 3, height: 18, background: '#A78BFA', borderRadius: 2, transformOrigin: 'bottom', opacity: isPlaying ? 1 : 0.3 }} />
          ))}
        </div>
        {/* Scrubber */}
        <Scrubber elapsed={elapsed} total={totalSecs} onScrub={onScrub} color='#A78BFA' />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.45)', margin: '4px 0 8px' }}>
          <span>{fmtTime(elapsed)}</span><span>{fmtTime(totalSecs)}</span>
        </div>
        {/* Controls */}
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

// ─── COMPACT PDF PLAYER (fixed 220px) ─────────────────────────────────────────
function PdfPlayer({ item, page, totalPages, onNext, onPrev, onDownload }) {
  const lineWidths = [90, 70, 85, 60, 95, 75, 55, 80];
  return (
    <div style={{ height: '100%', background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', borderBottom: '1px solid var(--border)' }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px 6px', flexShrink: 0 }}>
        <span style={{ fontSize: 11, background: 'rgba(239,68,68,0.1)', color: '#F87171', padding: '2px 8px', borderRadius: 5, fontWeight: 600 }}>
          Page {page} of {totalPages}
        </span>
        <button onClick={onDownload} style={{ color: 'var(--text-muted)', padding: 4 }}><HiArrowDownTray size={16} /></button>
      </div>
      {/* Skeleton page */}
      <motion.div key={page} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15 }}
        style={{ flex: 1, margin: '0 14px', background: 'var(--bg-dark)', borderRadius: 8, padding: '10px 12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
        <div style={{ height: 10, background: 'var(--border)', borderRadius: 3, width: '55%', marginBottom: 10, opacity: 0.8 }} />
        {lineWidths.map((w, i) => (
          <div key={i} style={{ height: 7, background: 'var(--border)', borderRadius: 2, width: `${w}%`, marginBottom: 7, opacity: 0.5 + (i % 2) * 0.15 }} />
        ))}
      </motion.div>
      {/* Navigation */}
      <div style={{ display: 'flex', gap: 8, padding: '8px 14px 10px', flexShrink: 0 }}>
        <motion.button whileTap={{ scale: 0.96 }} className="btn-outline"
          style={{ flex: 1, fontSize: 12, minHeight: 'unset', padding: '7px 0', opacity: page === 1 ? 0.4 : 1 }}
          onClick={onPrev} disabled={page === 1}>← Prev</motion.button>
        <motion.button whileTap={{ scale: 0.96 }} className="btn-primary"
          style={{ flex: 1, fontSize: 12, minHeight: 'unset', padding: '7px 0' }}
          onClick={onNext}>{page < totalPages ? 'Next →' : '✓ Done'}</motion.button>
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

// ─── REVIEWS TAB ──────────────────────────────────────────────────────────────
function ReviewsTab({ reviews, likedReviews, onLike, reviewText, setReviewText, rating, setRating, onSubmit, currentUser }) {
  return (
    <div>
      {/* ── Write Review (always at top) ── */}
      <div style={{ padding: '16px 16px 14px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>
          Write a Review
        </div>

        {/* Star picker */}
        <div style={{ display: 'flex', gap: 2, marginBottom: 10 }}>
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => setRating(star)}
              aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
              style={{ fontSize: 24, color: star <= rating ? '#F59E0B' : 'var(--border)', padding: '0 2px', lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.15s' }}
            >
              ★
            </button>
          ))}
          {rating > 0 && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)', alignSelf: 'center', marginLeft: 6 }}>
              {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
            </span>
          )}
        </div>

        {/* Text + Post */}
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {getInitials(currentUser?.name || 'Y')}
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <textarea
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) onSubmit(); }}
              placeholder="Share what you found helpful or what could be better…"
              rows={2}
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '9px 12px', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'Inter,sans-serif', resize: 'none', outline: 'none', width: '100%', boxSizing: 'border-box' }}
            />
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onSubmit}
              disabled={!reviewText.trim() || rating === 0}
              style={{ alignSelf: 'flex-end', background: reviewText.trim() && rating > 0 ? 'var(--primary)' : 'var(--border)', color: '#fff', border: 'none', borderRadius: 10, padding: '7px 18px', fontSize: 13, fontWeight: 600, fontFamily: 'Inter,sans-serif', cursor: reviewText.trim() && rating > 0 ? 'pointer' : 'default', transition: 'background 0.2s' }}
            >
              Post Review
            </motion.button>
          </div>
        </div>
      </div>

      {/* ── Reviews list ── */}
      <div style={{ padding: '10px 16px 4px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
        {reviews.length} Review{reviews.length !== 1 ? 's' : ''}
      </div>

      {reviews.map(review => (
        <div key={review.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {review.initials}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{review.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{review.time}</span>
                </div>
                {/* Star display */}
                <div style={{ display: 'flex', gap: 1 }}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <span key={s} style={{ fontSize: 11, color: s <= review.rating ? '#F59E0B' : 'var(--border)' }}>★</span>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.55 }}>{review.text}</div>
            </div>
          </div>

          <div style={{ marginLeft: 46, marginTop: 6 }}>
            <button
              onClick={() => onLike(review.id)}
              aria-pressed={likedReviews.has(review.id)}
              aria-label={`${likedReviews.has(review.id) ? 'Unlike' : 'Like'} review by ${review.name}`}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: likedReviews.has(review.id) ? 'var(--primary-text)' : 'var(--text-muted)', fontFamily: 'Inter,sans-serif', padding: '4px 0', minHeight: 32 }}
            >
              <HiHandThumbUp size={13} />
              <span>{review.likes + (likedReviews.has(review.id) ? 1 : 0)}</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── CONTENT INFO TAB ─────────────────────────────────────────────────────────
function ContentInfoTab({ item, pkg, nextItem, courseId, navigate }) {
  const meta = TYPE_META[item.type] || TYPE_META.video;
  return (
    <div style={{ padding: '16px 16px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: meta.color, background: meta.bg, padding: '3px 8px', borderRadius: 6, letterSpacing: '0.05em' }}>
          <meta.Icon size={11} /> {meta.label}
        </span>
        {item.duration && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.duration}</span>}
        {item.size && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.size}</span>}
        {item.isPreview && (
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--warning)', background: 'rgba(245,158,11,0.12)', padding: '2px 7px', borderRadius: 5 }}>FREE PREVIEW</span>
        )}
      </div>

      <h2 style={{ fontSize: 17, fontWeight: 800, marginBottom: 8, lineHeight: 1.3 }}>{item.title}</h2>
      {item.description && <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.65 }}>{item.description}</p>}

      {nextItem && (
        <div style={{ marginTop: 20, padding: '14px', background: 'var(--bg-surface)', borderRadius: 14, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Up Next</div>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>{nextItem.title}</div>
          <motion.button whileTap={{ scale: 0.97 }} className="btn-primary"
            style={{ width: '100%', fontSize: 13, minHeight: 'unset', padding: '10px 0' }}
            onClick={() => navigate(`/course/${courseId}/content/${nextItem.id}`)}>
            Play Next →
          </motion.button>
        </div>
      )}
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
  const found = pkg ? findContent(pkg, contentId) : null;
  const item = found?.item;

  const allContent = pkg ? getAllContent(pkg) : [];
  const nextItem = item ? allContent[allContent.findIndex(c => c.id === item.id) + 1] || null : null;
  const totalContent = pkg ? getTotalContentCount(pkg) : 0;

  const { completeContent } = useProgress(currentUser?.userId, courseId);
  const completedRef = useRef(false);

  // ── Playback state ─────────────────────────────────────────────────────────
  const totalSecs = item ? parseSecs(item.duration) : 60;
  const [elapsed, setElapsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef(null);
  const [showNext, setShowNext] = useState(false);

  // PDF state
  const PDF_TOTAL_PAGES = 8;
  const [pdfPage, setPdfPage] = useState(1);

  // Tabs
  const [activeTab, setActiveTab] = useState('info');

  // Reviews
  const [reviews, setReviews] = useState(() => loadReviews(courseId, contentId));
  const [likedReviews, setLikedReviews] = useState(new Set());
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);

  // Reset on content change
  useEffect(() => {
    setElapsed(0);
    setIsPlaying(false);
    completedRef.current = false;
    setPdfPage(1);
    setShowNext(false);
    clearInterval(intervalRef.current);
    setReviews(loadReviews(courseId, contentId));
    setLikedReviews(new Set());
    setReviewText('');
    setRating(0);
  }, [contentId, courseId]);

  const handleComplete = useCallback(() => {
    if (!completedRef.current && currentUser && courseId && contentId) {
      completedRef.current = true;
      completeContent(contentId, totalContent);
      showToast('Content complete! 🎉', 'success');
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
        if (nextItem) setShowNext(true);
        return totalSecs;
      }
      return next;
    });
  }, [totalSecs, handleComplete, nextItem]);

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

  // PDF page navigation
  const handlePdfNext = () => {
    if (pdfPage < PDF_TOTAL_PAGES) {
      setPdfPage(p => p + 1);
    } else {
      handleComplete();
      if (nextItem) setShowNext(true);
    }
  };

  // Post review
  const handlePostReview = () => {
    if (!reviewText.trim() || rating === 0) return;
    const newReview = {
      id: Date.now(),
      name: currentUser?.name || 'You',
      initials: getInitials(currentUser?.name || 'You'),
      rating,
      text: reviewText.trim(),
      likes: 0,
      time: 'Just now',
    };
    const updated = [newReview, ...reviews];
    setReviews(updated);
    saveReviews(courseId, contentId, updated);
    showToast('Review posted!', 'success');
    setReviewText('');
    setRating(0);
  };

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

  if (!course || !pkg || !item) {
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
        {item.type === 'pdf' && (
          <PdfPlayer item={item} page={pdfPage} totalPages={PDF_TOTAL_PAGES}
            onNext={handlePdfNext}
            onPrev={() => setPdfPage(p => Math.max(1, p - 1))}
            onDownload={() => showToast('Download started ↓')} />
        )}
        {item.type === 'image' && (
          <ImagePlayer item={item} pkg={pkg} onShare={() => showToast('Shared!')} />
        )}
      </div>

      {/* ── Tab bar ── */}
      <div role="tablist" style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0, background: 'var(--bg-surface)' }}>
        {[
          { key: 'info', label: 'Content' },
          { key: 'reviews', label: 'Reviews', badge: reviews.length },
        ].map(tab => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{ flex: 1, padding: '12px 0', fontSize: 13, fontWeight: 600, background: 'none', border: 'none', color: activeTab === tab.key ? 'var(--primary-text)' : 'var(--text-muted)', cursor: 'pointer', position: 'relative', fontFamily: 'Inter,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            {tab.label}
            {tab.badge > 0 && (
              <span style={{ fontSize: 10, background: 'var(--primary)', color: '#fff', borderRadius: 8, padding: '1px 6px', fontWeight: 700 }}>{tab.badge}</span>
            )}
            {activeTab === tab.key && (
              <motion.div layoutId="cp-tab-indicator" style={{ position: 'absolute', bottom: 0, left: '15%', right: '15%', height: 2, background: 'var(--primary)', borderRadius: 2 }} />
            )}
          </button>
        ))}
      </div>

      {/* ── Tab content (scrollable) ── */}
      <div role="tabpanel" className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingBottom: 24 }}>
        <AnimatePresence mode="wait" initial={false}>
          {activeTab === 'info' ? (
            <motion.div key="info" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <ContentInfoTab item={item} pkg={pkg} nextItem={nextItem} courseId={courseId} navigate={navigate} />
            </motion.div>
          ) : (
            <motion.div key="reviews" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <ReviewsTab
                reviews={reviews}
                likedReviews={likedReviews}
                onLike={id => setLikedReviews(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; })}
                reviewText={reviewText}
                setReviewText={setReviewText}
                rating={rating}
                setRating={setRating}
                onSubmit={handlePostReview}
                currentUser={currentUser}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Next Up overlay ── */}
      <AnimatePresence>
        {showNext && nextItem && (
          <NextUpCard next={nextItem} courseId={courseId} navigate={navigate} onDismiss={() => setShowNext(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
