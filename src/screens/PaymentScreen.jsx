import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../hooks/useCart';
import { HiArrowLeft, HiCreditCard, HiGlobeAlt, HiShieldCheck } from '../components/Icons';

function fmtCard(v) { return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim(); }
function fmtExpiry(v) { const d = v.replace(/\D/g, '').slice(0, 4); return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d; }

const IconBank = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
  </svg>
);
const IconPhone = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
  </svg>
);

const CC_AVENUE_METHODS = [
  { id: 'card',       label: 'Credit / Debit Card', sub: 'Visa, Mastercard, RuPay',  icon: <HiCreditCard /> },
  { id: 'upi',        label: 'UPI',                 sub: 'GPay, PhonePe, Paytm',     icon: <HiGlobeAlt /> },
  { id: 'netbanking', label: 'Net Banking',          sub: 'All major Indian banks',   icon: <IconBank /> },
];

function RadioRow({ method, selected, onSelect, children }) {
  return (
    <div
      onClick={() => onSelect(method.id)}
      style={{ marginBottom: 10, border: `2px solid ${selected ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 14, overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.2s', background: 'var(--bg-surface)' }}
    >
      <div style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: selected ? 'rgba(79,70,229,0.12)' : 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: selected ? 'var(--primary)' : 'var(--text-muted)', transition: 'all 0.2s', flexShrink: 0 }}>
          {method.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{method.label}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{method.sub}</div>
        </div>
        <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${selected ? 'var(--primary)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {selected && <div style={{ width: 8, height: 8, background: 'var(--primary)', borderRadius: '50%' }} />}
        </div>
      </div>
      <AnimatePresence>
        {selected && children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 14px 14px', borderTop: '1px solid var(--border)' }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PaymentScreen() {
  const navigate = useNavigate();
  const { purchase } = useCart();

  const summary = JSON.parse(sessionStorage.getItem('ro_order_summary') || 'null') || { subtotal: 0, discountAmt: 0, total: 0, channel: 'ccavenue' };
  const channel = summary.channel ?? 'ccavenue';

  const iapFee = channel === 'inapp' ? Math.round(summary.total * 0.18) : 0;
  const finalTotal = summary.total + iapFee;

  const [selectedMethod, setSelectedMethod] = useState('card');
  const [cardNum, setCardNum]   = useState('');
  const [expiry, setExpiry]     = useState('');
  const [cvv, setCvv]           = useState('');
  const [cardName, setCardName] = useState('');
  const [upiId, setUpiId]       = useState('');
  const [bank, setBank]         = useState('');
  const [loading, setLoading]   = useState(false);

  const handlePay = () => {
    setLoading(true);
    setTimeout(() => {
      purchase();
      navigate('/success', { replace: true });
    }, 1400);
  };

  const inputStyle = {
    width: '100%', background: 'var(--bg-dark)', border: '1.5px solid var(--border)',
    borderRadius: 10, padding: '11px 14px', color: 'var(--text-primary)',
    fontSize: 14, outline: 'none', fontFamily: 'Inter,sans-serif',
  };

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 300, opacity: 0 }}
      style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)' }}
    >
      {/* Header */}
      <div style={{ padding: '24px 20px 14px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <button onClick={() => navigate(-1)} style={{ color: 'var(--text-primary)', cursor: 'pointer' }}><HiArrowLeft /></button>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em' }}>
            {channel === 'inapp' ? 'In-App Purchase' : 'CC Avenue Payment'}
          </h1>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
            {channel === 'inapp' ? 'Billed via Google Play / App Store' : 'Secured by CC Avenue'}
          </div>
        </div>
      </div>

      {/* Amount pill */}
      <div style={{ margin: '16px 20px 0', padding: '12px 16px', background: channel === 'inapp' ? 'rgba(79,70,229,0.1)' : 'rgba(245,158,11,0.1)', borderRadius: 14, border: `1px solid ${channel === 'inapp' ? 'rgba(79,70,229,0.2)' : 'rgba(245,158,11,0.25)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Amount to pay</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: channel === 'inapp' ? 'var(--primary)' : 'var(--warning)' }}>₹{finalTotal.toLocaleString()}</div>
      </div>

      <div className="hide-scrollbar" style={{ flex: 1, padding: '16px 20px', overflowY: 'auto', paddingBottom: 100 }}>

        {/* ── CC Avenue flow ── */}
        {channel === 'ccavenue' && (
          <>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Payment Method</div>
            {CC_AVENUE_METHODS.map(m => (
              <RadioRow key={m.id} method={m} selected={selectedMethod === m.id} onSelect={setSelectedMethod}>
                {m.id === 'card' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 12 }}>
                    <input value={cardNum} onChange={e => setCardNum(fmtCard(e.target.value))} placeholder="Card Number" style={{ ...inputStyle, letterSpacing: '0.05em' }} />
                    <div style={{ display: 'flex', gap: 10 }}>
                      <input value={expiry} onChange={e => setExpiry(fmtExpiry(e.target.value))} placeholder="MM/YY" style={{ ...inputStyle, flex: 1 }} />
                      <input value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))} placeholder="CVV" type="password" style={{ ...inputStyle, flex: 1 }} />
                    </div>
                    <input value={cardName} onChange={e => setCardName(e.target.value)} placeholder="Cardholder Name" style={{ ...inputStyle, textTransform: 'uppercase' }} />
                  </div>
                )}
                {m.id === 'upi' && (
                  <div style={{ paddingTop: 12 }}>
                    <input value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@upi" style={inputStyle} />
                  </div>
                )}
                {m.id === 'netbanking' && (
                  <div style={{ paddingTop: 12 }}>
                    <select value={bank} onChange={e => setBank(e.target.value)} style={{ ...inputStyle, appearance: 'none' }}>
                      <option value="">Select your bank</option>
                      {['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Yes Bank', 'Bank of Baroda', 'Punjab National Bank'].map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                )}
              </RadioRow>
            ))}
          </>
        )}

        {/* ── In-App Purchase flow ── */}
        {channel === 'inapp' && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', background: 'rgba(79,70,229,0.08)', border: '2px solid var(--primary)', borderRadius: 14 }}>
              <div style={{ color: 'var(--primary)', flexShrink: 0 }}><IconPhone /></div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>In-App Purchase</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Billed securely via Google Play / App Store</div>
              </div>
            </div>
            {iapFee > 0 && (
              <div style={{ marginTop: 12, padding: '12px 14px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 12, fontSize: 13, color: 'var(--warning)', fontWeight: 500, lineHeight: 1.5 }}>
                An 18% convenience fee of ₹{iapFee.toLocaleString()} applies for in-app billing.
              </div>
            )}
          </div>
        )}

        {/* Order breakdown */}
        <div style={{ background: 'var(--bg-surface)', padding: 16, borderRadius: 16, border: '1px solid var(--border)', marginTop: 4 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Order Breakdown</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: 'var(--text-muted)' }}>
            <span>Subtotal</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>₹{summary.subtotal.toLocaleString()}</span>
          </div>
          {summary.discountAmt > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
              <span style={{ color: 'var(--success)' }}>Discount</span>
              <span style={{ color: 'var(--success)', fontWeight: 600 }}>−₹{summary.discountAmt.toLocaleString()}</span>
            </div>
          )}
          {iapFee > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
              <span style={{ color: 'var(--warning)' }}>Convenience Fee (18%)</span>
              <span style={{ color: 'var(--warning)', fontWeight: 600 }}>+₹{iapFee.toLocaleString()}</span>
            </div>
          )}
          <div style={{ height: 1, background: 'var(--border)', margin: '10px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 800 }}>
            <span>Total</span>
            <span style={{ color: channel === 'inapp' ? 'var(--primary)' : 'var(--warning)' }}>₹{finalTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px 20px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-dark)' }}>
        <button className="btn-primary" onClick={handlePay} disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
          {loading
            ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
                Processing…
              </span>
            : <><HiShieldCheck size={18} /> Pay ₹{finalTotal.toLocaleString()}</>
          }
        </button>
      </div>
    </motion.div>
  );
}
