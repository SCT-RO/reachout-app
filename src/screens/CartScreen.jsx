import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../hooks/useCart';
import { useApp } from '../context/AppContext';
import { HiArrowLeft, HiShoppingCart, HiTrash, HiTag } from '../components/Icons';

const PROMO_CODES = { REACH20: 0.2 };

const IconPhone = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
  </svg>
);
const IconCard = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
  </svg>
);

function PaymentOptionsSheet({ cartItems, inAppTotal, ccavenueTotal, onClose, onSelectInApp, onSelectCCAvenue }) {
  const savings = inAppTotal - ccavenueTotal;
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 300, display: 'flex', alignItems: 'flex-end' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 220 }}
        onClick={e => e.stopPropagation()}
        style={{ background: 'var(--bg-surface)', width: '100%', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: '24px 20px 40px' }}
      >
        <div style={{ width: 36, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 20px' }} />
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Choose how to pay</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
          {cartItems.length} course{cartItems.length !== 1 ? 's' : ''} in your cart
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* In-App */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onSelectInApp}
            style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 18px', background: 'rgba(79,70,229,0.08)', border: '1.5px solid var(--primary)', borderRadius: 16, cursor: 'pointer', textAlign: 'left', width: '100%' }}
          >
            <div style={{ color: 'var(--primary)', flexShrink: 0 }}><IconPhone /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>In-App Purchase</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>via Google Play / App Store</div>
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>₹{inAppTotal.toLocaleString()}</div>
          </motion.button>

          {/* CC Avenue */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onSelectCCAvenue}
            style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 18px', background: 'rgba(245,158,11,0.08)', border: '1.5px solid var(--warning)', borderRadius: 16, cursor: 'pointer', textAlign: 'left', width: '100%' }}
          >
            <div style={{ color: 'var(--warning)', flexShrink: 0 }}><IconCard /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>CC Avenue</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>via Credit / Debit Card, UPI, NetBanking</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--warning)' }}>₹{ccavenueTotal.toLocaleString()}</div>
              {savings > 0 && (
                <div style={{ fontSize: 10, color: 'var(--success)', fontWeight: 700 }}>Save ₹{savings.toLocaleString()}</div>
              )}
            </div>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function CartScreen() {
  const navigate = useNavigate();
  const { cartItems, removeFromCart } = useCart();
  const { showToast } = useApp();
  const [promoInput, setPromoInput] = useState('');
  const [appliedCode, setAppliedCode] = useState('');
  const [promoStatus, setPromoStatus] = useState(null); // null | 'valid' | 'invalid'
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);

  const discount = PROMO_CODES[appliedCode] || 0;
  const subtotal = cartItems.reduce((a, i) => a + i.price, 0);
  const discountAmt = Math.round(subtotal * discount);
  const total = subtotal - discountAmt;

  const ccavenueSubtotal = cartItems.reduce((a, i) => a + (i.ccavenuePrice ?? i.price), 0);
  const ccavenueDiscountAmt = Math.round(ccavenueSubtotal * discount);
  const ccavenueTotal = ccavenueSubtotal - ccavenueDiscountAmt;

  const handleApply = () => {
    const code = promoInput.toUpperCase().trim();
    if (PROMO_CODES[code]) {
      setAppliedCode(code);
      setPromoStatus('valid');
    } else {
      setAppliedCode('');
      setPromoStatus('invalid');
    }
  };

  const handleProceed = () => setShowPaymentSheet(true);

  const handleSelectInApp = () => {
    setShowPaymentSheet(false);
    const summary = { discount, discountAmt, subtotal, total };
    sessionStorage.setItem('ro_order_summary', JSON.stringify(summary));
    navigate('/payment');
  };

  const handleSelectCCAvenue = () => {
    setShowPaymentSheet(false);
    showToast('Redirecting to CC Avenue…');
  };

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 300, opacity: 0 }}
      style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)' }}
    >
      {/* Header */}
      <div style={{ padding: '24px 20px 14px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <button onClick={() => navigate(-1)} style={{ color: 'var(--text-primary)', cursor: 'pointer' }}><HiArrowLeft /></button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em' }}>My Cart</h1>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</div>
        </div>
        {cartItems.length > 0 && (
          <div style={{ background: 'var(--primary)', color: '#fff', width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
            {cartItems.length}
          </div>
        )}
      </div>

      <div className="hide-scrollbar" style={{ flex: 1, padding: '16px 20px', overflowY: 'auto', paddingBottom: 100 }}>
        {cartItems.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', gap: 12 }}>
            <div style={{ color: 'var(--text-muted)', opacity: 0.35 }}><HiShoppingCart size={56} /></div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-muted)' }}>Your cart is empty</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', opacity: 0.7 }}>Add courses to get started</div>
            <button className="btn-primary" style={{ width: 180, marginTop: 8 }} onClick={() => navigate('/home')}>Browse Courses</button>
          </div>
        ) : (
          <>
            {/* Cart items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <AnimatePresence>
                {cartItems.map(item => (
                  <motion.div
                    key={item.id}
                    layout
                    exit={{ opacity: 0, x: -20, height: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ display: 'flex', gap: 12, padding: 14, background: 'var(--bg-surface)', borderRadius: 16, border: '1px solid var(--border)' }}
                  >
                    <img src={item.image} alt={item.title} style={{ width: 64, height: 64, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} crossOrigin="anonymous" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4, marginBottom: 4 }}>{item.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{item.instructor}</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary)' }}>₹{item.price.toLocaleString()}</div>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} style={{ color: 'var(--error)', alignSelf: 'flex-start', padding: 4, cursor: 'pointer' }}>
                      <HiTrash />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Promo code */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <HiTag /> Promo Code
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={promoInput}
                  onChange={e => { setPromoInput(e.target.value); setPromoStatus(null); }}
                  onKeyDown={e => e.key === 'Enter' && handleApply()}
                  placeholder="Enter promo code"
                  style={{ flex: 1, background: 'var(--bg-surface)', border: `1.5px solid ${promoStatus === 'valid' ? 'var(--success)' : promoStatus === 'invalid' ? 'var(--error)' : 'var(--border)'}`, borderRadius: 12, padding: '11px 14px', color: 'var(--text-primary)', fontSize: 14, outline: 'none', fontFamily: 'Inter,sans-serif', textTransform: 'uppercase' }}
                />
                <button
                  onClick={handleApply}
                  style={{ background: 'var(--primary)', color: '#fff', padding: '0 18px', borderRadius: 12, fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', cursor: 'pointer' }}
                >
                  Apply
                </button>
              </div>
              <AnimatePresence>
                {promoStatus === 'valid' && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ fontSize: 12, color: 'var(--success)', marginTop: 6, fontWeight: 600 }}>
                    ✓ 20% discount applied!
                  </motion.div>
                )}
                {promoStatus === 'invalid' && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ fontSize: 12, color: 'var(--error)', marginTop: 6, fontWeight: 600 }}>
                    ✗ Invalid promo code
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Order summary */}
            <div style={{ background: 'var(--bg-surface)', padding: 16, borderRadius: 16, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Order Summary</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, color: 'var(--text-muted)' }}>
                <span>Subtotal ({cartItems.length} course{cartItems.length !== 1 ? 's' : ''})</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>₹{subtotal.toLocaleString()}</span>
              </div>
              {discountAmt > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                  <span style={{ color: 'var(--success)' }}>Discount ({appliedCode})</span>
                  <span style={{ color: 'var(--success)', fontWeight: 600 }}>−₹{discountAmt.toLocaleString()}</span>
                </div>
              )}
              <div style={{ height: 1, background: 'var(--border)', margin: '10px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 800 }}>
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {cartItems.length > 0 && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px 20px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-dark)' }}>
          <button className="btn-primary" onClick={handleProceed}>Proceed to Payment</button>
        </div>
      )}

      <AnimatePresence>
        {showPaymentSheet && (
          <PaymentOptionsSheet
            cartItems={cartItems}
            inAppTotal={total}
            ccavenueTotal={ccavenueTotal}
            onClose={() => setShowPaymentSheet(false)}
            onSelectInApp={handleSelectInApp}
            onSelectCCAvenue={handleSelectCCAvenue}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
