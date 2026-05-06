import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useCourses } from '../hooks/useCourses';
import { getPurchased, getProgress } from '../utils/storage';
import { findCoursePackage } from '../data/courses';
import CourseCard from '../components/CourseCard';
import BottomNav from '../components/BottomNav';
import Chatbot from '../components/Chatbot';
import { HiMagnifyingGlass, HiShoppingCart, HiPlayCircle, HiRectangleStack } from '../components/Icons';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const { currentUser } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const { courses, isLoading, error, refetch } = useCourses();
  const [searchQ, setSearchQ] = useState('');

  const firstName = currentUser?.name?.split(' ')[0] || 'there';
  const featured = courses.find(c => c.featured);
  const featuredIsPurchased = featured
    ? getPurchased(currentUser?.userId || '').some(p => String(p.id) === String(featured.id))
    : false;
  const featuredProgress = featured
    ? getProgress(currentUser?.userId || '', featured.id)
    : { lessonsCompleted: [] as string[], percentComplete: 0, lastWatched: null };
  const featuredModules = featured ? (findCoursePackage(featured.title)?.modules.length ?? 0) : 0;

  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(searchQ.toLowerCase())
  );

  const searchResults = courses
    .filter(c => searchQ && c.title.toLowerCase().includes(searchQ.toLowerCase()))
    .slice(0, 4);

  const cartLabel = cartItems.length > 0 ? `Cart, ${cartItems.length} item${cartItems.length > 1 ? 's' : ''}` : 'Cart';

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)', position: 'relative' }}>
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', paddingBottom: 96 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }} aria-live="polite">
              {getGreeting()}, {firstName} 👋
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>What will you learn today?</div>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/cart')}
            aria-label={cartLabel}
            style={{ position: 'relative', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 10, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <HiShoppingCart size={20} />
            {cartItems.length > 0 && (
              <motion.div
                aria-hidden="true"
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                style={{ position: 'absolute', top: -5, right: -5, background: 'var(--error)', color: '#fff', width: 16, height: 16, borderRadius: '50%', fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}
              >
                {cartItems.length}
              </motion.div>
            )}
          </motion.button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <label htmlFor="course-search" style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
            Search courses
          </label>
          <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', zIndex: 1 }} aria-hidden="true">
            <HiMagnifyingGlass />
          </div>
          <input
            id="course-search"
            role="combobox"
            aria-expanded={searchQ.length > 0 && searchResults.length > 0}
            aria-autocomplete="list"
            aria-controls="search-listbox"
            aria-haspopup="listbox"
            style={{ width: '100%', background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 14, padding: '12px 14px 12px 42px', color: 'var(--text-primary)', fontSize: 14, outline: 'none', fontFamily: 'Inter,sans-serif' }}
            placeholder="Search courses..."
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
          />
          <AnimatePresence>
            {searchQ && searchResults.length > 0 && (
              <motion.ul
                id="search-listbox"
                role="listbox"
                aria-label="Search results"
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="glass-card"
                style={{ position: 'absolute', top: '100%', left: 0, right: 0, borderRadius: 14, marginTop: 6, zIndex: 10, overflow: 'hidden', boxShadow: '0 10px 32px rgba(0,0,0,0.3)', listStyle: 'none', padding: 0, margin: '6px 0 0 0' }}
              >
                {searchResults.map(c => (
                  <li key={c.id} role="option" aria-selected="false">
                    <button
                      style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: 'none', border: 'none', borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-primary)', fontFamily: 'Inter,sans-serif' }}
                      onClick={() => { setSearchQ(''); navigate(`/course/${c.id}`); }}
                    >
                      <img src={c.image} alt="" role="presentation" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{c.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.category}</div>
                      </div>
                    </button>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        {/* Featured hero card */}
        {!searchQ && (
          isLoading
            ? <div className="skeleton" style={{ height: 260, borderRadius: 20, marginBottom: 20 }} />
            : featured && (
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                style={{ borderRadius: 20, overflow: 'hidden', position: 'relative', marginBottom: 20 }}
              >
                {/* Thumbnail */}
                <div style={{ height: 260, position: 'relative' }}>
                  <img src={featured.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.1) 100%)' }} />
                </div>
                {/* Category pill */}
                <div style={{ position: 'absolute', top: 14, left: 14, background: 'var(--primary)', color: 'white', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 8, textTransform: 'uppercase' }}>
                  {featured.category}
                </div>
                {/* Bottom content */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16 }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'white', marginBottom: 4 }}>{featured.title}</div>
                  {/* Stats row */}
                  <div style={{ display: 'flex', gap: 16, marginBottom: 12, alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.7)' }}>
                      <HiPlayCircle size={14} />
                      <span style={{ fontSize: 12 }}>{featured.lessons} Lessons</span>
                    </div>
                    <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.7)' }}>
                      <HiRectangleStack size={14} />
                      <span style={{ fontSize: 12 }}>{featuredModules} Modules</span>
                    </div>
                  </div>
                  {/* Bottom row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {featuredIsPurchased ? (
                      <div style={{ flex: 1, marginRight: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Your Progress</span>
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{featuredProgress.percentComplete}% Complete</span>
                        </div>
                        <div style={{ width: 160, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.2)' }}>
                          <div style={{ height: '100%', borderRadius: 2, background: 'var(--primary)', width: `${featuredProgress.percentComplete}%` }} />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <span style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>₹{featured.price.toLocaleString()}</span>
                        {featured.originalPrice != null && (
                          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', textDecoration: 'line-through', marginLeft: 6 }}>₹{featured.originalPrice.toLocaleString()}</span>
                        )}
                      </div>
                    )}
                    {featuredIsPurchased ? (
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => navigate(`/course/${featured.id}/modules`)}
                        style={{ background: 'white', color: 'var(--primary)', padding: '11px 20px', borderRadius: 12, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'Inter,sans-serif', flexShrink: 0 }}
                      >
                        Continue →
                      </motion.button>
                    ) : (
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => navigate(`/course/${featured.id}`)}
                        style={{ background: 'var(--primary)', color: 'white', padding: '11px 20px', borderRadius: 12, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'Inter,sans-serif', flexShrink: 0 }}
                      >
                        Enroll Now
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            )
        )}

        {/* Error banner */}
        {error && (
          <motion.div
            role="alert"
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}
          >
            <span style={{ fontSize: 12, color: 'var(--error-text)', fontWeight: 500, flex: 1 }}>
              Couldn't load latest courses. Showing cached data.
            </span>
            <button
              onClick={refetch}
              style={{ fontSize: 12, fontWeight: 700, color: 'var(--error-text)', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Inter,sans-serif', textDecoration: 'underline', minHeight: 44 }}
            >
              Retry
            </button>
          </motion.div>
        )}

        {/* Course grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {isLoading
            ? Array(4).fill(0).map((_, i) => (
              <div key={i} aria-hidden="true" className="glass-card" style={{ borderRadius: 16, overflow: 'hidden', display: 'flex', height: 96 }}>
                <div className="skeleton" style={{ width: 110, flexShrink: 0 }} />
                <div style={{ padding: 12, flex: 1 }}>
                  <div className="skeleton" style={{ height: 10, width: '40%', marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 13, width: '90%', marginBottom: 4 }} />
                  <div className="skeleton" style={{ height: 13, width: '60%' }} />
                </div>
              </div>
            ))
            : filteredCourses.map((c, i) => {
              const isEnrolled = getPurchased(currentUser?.userId || '').some(p => String(p.id) === String(c.id));
              return <CourseCard key={c.id} course={c} priority={i < 2} onClick={() => navigate(isEnrolled ? `/course/${c.id}/modules` : `/course/${c.id}`)} />;
            })
          }
        </div>

        {!isLoading && filteredCourses.length === 0 && (
          <div role="status" style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
            <div aria-hidden="true" style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
            <div style={{ fontWeight: 600 }}>No courses found</div>
          </div>
        )}
      </div>

      <Chatbot />
      <BottomNav />
    </div>
  );
}
