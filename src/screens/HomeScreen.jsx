import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useCourses } from '../hooks/useCourses';
import CourseCard from '../components/CourseCard';
import BottomNav from '../components/BottomNav';
import Chatbot from '../components/Chatbot';
import { HiMagnifyingGlass, HiShoppingCart } from '../components/Icons';

const CATEGORIES = ['All', 'Technology', 'Business', 'Design', 'Leadership', 'Marketing'];

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
  const [activeCat, setActiveCat] = useState('All');
  const [searchQ, setSearchQ] = useState('');

  const firstName = currentUser?.name?.split(' ')[0] || 'there';
  const featured = courses.find(c => c.featured);

  const filteredCourses = courses.filter(c =>
    (activeCat === 'All' || c.category === activeCat) &&
    c.title.toLowerCase().includes(searchQ.toLowerCase())
  );

  const searchResults = courses
    .filter(c => searchQ && c.title.toLowerCase().includes(searchQ.toLowerCase()))
    .slice(0, 4);

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)', position: 'relative' }}>
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', paddingBottom: 96 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}>
              {getGreeting()}, {firstName} 👋
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>What will you learn today?</div>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/cart')}
            style={{ position: 'relative', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 10, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <HiShoppingCart size={20} />
            {cartItems.length > 0 && (
              <motion.div
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
          <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', zIndex: 1 }}>
            <HiMagnifyingGlass />
          </div>
          <input
            style={{ width: '100%', background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 14, padding: '12px 14px 12px 42px', color: 'var(--text-primary)', fontSize: 14, outline: 'none', fontFamily: 'Inter,sans-serif' }}
            placeholder="Search courses..."
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
          />
          <AnimatePresence>
            {searchQ && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="glass-card"
                style={{ position: 'absolute', top: '100%', left: 0, right: 0, borderRadius: 14, marginTop: 6, zIndex: 10, overflow: 'hidden', boxShadow: '0 10px 32px rgba(0,0,0,0.3)' }}
              >
                {searchResults.map(c => (
                  <div
                    key={c.id}
                    style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
                    onClick={() => { setSearchQ(''); navigate(`/course/${c.id}`); }}
                  >
                    <img src={c.image} alt={c.title} style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} crossOrigin="anonymous" />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{c.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.category}</div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Category pills */}
        <div className="hide-scrollbar" style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', margin: '0 -20px 20px', padding: '0 20px' }}>
          {CATEGORIES.map(cat => (
            <div
              key={cat}
              onClick={() => setActiveCat(cat)}
              style={{ padding: '7px 16px', borderRadius: 20, background: activeCat === cat ? 'var(--primary)' : 'var(--bg-surface)', color: activeCat === cat ? '#fff' : 'var(--text-muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s', border: activeCat === cat ? 'none' : '1px solid var(--border)', flexShrink: 0 }}
            >
              {cat}
            </div>
          ))}
        </div>

        {/* Featured banner */}
        {!searchQ && activeCat === 'All' && featured && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            style={{ height: 180, borderRadius: 20, overflow: 'hidden', position: 'relative', marginBottom: 20, cursor: 'pointer' }}
            onClick={() => navigate(`/course/${featured.id}`)}
          >
            <img src={featured.image} alt={featured.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} crossOrigin="anonymous" />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(24,24,27,0.97) 5%, rgba(24,24,27,0.1) 85%)' }} />
            <div style={{ position: 'absolute', inset: 0, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 1 }}>
              <div style={{ alignSelf: 'flex-start', background: 'rgba(79,70,229,0.9)', color: '#fff', padding: '3px 10px', borderRadius: 8, fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Featured</div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 6, letterSpacing: '-0.02em' }}>{featured.title}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{featured.instructor}</span>
                  <span style={{ background: 'rgba(39,39,42,0.85)', color: '#fff', padding: '4px 8px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
                    {featured.price === 0 ? 'Free' : `₹${featured.price.toLocaleString()}`}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}
          >
            <span style={{ fontSize: 12, color: 'var(--error)', fontWeight: 500, flex: 1 }}>
              Couldn't load latest courses. Showing cached data.
            </span>
            <button
              onClick={refetch}
              style={{ fontSize: 12, fontWeight: 700, color: 'var(--error)', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Inter,sans-serif', textDecoration: 'underline' }}
            >
              Retry
            </button>
          </motion.div>
        )}

        {/* Course grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {isLoading
            ? Array(4).fill(0).map((_, i) => (
              <div key={i} className="glass-card" style={{ borderRadius: 16, overflow: 'hidden' }}>
                <div className="skeleton" style={{ height: 95, width: '100%' }} />
                <div style={{ padding: 12 }}>
                  <div className="skeleton" style={{ height: 10, width: '40%', marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 13, width: '90%', marginBottom: 4 }} />
                  <div className="skeleton" style={{ height: 13, width: '60%' }} />
                </div>
              </div>
            ))
            : filteredCourses.map(c => <CourseCard key={c.id} course={c} />)
          }
        </div>

        {!isLoading && filteredCourses.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
            <div style={{ fontWeight: 600 }}>No courses found</div>
          </div>
        )}
      </div>

      <Chatbot />
      <BottomNav />
    </div>
  );
}
