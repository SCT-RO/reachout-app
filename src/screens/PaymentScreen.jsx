import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../hooks/useCart';
import { HiArrowLeft, HiCreditCard, HiGlobeAlt, HiSparkles, HiShieldCheck } from '../components/Icons';

function fmtCard(v) { return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim(); }
function fmtExpiry(v) { const d = v.replace(/\D/g, '').slice(0, 4); return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d; }

const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit / Debit Card', sub: 'Visa, Mastercard, RuPay', icon: <HiCreditCard /> },
  { id: 'upi', label: 'UPI', sub: 'GPay, PhonePe, Paytm', icon: <HiGlobeAlt /> },
  { id: 'iap', label: 'In-App Purchase', sub: '+18% convenience fee', icon: <HiSparkles size={20} />, warn: true },
];

export default function PaymentScreen() {
  const navigate = useNavigate();
  const { purchase } = useCart();

  const summary = JSON.parse(sessionStorage.getItem('ro_order_summary') || 'null') || { subtotal: 0, discountAmt: 0, total: 0 };

  const [method, setMethod] = useState('card');
  const [cardNum, setCardNum] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);

  const iapFee = method === 'iap' ? Math.round(summary.total * 0.18) : 0;
  const finalTotal = summary.total + iapFee;

  const handlePay = () => {
    setLoading(true);
    // Simulate payment processing
    setTimeout(() => {
      purchase();
      navigate('/success', { replace: true });
    }, 1400);
  };

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 300, opacity: 0 }}
      style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)' }}
    >
      {/* Header */}
      <div style={{ padding: '24px 20px 14px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <button onClick={() => navigate(-1)} style={{ color: 'var(--text-primary)', cursor: 'pointer' }}><HiArrowLeft /></button>
        <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em' }}>Payment</h1>
      </div>

      {/* Total pill */}
      <div style={{ margin: '16px 20px 0', padding: '12px 16px', background: 'rgba(79,70,229,0.1)', borderRadius: 14, border: '1px solid rgba(79,70,229,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Amount to pay</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>₹{finalTotal.toLocaleString()}</div>
      </div>

      <div className="hide-scrollbar" style={{ flex: 1, padding: '16px 20px', overflowY: 'auto', paddingBottom: 100 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Payment Method</div>

        {PAYMENT_METHODS.map(m => (
          <div
            key={m.id}
            onClick={() => setMethod(m.id)}
            style={{ marginBottom: 10, border: `2px solid ${method === m.id ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 14, overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.2s', background: 'var(--bg-surface)' }}
          >
            <div style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: method === m.id ? 'rgba(79,70,229,0.12)' : 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: method === m.id ? 'var(--primary)' : 'var(--text-muted)', transition: 'all 0.2s' }}>
                {m.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{m.label}</div>
                <div style={{ fontSize: 11, color: m.warn ? 'var(--warning)' : 'var(--text-muted)', fontWeight: m.warn ? 600 : 400 }}>{m.sub}</div>
              </div>
              <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${method === m.id ? 'var(--primary)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                {method === m.id && <div style={{ width: 8, height: 8, background: 'var(--primary)', borderRadius: '50%' }} />}
              </div>
            </div>

            <AnimatePresence>
              {method === m.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ padding: '0 14px 14px', borderTop: '1px solid var(--border)' }}>
                    {m.id === 'card' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 12 }}>
                        <input value={cardNum} onChange={e => setCardNum(fmtCard(e.target.value))} placeholder="Card Number" style={{ background: 'var(--bg-dark)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '11px 14px', color: 'var(--text-primary)', fontSize: 14, outline: 'none', fontFamily: 'Inter,sans-serif', letterSpacing: '0.05em', width: '100%' }} />
                        <div style={{ display: 'flex', gap: 10 }}>
                          <input value={expiry} onChange={e => setExpiry(fmtExpiry(e.target.value))} placeholder="MM/YY" style={{ flex: 1, background: 'var(--bg-dark)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '11px 14px', color: 'var(--text-primary)', fontSize: 14, outline: 'none', fontFamily: 'Inter,sans-serif' }} />
                          <input value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))} placeholder="CVV" type="password" style={{ flex: 1, background: 'var(--bg-dark)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '11px 14px', color: 'var(--text-primary)', fontSize: 14, outline: 'none', fontFamily: 'Inter,sans-serif' }} />
                        </div>
                        <input value={cardName} onChange={e => setCardName(e.target.value)} placeholder="Cardholder Name" style={{ background: 'var(--bg-dark)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '11px 14px', color: 'var(--text-primary)', fontSize: 14, outline: 'none', fontFamily: 'Inter,sans-serif', textTransform: 'uppercase', width: '100%' }} />
                      </div>
                    )}
                    {m.id === 'upi' && (
                      <div style={{ paddingTop: 12 }}>
                        <input value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@upi" style={{ width: '100%', background: 'var(--bg-dark)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '11px 14px', color: 'var(--text-primary)', fontSize: 14, outline: 'none', fontFamily: 'Inter,sans-serif' }} />
                      </div>
                    )}
                    {m.id === 'iap' && (
                      <div style={{ paddingTop: 12, fontSize: 13, color: 'var(--warning)', fontWeight: 500, lineHeight: 1.5 }}>
                        An 18% convenience fee (₹{iapFee.toLocaleString()}) will be added. Total: <strong>₹{finalTotal.toLocaleString()}</strong>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {/* Order breakdown */}
        <div style={{ background: 'var(--bg-surface)', padding: 16, borderRadius: 16, border: '1px solid var(--border)', marginTop: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Order Breakdown</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: 'var(--text-muted)' }}>
            <span>Subtotal</span><span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>₹{summary.subtotal.toLocaleString()}</span>
          </div>
          {summary.discountAmt > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
              <span style={{ color: 'var(--success)' }}>Discount</span>
              <span style={{ color: 'var(--success)', fontWeight: 600 }}>−₹{summary.discountAmt.toLocaleString()}</span>
            </div>
          )}
          {iapFee > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
              <span style={{ color: 'var(--warning)' }}>IAP Fee (18%)</span>
              <span style={{ color: 'var(--warning)', fontWeight: 600 }}>+₹{iapFee.toLocaleString()}</span>
            </div>
          )}
          <div style={{ height: 1, background: 'var(--border)', margin: '10px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 800 }}>
            <span>Total</span><span style={{ color: 'var(--primary)' }}>₹{finalTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px 20px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-dark)' }}>
        <button className="btn-primary" onClick={handlePay} disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
          {loading
            ? <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} /> Processing…</span>
            : <><HiShieldCheck size={18} /> Pay ₹{finalTotal.toLocaleString()}</>
          }
        </button>
      </div>
    </motion.div>
  );
}
