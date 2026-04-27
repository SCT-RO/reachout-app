import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { getPurchased, saveAssignment } from '../utils/storage';
import { courses } from '../data/courses';
import {
  HiArrowLeft, HiCloudArrowUp, HiXMark,
  HiDocument, HiMusicalNote, HiVideoCamera, HiPhoto,
} from '../components/Icons';

function fmtBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(name) {
  const ext = name.split('.').pop().toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return <HiPhoto />;
  if (['mp3', 'wav', 'm4a'].includes(ext)) return <HiMusicalNote />;
  if (['mp4', 'mov', 'avi'].includes(ext)) return <HiVideoCamera />;
  return <HiDocument />;
}

// Floating label textarea
function FloatTextarea({ id, label, value, onChange, maxLength, error }) {
  return (
    <div style={{ position: 'relative' }}>
      <textarea
        id={id}
        placeholder=" "
        value={value}
        onChange={e => onChange(e.target.value)}
        maxLength={maxLength}
        style={{
          width: '100%',
          background: 'var(--bg-surface)',
          border: `1.5px solid ${error ? 'var(--error)' : 'var(--border)'}`,
          borderRadius: 14,
          padding: '28px 14px 10px 14px',
          color: 'var(--text-primary)',
          fontSize: 14,
          outline: 'none',
          fontFamily: 'Inter,sans-serif',
          resize: 'none',
          minHeight: 120,
          lineHeight: 1.6,
        }}
      />
      <label
        htmlFor={id}
        style={{
          position: 'absolute', left: 14, top: value ? 8 : 18,
          fontSize: value ? 10 : 14,
          color: value ? 'var(--primary)' : 'var(--text-muted)',
          fontWeight: value ? 700 : 400,
          textTransform: value ? 'uppercase' : 'none',
          letterSpacing: value ? '0.05em' : 'normal',
          pointerEvents: 'none', transition: 'all 0.2s',
        }}
      >
        {label}
      </label>
      {maxLength && (
        <div style={{ position: 'absolute', bottom: 10, right: 12, fontSize: 11, color: 'var(--text-muted)' }}>
          {value.length}/{maxLength}
        </div>
      )}
      {error && <div style={{ fontSize: 12, color: 'var(--error-text)', marginTop: 5, paddingLeft: 4 }}>{error}</div>}
    </div>
  );
}

export default function SubmitAssignmentScreen() {
  const navigate = useNavigate();
  const { currentUser, showToast } = useApp();

  const purchased = getPurchased(currentUser?.userId || '')
    .map(p => courses.find(c => c.id === p.id) || p)
    .filter(Boolean);

  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const fileRef = useRef(null);

  const selectedCourse = courses.find(c => c.id === Number(courseId));

  const canSubmit = courseId && title.trim() && desc.trim() && file;

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setErrors(p => ({ ...p, file: null }));
  };

  const handleSubmit = () => {
    const errs = {};
    if (!courseId) errs.course = 'Please select a course.';
    if (!title.trim()) errs.title = 'Title is required.';
    if (!desc.trim()) errs.desc = 'Description is required.';
    if (!file) errs.file = 'Please attach your assignment.';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setTimeout(() => {
      const assignment = {
        id: `a_${Date.now()}`,
        courseId: Number(courseId),
        courseName: selectedCourse?.title || '',
        title: title.trim(),
        description: desc.trim(),
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        submittedAt: new Date().toISOString(),
      };
      saveAssignment(currentUser.userId, assignment);
      sessionStorage.setItem('ro_last_assignment', JSON.stringify(assignment));
      navigate('/profile/assignment/success', { replace: true });
    }, 1500);
  };

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
      transition={{ duration: 0.22 }}
      style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)', position: 'relative' }}
    >
      {/* Header */}
      <div style={{ padding: '24px 20px 14px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <button onClick={() => navigate('/profile')} style={{ color: 'var(--text-primary)', cursor: 'pointer' }}><HiArrowLeft /></button>
        <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em' }}>Submit Assignment</h1>
      </div>

      <div className="hide-scrollbar" style={{ flex: 1, padding: '20px', overflowY: 'auto', paddingBottom: 110 }}>

        {/* Course selector */}
        <div style={{ marginBottom: 16, position: 'relative' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Course</div>
          <div
            onClick={() => setShowDropdown(p => !p)}
            style={{ background: 'var(--bg-surface)', border: `1.5px solid ${errors.course ? 'var(--error)' : 'var(--border)'}`, borderRadius: 14, padding: '13px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14 }}
          >
            <span style={{ color: selectedCourse ? 'var(--text-primary)' : 'var(--text-muted)' }}>
              {selectedCourse ? selectedCourse.title : 'Select a course…'}
            </span>
            <motion.span animate={{ rotate: showDropdown ? 180 : 0 }} style={{ fontSize: 12, color: 'var(--text-muted)' }}>▼</motion.span>
          </div>
          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 10px 32px rgba(0,0,0,0.3)', marginTop: 4 }}
              >
                {purchased.length === 0 ? (
                  <div style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: 13 }}>No enrolled courses yet.</div>
                ) : purchased.map(c => (
                  <div
                    key={c.id}
                    onClick={() => { setCourseId(String(c.id)); setShowDropdown(false); setErrors(p => ({ ...p, course: null })); }}
                    style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer', fontSize: 14, fontWeight: courseId === String(c.id) ? 700 : 400, color: courseId === String(c.id) ? 'var(--primary)' : 'var(--text-primary)', background: courseId === String(c.id) ? 'rgba(79,70,229,0.06)' : 'transparent' }}
                  >
                    {c.title}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          {errors.course && <div style={{ fontSize: 12, color: 'var(--error-text)', marginTop: 5, paddingLeft: 4 }}>{errors.course}</div>}
        </div>

        {/* Title */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ position: 'relative' }}>
            <div className="input-wrap">
              <input
                className="input-field"
                placeholder=" "
                value={title}
                onChange={e => { if (e.target.value.length <= 100) { setTitle(e.target.value); setErrors(p => ({ ...p, title: null })); }}}
                style={{ paddingRight: 52, ...(errors.title ? { borderColor: 'var(--error)' } : {}) }}
                id="asgn-title"
              />
              <label className="input-label" htmlFor="asgn-title">Assignment Title</label>
            </div>
            <div style={{ position: 'absolute', right: 14, bottom: 10, fontSize: 11, color: 'var(--text-muted)' }}>{title.length}/100</div>
          </div>
          {errors.title && <div style={{ fontSize: 12, color: 'var(--error-text)', marginTop: 5, paddingLeft: 4 }}>{errors.title}</div>}
        </div>

        {/* Description */}
        <div style={{ marginBottom: 20 }}>
          <FloatTextarea
            id="asgn-desc" label="Add a description or notes…"
            value={desc} onChange={v => { setDesc(v); setErrors(p => ({ ...p, desc: null })); }}
            maxLength={500} error={errors.desc}
          />
        </div>

        {/* File upload */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Attachment</div>
          <input
            ref={fileRef}
            type="file"
            accept=".mp3,.mp4,.pdf,.jpeg,.jpg,.png,.doc,.docx"
            style={{ display: 'none' }}
            onChange={handleFile}
          />
          {!file ? (
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={() => fileRef.current?.click()}
              style={{ border: `2px dashed ${errors.file ? 'var(--error)' : 'var(--border)'}`, borderRadius: 16, padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, cursor: 'pointer', background: 'transparent', transition: 'border-color 0.2s' }}
            >
              <div style={{ color: 'var(--text-muted)', opacity: 0.6 }}><HiCloudArrowUp /></div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Attach your assignment</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>MP3, MP4, PDF, JPEG, PNG, DOCX · up to 50 MB</div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(79,70,229,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                {fileIcon(file.name)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{fmtBytes(file.size)}</div>
              </div>
              <button onClick={() => setFile(null)} style={{ color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0 }}><HiXMark /></button>
            </motion.div>
          )}
          {errors.file && <div style={{ fontSize: 12, color: 'var(--error-text)', marginTop: 6, paddingLeft: 4 }}>{errors.file}</div>}
        </div>
      </div>

      {/* Submit button */}
      <div style={{ padding: '14px 20px 28px', borderTop: '1px solid var(--border)', background: 'var(--bg-dark)' }}>
        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
          style={{ opacity: canSubmit && !loading ? 1 : 0.45 }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <motion.div
                animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }}
              />
              Submitting…
            </span>
          ) : 'Submit Assignment'}
        </button>
      </div>
    </motion.div>
  );
}
