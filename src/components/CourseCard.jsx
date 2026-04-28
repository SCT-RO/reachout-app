import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const HiStar = ({ filled }) => (
  <svg aria-hidden="true" width="14" height="14" fill={filled ? 'var(--warning)' : 'none'} stroke={filled ? 'var(--warning)' : 'currentColor'} strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/>
  </svg>
);

function optimizeImage(src, width = 640) {
  if (!src) return src;
  return `/_vercel/image?url=${encodeURIComponent(src)}&w=${width}&q=75`;
}

export default function CourseCard({ course, priority = false }) {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  const priceLabel = course.price === 0 ? 'Free' : `₹${course.price.toLocaleString()}`;
  const ariaLabel = `${course.title}. ${priceLabel}. Rated ${course.rating} out of 5.`;

  return (
    <motion.button
      whileHover={{ y: -3, boxShadow: '0 10px 28px rgba(79,70,229,0.18)' }}
      className="glass-card"
      aria-label={ariaLabel}
      style={{ borderRadius: 16, overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column', textAlign: 'left', width: '100%', minHeight: 'unset', padding: 0, color: 'var(--text-primary)' }}
      onClick={() => navigate(`/course/${course.id}`)}
    >
      <div style={{ aspectRatio: '16/9', width: '100%', position: 'relative', overflow: 'hidden', background: 'var(--border)' }}>
        {/* Skeleton shown until image loads */}
        {!loaded && (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, var(--border) 25%, var(--bg-surface) 50%, var(--border) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
        )}
        <img
          src={optimizeImage(course.image)}
          alt=""
          role="presentation"
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchpriority={priority ? 'high' : 'auto'}
          onLoad={() => setLoaded(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: loaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
        />
        {course.price === 0 && (
          <div aria-hidden="true" style={{ position: 'absolute', top: 8, right: 8, background: '#15803d', color: '#fff', fontSize: 9, fontWeight: 700, padding: '3px 7px', borderRadius: 6, letterSpacing: '0.05em' }}>FREE</div>
        )}
      </div>
      <div style={{ padding: 12, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div aria-hidden="true" style={{ fontSize: 9, color: 'var(--accent-text)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>{course.category}</div>
        <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.3, marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 34 }}>{course.title}</div>

        <div style={{ marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
            <HiStar filled />
            <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600 }}>{course.rating}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>({course.enrolled.toLocaleString()})</span>
          </div>
          <div aria-hidden="true" style={{ fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'baseline', gap: 6 }}>
            {course.price === 0
              ? <span style={{ color: 'var(--success)' }}>Free</span>
              : <span>₹{course.price.toLocaleString()}</span>
            }
            {course.originalPrice && (
              <span style={{ fontSize: 11, color: 'var(--text-muted)', textDecoration: 'line-through', fontWeight: 400 }}>₹{course.originalPrice.toLocaleString()}</span>
            )}
          </div>
        </div>
      </div>
    </motion.button>
  );
}
