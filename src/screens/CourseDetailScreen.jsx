import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useApp } from '../context/AppContext';
import { courses } from '../data/courses';
import { HiArrowLeft, HiStar, HiPlay, HiCheck, HiShoppingCart } from '../components/Icons';

export default function CourseDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, isInCart, purchase } = useCart();
  const { currentUser } = useAuth();
  const { showToast } = useApp();

  const course = courses.find(c => c.id === Number(id));
  const [flyAnim, setFlyAnim] = useState(false);
  const alreadyInCart = course ? isInCart(course.id) : false;

  if (!course) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', gap: 12 }}>
        <div style={{ fontSize: 40 }}>😕</div>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Course not found</div>
        <button className="btn-outline" style={{ width: 160 }} onClick={() => navigate('/home')}>← Back</button>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (alreadyInCart) return;
    addToCart(course);
    showToast('Added to cart ✓');
    setFlyAnim(true);
    setTimeout(() => setFlyAnim(false), 1100);
  };

  const handleBuyNow = () => {
    if (!alreadyInCart) addToCart(course);
    const summary = { subtotal: course.price, discount: 0, discountAmt: 0, total: course.price };
    sessionStorage.setItem('ro_order_summary', JSON.stringify(summary));
    navigate('/payment');
  };

  const handleEnrollFree = () => {
    purchase([course]);
    showToast('Enrolled! Start learning 🎉');
    navigate('/learn');
  };

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 300, opacity: 0 }}
      style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)', position: 'relative' }}
    >
      {/* Hero */}
      <div style={{ position: 'relative', height: 230, overflow: 'hidden', flexShrink: 0 }}>
        <img src={course.image} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} crossOrigin="anonymous" />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--bg-dark) 0%, rgba(24,24,27,0.15) 100%)' }} />
        <button
          onClick={() => navigate(-1)}
          style={{ position: 'absolute', top: 24, left: 16, background: 'rgba(0,0,0,0.5)', borderRadius: '50%', padding: 8, color: '#fff', backdropFilter: 'blur(4px)', cursor: 'pointer' }}
        >
          <HiArrowLeft size={20} />
        </button>
      </div>

      {/* Body */}
      <div className="hide-scrollbar" style={{ flex: 1, padding: '0 20px 100px', overflowY: 'auto', marginTop: -36, position: 'relative', zIndex: 2 }}>
        <div style={{ background: 'var(--primary)', display: 'inline-block', padding: '3px 10px', borderRadius: 10, fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, color: '#fff' }}>
          {course.category}
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em' }}>{course.title}</h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, color: 'var(--text-muted)', fontSize: 13 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <HiStar filled /><span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{course.rating}</span>
          </div>
          <span>•</span><span>{course.enrolled.toLocaleString()} enrolled</span>
          <span>•</span><span>{course.duration}</span>
          <span>•</span><span>{course.lessons} lessons</span>
        </div>

        {course.description && (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 20 }}>{course.description}</p>
        )}

        <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'baseline', gap: 8 }}>
          {course.price === 0
            ? <span style={{ color: 'var(--success)' }}>Free Course</span>
            : <span>₹{course.price.toLocaleString()}</span>
          }
          {course.originalPrice && (
            <span style={{ fontSize: 14, color: 'var(--text-muted)', textDecoration: 'line-through', fontWeight: 400 }}>₹{course.originalPrice.toLocaleString()}</span>
          )}
          {course.originalPrice && (
            <span style={{ fontSize: 12, background: 'rgba(34,197,94,0.15)', color: 'var(--success)', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>
              {Math.round((1 - course.price / course.originalPrice) * 100)}% off
            </span>
          )}
        </div>

        {/* Instructor */}
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Instructor</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, padding: 14, background: 'var(--bg-surface)', borderRadius: 14, border: '1px solid var(--border)' }}>
          <img src={course.instructorImg} alt={course.instructor} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }} crossOrigin="anonymous" />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{course.instructor}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Expert in {course.category}</div>
          </div>
        </div>

        {/* Curriculum */}
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Curriculum</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(course.curriculum || []).map((les, i) => (
            <div
              key={les.id}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, border: '1px solid var(--border)', borderRadius: 12, background: i === 0 ? 'rgba(79,70,229,0.08)' : 'transparent' }}
            >
              <div style={{ background: 'var(--bg-surface)', width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, border: '1px solid var(--border)', flexShrink: 0 }}>
                {i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{les.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{les.duration}</div>
              </div>
              <div style={{ color: 'var(--text-muted)' }}><HiPlay size={18} /></div>
            </div>
          ))}
        </div>
      </div>

      {/* Fly-to-cart animation */}
      <AnimatePresence>
        {flyAnim && (
          <motion.div
            initial={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            animate={{ opacity: 0, scale: 0.4, y: -320, x: 120 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ position: 'absolute', bottom: 80, left: 24, zIndex: 200, pointerEvents: 'none', background: 'var(--primary)', borderRadius: 12, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontSize: 13, fontWeight: 700, boxShadow: '0 8px 24px rgba(79,70,229,0.5)' }}
          >
            <HiShoppingCart size={16} /> Added to cart!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer buttons */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--bg-dark)', borderTop: '1px solid var(--border)', padding: '14px 20px', display: 'flex', gap: 10, zIndex: 10 }}>
        {course.price === 0 ? (
          <motion.button whileTap={{ scale: 0.96 }} className="btn-primary" style={{ flex: 1 }} onClick={handleEnrollFree}>
            Enroll Now — Free
          </motion.button>
        ) : (
          <>
            <motion.button
              whileTap={{ scale: 0.96 }}
              className="btn-outline"
              style={{ flex: 1, opacity: alreadyInCart ? 0.6 : 1 }}
              onClick={handleAddToCart}
              disabled={alreadyInCart}
            >
              {alreadyInCart
                ? <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 6 }}><HiCheck size={16} /> In Cart</span>
                : flyAnim ? <span style={{ color: 'var(--success)' }}>✓ Added!</span> : 'Add to Cart'
              }
            </motion.button>
            <motion.button whileTap={{ scale: 0.96 }} className="btn-primary" style={{ flex: 1 }} onClick={handleBuyNow}>
              Buy Now
            </motion.button>
          </>
        )}
      </div>
    </motion.div>
  );
}
