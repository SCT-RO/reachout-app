import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useCourses } from '../hooks/useCourses';
import { useProgress } from '../hooks/useProgress';
import { getPurchased } from '../utils/storage';
import {
  HiArrowLeft, HiPlay, HiPause, HiCheck, HiLockClosed,
  HiEllipsisVertical, HiArrowDownTray, HiShare, HiFlag,
  HiArrowUturnLeft, HiArrowsPointingOut, HiArrowsPointingIn,
  HiHandThumbUp, HiChatBubbleLeft, HiXMark,
  HiVideoCamera, HiMusicalNote, HiDocument, HiPhoto,
} from '../components/Icons';

const TOTAL_SIM_SECS = 20;

const MEDIA_META = {
  video: { label: 'VIDEO', color: '#60A5FA', bg: 'rgba(96,165,250,0.12)', Icon: HiVideoCamera },
  audio: { label: 'AUDIO', color: '#A78BFA', bg: 'rgba(167,139,250,0.12)', Icon: HiMusicalNote },
  pdf:   { label: 'PDF',   color: '#F87171', bg: 'rgba(248,113,113,0.12)', Icon: HiDocument },
  image: { label: 'IMAGE', color: '#34D399', bg: 'rgba(52,211,153,0.12)', Icon: HiPhoto },
};

const INITIAL_COMMENTS = [
  { id: 1, name: 'Aarav K.', initials: 'AK', text: 'This explanation is crystal clear! The analogy really helped me understand the concept.', likes: 24, time: '2d ago' },
  { id: 2, name: 'Meera S.', initials: 'MS', text: "Can someone explain how this differs from the previous lesson? I'm getting a bit confused.", likes: 8, time: '1d ago' },
  { id: 3, name: 'Dev P.',   initials: 'DP', text: 'Pro tip: pause and take notes here. This section comes up in the quiz!', likes: 41, time: '5h ago' },
  { id: 4, name: 'Riya T.',  initials: 'RT', text: "Amazing course overall. The instructor's pacing is perfect for beginners.", likes: 17, time: '2h ago' },
];

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

// ─── Media type badge ──────────────────────────────────────────────────────────
function MediaBadge({ type }) {
  const meta = MEDIA_META[type] || MEDIA_META.video;
  const { Icon, label, color, bg } = meta;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 9, fontWeight: 700, color, background: bg, padding: '2px 6px 2px 5px', borderRadius: 5, letterSpacing: '0.04em', verticalAlign: 'middle' }}>
      <Icon size={10} /> {label}
    </span>
  );
}

// ─── Audio player area ─────────────────────────────────────────────────────────
function AudioPlayerArea({ lesson, isPlaying, elapsed, onPlayPause, onRewind, progressPct, onScrubberClick, setElapsed }) {
  return (
    <div style={{ position: 'relative', height: '100%', background: 'linear-gradient(160deg, #1e1b4b 0%, #0f172a 60%, #1a1a2e 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
      {/* Lesson info */}
      <div style={{ position: 'absolute', top: 12, left: 16, right: 16 }}>
        <div style={{ fontSize: 10, color: 'rgba(167,139,250,0.8)', marginBottom: 3, fontWeight: 600, letterSpacing: '0.05em' }}>🎧 AUDIO LESSON</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', lineHeight: 1.3, textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}>{lesson?.title}</div>
      </div>

      {/* Music icon + equalizer */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, marginTop: 8 }}>
        <motion.div
          animate={isPlaying ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          style={{ width: 70, height: 70, borderRadius: '50%', background: 'rgba(167,139,250,0.2)', border: '2px solid rgba(167,139,250,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A78BFA' }}
        >
          <HiMusicalNote size={32} />
        </motion.div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 28 }}>
          {[0.55, 0.9, 0.4, 1, 0.65, 0.75, 0.45].map((h, i) => (
            <motion.div
              key={i}
              animate={isPlaying ? { scaleY: [h, 1, h * 0.4, 0.85, h] } : { scaleY: h * 0.4 }}
              transition={{ repeat: Infinity, duration: 0.7 + i * 0.09, ease: 'easeInOut' }}
              style={{ width: 3, height: 28, background: '#A78BFA', borderRadius: 2, transformOrigin: 'bottom', opacity: isPlaying ? 1 : 0.35 }}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '6px 16px 10px', background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 10 }}>
          <button onClick={onRewind} aria-label="Rewind 10 seconds" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HiArrowUturnLeft size={18} />
          </button>
          <button onClick={onPlayPause} aria-label={isPlaying ? 'Pause' : 'Play'} style={{ background: 'rgba(167,139,250,0.85)', border: 'none', color: '#fff', cursor: 'pointer', width: 54, height: 54, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(167,139,250,0.45)' }}>
            {isPlaying ? <HiPause size={24} /> : <HiPlay size={24} />}
          </button>
          <div style={{ width: 40 }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', minWidth: 30, textAlign: 'right' }}>{formatTime(elapsed)}</span>
          <div
            role="slider" aria-label="Audio progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progressPct)}
            tabIndex={0} onClick={onScrubberClick}
            onKeyDown={e => { if (e.key === 'ArrowRight') setElapsed(p => Math.min(p + 1, TOTAL_SIM_SECS)); if (e.key === 'ArrowLeft') setElapsed(p => Math.max(p - 1, 0)); }}
            style={{ flex: 1, height: 20, display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, position: 'relative' }}>
              <div style={{ height: '100%', width: `${progressPct}%`, background: '#A78BFA', borderRadius: 2, transition: 'width 0.1s linear' }} />
              <div style={{ position: 'absolute', top: '50%', left: `${progressPct}%`, transform: 'translate(-50%, -50%)', width: 14, height: 14, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }} />
            </div>
          </div>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', minWidth: 36 }}>{lesson?.duration}</span>
        </div>
      </div>
    </div>
  );
}

// ─── PDF viewer modal ──────────────────────────────────────────────────────────
function PDFModal({ lesson, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'absolute', inset: 0, background: 'var(--bg-dark)', zIndex: 300, display: 'flex', flexDirection: 'column' }}
    >
      {/* Header */}
      <div style={{ padding: '12px 8px 12px 4px', display: 'flex', alignItems: 'center', gap: 4, borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', flexShrink: 0 }}>
        <button onClick={onClose} aria-label="Close PDF" style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10 }}>
          <HiXMark size={22} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lesson.title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <MediaBadge type="pdf" />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lesson.pages} pages</span>
            <span style={{ fontSize: 11, color: '#F87171', fontWeight: 600 }}>{lesson.readTime}</span>
          </div>
        </div>
        <button aria-label="Download PDF" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10 }}>
          <HiArrowDownTray size={20} />
        </button>
      </div>

      {/* PDF preview pages */}
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 32px' }}>
        {Array.from({ length: Math.min(lesson.pages || 10, 6) }).map((_, pageIdx) => (
          <div key={pageIdx} style={{ background: '#fff', borderRadius: 8, marginBottom: 16, padding: '20px 18px', boxShadow: '0 2px 12px rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, borderBottom: '1px solid #e5e7eb', paddingBottom: 8 }}>
              <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600 }}>{lesson.title.toUpperCase().slice(0, 22)}</div>
              <div style={{ fontSize: 10, color: '#9ca3af' }}>{pageIdx + 1}</div>
            </div>
            {pageIdx === 0 && (
              <div style={{ fontSize: 16, fontWeight: 800, color: '#111827', marginBottom: 12, lineHeight: 1.3 }}>{lesson.title}</div>
            )}
            {Array.from({ length: pageIdx === 0 ? 5 : 8 }).map((_, lineIdx) => (
              <div key={lineIdx} style={{ height: 10, borderRadius: 3, background: lineIdx % 5 === 4 ? '#f3f4f6' : '#e5e7eb', marginBottom: 8, width: lineIdx % 3 === 2 ? '70%' : '100%' }} />
            ))}
            {pageIdx % 2 === 1 && (
              <div style={{ height: 80, borderRadius: 6, background: 'linear-gradient(135deg, #dbeafe, #ede9fe)', marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 9, color: '#6b7280', fontWeight: 600 }}>[ DIAGRAM / CHART ]</div>
              </div>
            )}
          </div>
        ))}
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, padding: '8px 0 16px' }}>
          Showing preview — {lesson.pages} pages total
        </div>
      </div>
    </motion.div>
  );
}

// ─── Image viewer modal ────────────────────────────────────────────────────────
function ImageModal({ lesson, courseImage, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'absolute', inset: 0, background: '#000', zIndex: 300, display: 'flex', flexDirection: 'column' }}
    >
      {/* Header */}
      <div style={{ padding: '12px 8px 12px 4px', display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,0.6)', flexShrink: 0, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
        <button onClick={onClose} aria-label="Close image" style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', cursor: 'pointer', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10 }}>
          <HiXMark size={22} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lesson.title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <MediaBadge type="image" />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>Tap to zoom • Swipe to close</span>
          </div>
        </div>
        <button aria-label="Share image" style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', cursor: 'pointer', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10 }}>
          <HiShare size={18} />
        </button>
      </div>

      {/* Image */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '72px 0 40px' }}>
        <motion.img
          initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 22, stiffness: 200 }}
          src={courseImage}
          alt={lesson.title}
          style={{ width: '100%', maxHeight: '100%', objectFit: 'contain' }}
          crossOrigin="anonymous"
        />
      </div>

      {/* Caption */}
      <div style={{ padding: '12px 20px 32px', background: 'linear-gradient(transparent, rgba(0,0,0,0.85))', position: 'absolute', bottom: 0, left: 0, right: 0, textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>{lesson.title}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>Reference diagram for this lesson</div>
      </div>
    </motion.div>
  );
}

// ─── Contents tab ──────────────────────────────────────────────────────────────
function ContentsTab({ curriculum, lessonIdx, isLessonCompleted, isLessonLocked, onSelectLesson, onQuiz }) {
  return (
    <div>
      <div style={{ padding: '14px 16px 6px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Course Lessons
      </div>

      {curriculum.map((lesson, idx) => {
        const playing = idx === lessonIdx;
        const completed = isLessonCompleted(lesson.id);
        const locked = isLessonLocked(idx);
        const meta = MEDIA_META[lesson.type] || MEDIA_META.video;

        return (
          <motion.button
            key={lesson.id}
            whileTap={{ opacity: 0.7 }}
            onClick={() => onSelectLesson(idx)}
            aria-label={`Lesson ${idx + 1}: ${lesson.title}, ${meta.label}${completed ? ', completed' : ''}${locked ? ', locked' : playing ? ', now playing' : ''}`}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 16px',
              background: playing ? 'rgba(79,70,229,0.08)' : 'transparent',
              border: 'none', borderLeft: `3px solid ${playing ? 'var(--primary)' : 'transparent'}`,
              cursor: 'pointer', textAlign: 'left', fontFamily: 'Inter,sans-serif',
              color: 'var(--text-primary)',
            }}
          >
            {/* Status circle */}
            <div style={{
              width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: playing ? 'var(--primary)' : completed ? 'rgba(34,197,94,0.15)' : `${meta.bg}`,
              color: playing ? '#fff' : completed ? 'var(--success-text)' : locked ? 'var(--text-muted)' : meta.color,
              border: `1.5px solid ${playing ? 'transparent' : completed ? 'rgba(34,197,94,0.3)' : `${meta.color}30`}`,
            }}>
              {playing
                ? <HiPlay size={14} />
                : completed
                  ? <HiCheck size={16} />
                  : locked
                    ? <HiLockClosed size={14} />
                    : <meta.Icon size={14} />}
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 13, fontWeight: playing ? 700 : 500, lineHeight: 1.3, marginBottom: 3,
                color: locked ? 'var(--text-muted)' : playing ? 'var(--primary-text)' : 'var(--text-primary)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {lesson.title}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lesson.duration}</span>
                <MediaBadge type={lesson.type} />
                {lesson.readTime && <span style={{ fontSize: 10, color: '#F87171', fontWeight: 500 }}>{lesson.readTime}</span>}
              </div>
            </div>

            {locked && (
              <div style={{ fontSize: 10, color: 'var(--text-muted)', background: 'var(--bg-dark)', padding: '3px 8px', borderRadius: 6, border: '1px solid var(--border)', flexShrink: 0 }}>
                PRO
              </div>
            )}
          </motion.button>
        );
      })}

      <div style={{ margin: '16px 16px 0', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onQuiz}
          style={{ width: '100%', padding: 14, borderRadius: 14, border: '1.5px solid var(--primary)', color: 'var(--primary-text)', fontSize: 14, fontWeight: 600, background: 'rgba(79,70,229,0.06)', fontFamily: 'Inter,sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          📝 Take Quiz
        </motion.button>
      </div>
    </div>
  );
}

// ─── Comments tab ──────────────────────────────────────────────────────────────
function CommentsTab({ comments, likedComments, onLike, onReply, commentText, setCommentText, onSubmitComment }) {
  return (
    <div>
      <div style={{ padding: '14px 16px 6px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {comments.length} Comment{comments.length !== 1 ? 's' : ''}
      </div>

      {comments.map(comment => (
        <div key={comment.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {comment.initials}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 3 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{comment.name}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{comment.time}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.55 }}>{comment.text}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 4, marginLeft: 46 }}>
            <button
              onClick={() => onLike(comment.id)}
              aria-pressed={likedComments.has(comment.id)}
              aria-label={`${likedComments.has(comment.id) ? 'Unlike' : 'Like'} comment by ${comment.name}`}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: likedComments.has(comment.id) ? 'var(--primary-text)' : 'var(--text-muted)', fontFamily: 'Inter,sans-serif', padding: '6px 10px 6px 0', minHeight: 36 }}
            >
              <HiHandThumbUp size={14} />
              <span>{comment.likes + (likedComments.has(comment.id) ? 1 : 0)}</span>
            </button>
            <button
              onClick={() => onReply(comment)}
              aria-label={`Reply to ${comment.name}`}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Inter,sans-serif', padding: '6px 10px', minHeight: 36 }}
            >
              <HiChatBubbleLeft size={14} />
              <span>Reply</span>
            </button>
          </div>
        </div>
      ))}

      {/* Add comment */}
      <div style={{ padding: '16px 16px 8px' }}>
        <label htmlFor="lesson-comment" style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
          Add a Comment
        </label>
        <div style={{ display: 'flex', gap: 10 }}>
          <textarea
            id="lesson-comment"
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) onSubmitComment(); }}
            placeholder="Share your thoughts or ask a question…"
            rows={2}
            style={{ flex: 1, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 12px', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'Inter,sans-serif', resize: 'none', outline: 'none' }}
          />
          <button
            onClick={onSubmitComment}
            disabled={!commentText.trim()}
            aria-label="Post comment"
            style={{ background: commentText.trim() ? 'var(--primary)' : 'var(--border)', border: 'none', borderRadius: 12, color: '#fff', cursor: commentText.trim() ? 'pointer' : 'default', padding: '0 16px', fontSize: 13, fontWeight: 600, fontFamily: 'Inter,sans-serif', flexShrink: 0, minHeight: 44, transition: 'background 0.2s' }}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── 3-dot menu sheet ──────────────────────────────────────────────────────────
function MenuSheet({ onClose, onDownload, onShare, onReport }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 120 }} animate={{ y: 0 }} exit={{ y: 120 }}
        transition={{ type: 'spring', damping: 26, stiffness: 220 }}
        role="dialog" aria-modal="true" aria-label="Lesson options"
        onClick={e => e.stopPropagation()}
        style={{ background: 'var(--bg-surface)', width: '100%', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: '16px 24px 40px' }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 16px' }} />
        {[
          { icon: <HiArrowDownTray />, label: 'Download Lesson', action: onDownload },
          { icon: <HiShare />, label: 'Share Course', action: onShare },
          { icon: <HiFlag />, label: 'Report an Issue', action: onReport },
        ].map(({ icon, label, action }) => (
          <button key={label} onClick={action} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', background: 'none', border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-primary)', fontSize: 15, fontFamily: 'Inter,sans-serif', textAlign: 'left' }}>
            <span style={{ color: 'var(--text-muted)', display: 'flex' }}>{icon}</span>
            {label}
          </button>
        ))}
      </motion.div>
    </motion.div>
  );
}

// ─── Course complete sheet ─────────────────────────────────────────────────────
function CourseCompleteSheet({ courseTitle, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        role="dialog" aria-modal="true" aria-labelledby="course-complete-title"
        style={{ background: 'var(--bg-surface)', borderRadius: 24, padding: 32, width: '100%', textAlign: 'center', border: '1px solid var(--border)' }}
      >
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎓</div>
        <div id="course-complete-title" style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.01em', marginBottom: 8 }}>Course Complete!</div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28, lineHeight: 1.65 }}>
          You've finished <strong style={{ color: 'var(--text-primary)' }}>{courseTitle}</strong>. Your certificate is being prepared!
        </div>
        <button onClick={onClose} style={{ width: '100%', background: 'var(--primary)', color: '#fff', borderRadius: 14, fontSize: 15, fontWeight: 600, padding: 16, cursor: 'pointer', border: 'none', fontFamily: 'Inter,sans-serif' }}>
          View Certificate 🏆
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── Main screen ───────────────────────────────────────────────────────────────
export default function LessonPlayerScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, showToast } = useApp();
  const { courses } = useCourses();

  const course = courses.find(c => String(c.id) === String(id));
  const curriculum = course?.curriculum || [];

  const { progress, completeLesson } = useProgress(currentUser?.userId, id);

  const isPurchased = currentUser
    ? getPurchased(currentUser.userId).some(p => String(p) === String(id)) || course?.price === 0
    : false;

  const firstIncomplete = curriculum.findIndex(l => !progress.lessonsCompleted.includes(l.id));
  const defaultIdx = firstIncomplete === -1 ? 0 : firstIncomplete;

  const [lessonIdx, setLessonIdx] = useState(defaultIdx);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [activeTab, setActiveTab] = useState('contents');
  const [showMenu, setShowMenu] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [openPDF, setOpenPDF] = useState(null);
  const [openImage, setOpenImage] = useState(null);
  const [likedComments, setLikedComments] = useState(new Set());
  const [comments, setComments] = useState(INITIAL_COMMENTS);
  const [commentText, setCommentText] = useState('');

  const intervalRef = useRef(null);
  const completionFiredRef = useRef(false);
  const currentLesson = curriculum[lessonIdx];
  const lessonType = currentLesson?.type || 'video';

  // Reset on lesson change
  useEffect(() => {
    setElapsed(0);
    setIsPlaying(false);
    completionFiredRef.current = false;
    clearInterval(intervalRef.current);
  }, [lessonIdx]);

  // Playback interval
  useEffect(() => {
    if (!isPlaying) { clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      setElapsed(prev => Math.min(prev + 0.5, TOTAL_SIM_SECS));
    }, 500);
    return () => clearInterval(intervalRef.current);
  }, [isPlaying]);

  // Detect lesson end
  useEffect(() => {
    if (elapsed < TOTAL_SIM_SECS || completionFiredRef.current || !currentLesson) return;
    completionFiredRef.current = true;
    setIsPlaying(false);
    completeLesson(currentLesson.id, curriculum.length);
    showToast('Lesson complete! 🎉', 'success');
    const nextIdx = lessonIdx + 1;
    const timer = nextIdx >= curriculum.length
      ? setTimeout(() => setShowComplete(true), 1500)
      : setTimeout(() => setLessonIdx(nextIdx), 2500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed]);

  const handleScrubberClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setElapsed(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * TOTAL_SIM_SECS);
  };

  const handleRewind = () => setElapsed(prev => Math.max(0, prev - 2));
  const progressPct = (elapsed / TOTAL_SIM_SECS) * 100;

  const isLessonLocked = (idx) => !isPurchased && course?.price !== 0 && idx >= 2;
  const isLessonCompleted = (lessonId) => progress.lessonsCompleted.includes(lessonId);

  const handleSelectLesson = (idx) => {
    if (isLessonLocked(idx)) { showToast('Purchase this course to unlock all lessons', 'error'); return; }
    const lesson = curriculum[idx];
    if (lesson.type === 'pdf') { setOpenPDF(lesson); return; }
    if (lesson.type === 'image') { setOpenImage(lesson); return; }
    setLessonIdx(idx);
  };

  const handlePostComment = () => {
    if (!commentText.trim()) return;
    const newComment = {
      id: Date.now(),
      name: currentUser?.name || 'You',
      initials: getInitials(currentUser?.name || 'You'),
      text: commentText.trim(),
      likes: 0,
      time: 'Just now',
    };
    setComments(prev => [...prev, newComment]);
    showToast('Comment posted!', 'success');
    setCommentText('');
  };

  if (!course) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}>
        <div style={{ color: 'var(--text-muted)' }}>Course not found.</div>
      </div>
    );
  }

  // ── Fullscreen layout ────────────────────────────────────────────────────────
  if (isFullscreen) {
    return (
      <div style={{ height: '100%', width: '100%', background: '#000', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        {/* Exit fullscreen button */}
        <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}>
          <button
            onClick={() => setIsFullscreen(false)}
            aria-label="Exit fullscreen"
            style={{ background: 'rgba(0,0,0,0.55)', border: 'none', color: '#fff', cursor: 'pointer', width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <HiArrowsPointingIn size={20} />
          </button>
        </div>

        {/* Lesson overlay info */}
        <div style={{ position: 'absolute', top: 14, left: 16, right: 64, zIndex: 10, pointerEvents: 'none' }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: 3 }}>LESSON {lessonIdx + 1} OF {curriculum.length}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', textShadow: '0 1px 8px rgba(0,0,0,0.6)', lineHeight: 1.3 }}>{currentLesson?.title}</div>
        </div>

        {/* Full-height thumbnail */}
        <img src={course.image} alt="" aria-hidden="true" crossOrigin="anonymous"
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isPlaying ? 0.3 : 0.55, position: 'absolute', inset: 0 }} />

        {/* Playback controls — centered */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 36, position: 'relative', zIndex: 5 }}>
          <button onClick={handleRewind} aria-label="Rewind 10 seconds" style={{ background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', cursor: 'pointer', width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HiArrowUturnLeft size={24} />
          </button>
          <button onClick={() => setIsPlaying(p => !p)} aria-label={isPlaying ? 'Pause' : 'Play'} style={{ background: 'rgba(79,70,229,0.9)', border: 'none', color: '#fff', cursor: 'pointer', width: 74, height: 74, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 24px rgba(79,70,229,0.55)' }}>
            {isPlaying ? <HiPause size={32} /> : <HiPlay size={32} />}
          </button>
          <div style={{ width: 56 }} />
        </div>

        {/* Scrubber */}
        <div style={{ position: 'relative', zIndex: 5, padding: '0 20px 32px', background: 'linear-gradient(transparent, rgba(0,0,0,0.9))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', minWidth: 34 }}>{formatTime(elapsed)}</span>
            <div role="slider" aria-label="Video progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progressPct)} tabIndex={0} onClick={handleScrubberClick}
              onKeyDown={e => { if (e.key === 'ArrowRight') setElapsed(p => Math.min(p + 1, TOTAL_SIM_SECS)); if (e.key === 'ArrowLeft') setElapsed(p => Math.max(p - 1, 0)); }}
              style={{ flex: 1, height: 24, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.25)', borderRadius: 3, position: 'relative' }}>
                <div style={{ height: '100%', width: `${progressPct}%`, background: 'var(--primary)', borderRadius: 3, transition: 'width 0.1s linear' }} />
                <div style={{ position: 'absolute', top: '50%', left: `${progressPct}%`, transform: 'translate(-50%, -50%)', width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }} />
              </div>
            </div>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', minWidth: 36 }}>{currentLesson?.duration}</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Normal layout ────────────────────────────────────────────────────────────
  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)', position: 'relative', overflow: 'hidden' }}>

      {/* Top bar */}
      <div style={{ padding: '8px 8px 8px 4px', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
        <button onClick={() => navigate(-1)} aria-label="Go back" style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10 }}>
          <HiArrowLeft size={22} />
        </button>
        <div style={{ flex: 1, fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>
          {course.title}
        </div>
        <button onClick={() => setShowMenu(true)} aria-label="More options" aria-expanded={showMenu} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10 }}>
          <HiEllipsisVertical size={22} />
        </button>
      </div>

      {/* Player area */}
      <div role="region" aria-label={`Player — ${currentLesson?.title || ''}`} style={{ height: 220, flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
        {lessonType === 'audio' ? (
          <AudioPlayerArea
            lesson={currentLesson}
            isPlaying={isPlaying}
            elapsed={elapsed}
            progressPct={progressPct}
            onPlayPause={() => setIsPlaying(p => !p)}
            onRewind={handleRewind}
            onScrubberClick={handleScrubberClick}
            setElapsed={setElapsed}
          />
        ) : (
          <>
            <img src={course.image} alt="" aria-hidden="true" crossOrigin="anonymous"
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isPlaying ? 0.35 : 0.6, transition: 'opacity 0.3s', position: 'absolute', inset: 0 }} />

            {/* Lesson info overlay */}
            <div style={{ position: 'absolute', top: 12, left: 16, right: 16, pointerEvents: 'none' }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', marginBottom: 3, fontWeight: 600, letterSpacing: '0.05em' }}>
                LESSON {lessonIdx + 1} OF {curriculum.length}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', lineHeight: 1.3, textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}>
                {currentLesson?.title}
              </div>
            </div>

            {/* Playback controls */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28 }}>
              <button onClick={handleRewind} aria-label="Rewind 10 seconds" style={{ background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', cursor: 'pointer', width: 46, height: 46, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HiArrowUturnLeft size={20} />
              </button>
              <button onClick={() => setIsPlaying(p => !p)} aria-label={isPlaying ? 'Pause lesson' : 'Play lesson'} style={{ background: 'rgba(79,70,229,0.9)', border: 'none', color: '#fff', cursor: 'pointer', width: 62, height: 62, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(79,70,229,0.5)' }}>
                {isPlaying ? <HiPause size={26} /> : <HiPlay size={26} />}
              </button>
              <button onClick={() => setIsFullscreen(true)} aria-label="Enter fullscreen" style={{ background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', cursor: 'pointer', width: 46, height: 46, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HiArrowsPointingOut size={20} />
              </button>
            </div>

            {/* Scrubber */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '6px 16px 10px', background: 'linear-gradient(transparent, rgba(0,0,0,0.85))' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', minWidth: 30, textAlign: 'right' }}>{formatTime(elapsed)}</span>
                <div role="slider" aria-label="Video progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progressPct)} tabIndex={0} onClick={handleScrubberClick}
                  onKeyDown={e => { if (e.key === 'ArrowRight') setElapsed(p => Math.min(p + 1, TOTAL_SIM_SECS)); if (e.key === 'ArrowLeft') setElapsed(p => Math.max(p - 1, 0)); }}
                  style={{ flex: 1, height: 20, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.25)', borderRadius: 2, position: 'relative' }}>
                    <div style={{ height: '100%', width: `${progressPct}%`, background: 'var(--primary)', borderRadius: 2, transition: 'width 0.1s linear' }} />
                    <div style={{ position: 'absolute', top: '50%', left: `${progressPct}%`, transform: 'translate(-50%, -50%)', width: 14, height: 14, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }} />
                  </div>
                </div>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', minWidth: 36 }}>{currentLesson?.duration}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Tab bar */}
      <div role="tablist" aria-label="Lesson sections" style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0, background: 'var(--bg-surface)' }}>
        {['contents', 'comments'].map(tab => (
          <button key={tab} role="tab" aria-selected={activeTab === tab} onClick={() => setActiveTab(tab)}
            style={{ flex: 1, padding: '12px 0', fontSize: 13, fontWeight: 600, textTransform: 'capitalize', background: 'none', border: 'none', color: activeTab === tab ? 'var(--primary-text)' : 'var(--text-muted)', cursor: 'pointer', position: 'relative', fontFamily: 'Inter,sans-serif' }}
          >
            {tab}
            {tab === 'comments' && comments.length > 0 && (
              <span style={{ marginLeft: 5, fontSize: 10, background: 'var(--primary)', color: '#fff', borderRadius: 8, padding: '1px 6px', fontWeight: 700 }}>{comments.length}</span>
            )}
            {activeTab === tab && (
              <motion.div layoutId="lesson-tab-indicator" style={{ position: 'absolute', bottom: 0, left: '15%', right: '15%', height: 2, background: 'var(--primary)', borderRadius: 2 }} />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div role="tabpanel" aria-label={activeTab === 'contents' ? 'Course contents' : 'Comments'} className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingBottom: 20 }}>
        <AnimatePresence mode="wait" initial={false}>
          {activeTab === 'contents' ? (
            <motion.div key="contents" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <ContentsTab
                curriculum={curriculum}
                lessonIdx={lessonIdx}
                isLessonCompleted={isLessonCompleted}
                isLessonLocked={isLessonLocked}
                onSelectLesson={handleSelectLesson}
                onQuiz={() => showToast('Quiz coming soon! 📝', 'success')}
              />
            </motion.div>
          ) : (
            <motion.div key="comments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <CommentsTab
                comments={comments}
                likedComments={likedComments}
                onLike={(cid) => setLikedComments(prev => { const n = new Set(prev); n.has(cid) ? n.delete(cid) : n.add(cid); return n; })}
                onReply={(comment) => { setActiveTab('comments'); setCommentText(`@${comment.name.split(' ')[0]} `); }}
                commentText={commentText}
                setCommentText={setCommentText}
                onSubmitComment={handlePostComment}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Overlays */}
      <AnimatePresence>
        {showMenu && (
          <MenuSheet
            onClose={() => setShowMenu(false)}
            onDownload={() => { showToast('Download coming soon!', 'success'); setShowMenu(false); }}
            onShare={() => { showToast('Link copied to clipboard!', 'success'); setShowMenu(false); }}
            onReport={() => { showToast('Thank you for your feedback.', 'success'); setShowMenu(false); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showComplete && (
          <CourseCompleteSheet courseTitle={course.title} onClose={() => { setShowComplete(false); navigate('/learn'); }} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {openPDF && <PDFModal lesson={openPDF} onClose={() => setOpenPDF(null)} />}
      </AnimatePresence>

      <AnimatePresence>
        {openImage && <ImageModal lesson={openImage} courseImage={course.image} onClose={() => setOpenImage(null)} />}
      </AnimatePresence>
    </div>
  );
}
