import { useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useCourses } from '../hooks/useCourses';
import { useCourseStructure } from '../hooks/useCourseStructure';
import { useApp } from '../context/AppContext';
import { findCoursePackage } from '../data/courses';
import { getModuleAssignmentByOrder } from '../data/assignments';
import { getModuleAssignmentData, saveModuleAssignmentData } from '../utils/storage';
import { useProgress } from '../hooks/useProgress';
import {
  HiArrowLeft, HiCheck, HiClock, HiClipboardList, HiPaperClip, HiDocumentText,
  HiCloudArrowUp, HiXMark, HiCheckCircle,
} from '../components/Icons';

function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function ObjectivesSection({ objectives }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {objectives.map((obj, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <HiCheckCircle size={16} style={{ color: 'var(--primary-text)', flexShrink: 0, marginTop: 2 }} />
          <span style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>{obj}</span>
        </div>
      ))}
    </div>
  );
}

export default function ModuleAssignmentScreen() {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { courses, isLoading } = useCourses();
  const { showToast } = useApp();

  const userId = currentUser?.userId;
  const course = courses.find(c => String(c.id) === courseId);
  const pkg = course ? findCoursePackage(course.title) : null;
  const { modules } = useCourseStructure(course?.title);
  // Get mod from Airtable modules (moduleId in URL is an Airtable record ID)
  const mod = modules.find(m => m.id === moduleId);
  // Look up assignment by module order since Airtable record IDs don't match static assignment IDs
  const assignment = useMemo(() => {
    if (!pkg || !mod) return null;
    return getModuleAssignmentByOrder(pkg.id, mod.order);
  }, [pkg, mod]);

  const existingData = useMemo(() =>
    userId ? getModuleAssignmentData(userId, courseId, moduleId) : null,
  [userId, courseId, moduleId]);

  const { isModuleUnlocked } = useProgress(userId, courseId);
  const nextMod = modules.find(m => m.order === (mod?.order ?? 0) + 1);

  // View state: 'view' if already submitted and not resubmitting, else 'form'
  const [formMode, setFormMode] = useState(!existingData?.submitted);
  const [selectedFile, setSelectedFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionRecord, setSubmissionRecord] = useState(null);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  };

  const handleSubmit = () => {
    if (!selectedFile || submitting) return;
    setSubmitting(true);
    setTimeout(() => {
      const attemptNumber = (existingData?.submissions?.length || 0) + 1;
      const sub = {
        id: `sub_${Date.now()}`,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
        notes: notes.trim(),
        submittedAt: new Date().toISOString(),
        attemptNumber,
      };
      const prevSubs = existingData?.submissions || [];
      const newData = {
        submissions: [...prevSubs, sub],
        submitted: true,
        latestSubmission: sub,
      };
      if (userId) saveModuleAssignmentData(userId, courseId, moduleId, newData);
      setSubmissionRecord(sub);
      setSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  const handleNextModule = () => {
    if (!nextMod) { showToast('No next module available'); return; }
    if (isModuleUnlocked(nextMod.id, { modules })) {
      navigate(`/course/${courseId}/module/${nextMod.id}`);
    } else {
      showToast('Complete this module first to unlock the next one');
    }
  };

  if (isLoading && !course) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  if (!assignment) {
    return (
      <motion.div
        initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.22 }}
        style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', gap: 16, padding: 24 }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, textAlign: 'center' }}>Assignment not available for this module.</div>
        <button className="btn-outline" onClick={() => navigate(-1)}>← Back</button>
      </motion.div>
    );
  }

  const latestSub = existingData?.latestSubmission;
  const isAlreadySubmitted = !!existingData?.submitted;

  // ── BRIEF SECTION (always shown) ───────────────────────────────────────────
  const brief = (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, lineHeight: 1.25 }}>{assignment.title}</div>

      {/* Est. time pill */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(79,70,229,0.1)', color: 'var(--primary-text)', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, marginBottom: 14 }}>
        <HiClock size={13} /> {assignment.estimatedTime}
      </div>

      <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: 16 }}>
        {assignment.briefDescription}
      </p>

      {/* Objectives */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Objectives</div>
        <ObjectivesSection objectives={assignment.objectives} />
      </div>

      {/* Deliverables */}
      <div style={{ padding: '12px 14px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Deliverables</div>
        <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.55 }}>{assignment.deliverables}</p>
      </div>

      {/* Accepted formats */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Accepted Formats</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {assignment.acceptedFormats.map(f => (
            <span key={f} style={{ fontSize: 11, fontWeight: 700, background: 'var(--border)', color: 'var(--text-muted)', padding: '3px 9px', borderRadius: 6 }}>
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.22 }}
      style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)', overflow: 'hidden' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 16px 14px', flexShrink: 0, borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => navigate(`/course/${courseId}/module/${moduleId}`)} style={{ color: 'var(--text-primary)', padding: 4 }}>
          <HiArrowLeft size={22} />
        </button>
        <div style={{ flex: 1, fontSize: 15, fontWeight: 700 }}>Module Assignment</div>
        {isAlreadySubmitted && !formMode && (
          <button
            onClick={() => setFormMode(true)}
            style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary-text)', padding: '4px 8px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}
          >
            Resubmit
          </button>
        )}
      </div>

      <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 40px' }}>
        {brief}

        <div style={{ height: 1, background: 'var(--border)', marginBottom: 20 }} />

        {/* VIEW STATE — already submitted, not resubmitting */}
        {isAlreadySubmitted && !formMode && (
          <div>
            <div style={{ padding: '16px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 14, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <HiCheckCircle size={20} style={{ color: '#22C55E', flexShrink: 0 }} />
                <div style={{ fontSize: 15, fontWeight: 700, color: '#22C55E' }}>Assignment Submitted</div>
              </div>
              {latestSub && (
                <>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 2 }}>{latestSub.fileName}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Submitted on {formatDate(latestSub.submittedAt)}</div>
                  {existingData?.submissions?.length > 1 && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                      {existingData.submissions.length} submission{existingData.submissions.length !== 1 ? 's' : ''} total
                    </div>
                  )}
                </>
              )}
            </div>
            <motion.button whileTap={{ scale: 0.97 }} className="btn-outline"
              style={{ width: '100%' }}
              onClick={() => setFormMode(true)}
            >
              Resubmit Assignment
            </motion.button>
          </div>
        )}

        {/* FORM STATE */}
        {formMode && !submitted && (
          <div>
            {/* Previous submission info */}
            {isAlreadySubmitted && latestSub && (
              <div style={{ padding: '10px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                Previous: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{latestSub.fileName}</span> on {formatDate(latestSub.submittedAt)}
              </div>
            )}

            {/* File upload zone */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.xlsx,.zip,.py,.ipynb,.png,.jpg,.jpeg"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            {!selectedFile ? (
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: '100%', padding: '28px 16px', border: '2px dashed var(--border)',
                  borderRadius: 14, background: 'var(--bg-surface)', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 16,
                }}
              >
                <HiCloudArrowUp style={{ color: 'var(--primary-text)' }} />
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Tap to attach your assignment</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{assignment.acceptedFormats.join(', ')}</div>
              </motion.button>
            ) : (
              <div style={{ padding: '12px 14px', background: 'rgba(79,70,229,0.08)', border: '1px solid var(--primary)', borderRadius: 12, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                <HiDocumentText size={20} style={{ color: 'var(--primary-text)', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedFile.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{formatBytes(selectedFile.size)}</div>
                </div>
                <button onClick={() => setSelectedFile(null)} style={{ color: 'var(--text-muted)', padding: 4, flexShrink: 0 }}>
                  <HiXMark size={18} />
                </button>
              </div>
            )}

            {/* Notes */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Notes (optional)</label>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{notes.length}/300</span>
              </div>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value.slice(0, 300))}
                placeholder="Any notes for your submission…"
                rows={3}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12,
                  padding: '10px 12px', fontSize: 13, color: 'var(--text-primary)',
                  fontFamily: 'Inter,sans-serif', resize: 'none', outline: 'none',
                }}
              />
            </div>

            {/* Submit button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="btn-primary"
              disabled={!selectedFile || submitting}
              style={{ width: '100%', opacity: !selectedFile ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              onClick={handleSubmit}
            >
              {submitting ? (
                <>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite' }} />
                  Submitting…
                </>
              ) : 'Submit Assignment'}
            </motion.button>
          </div>
        )}

        {/* SUCCESS STATE */}
        {submitted && submissionRecord && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12, marginBottom: 24 }}>
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 280, damping: 20 }}
                style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <HiCheckCircle size={32} style={{ color: '#22C55E' }} />
              </motion.div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#22C55E' }}>Assignment Submitted Successfully!</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {submissionRecord.fileName} · {formatDate(submissionRecord.submittedAt)}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <motion.button whileTap={{ scale: 0.97 }} className="btn-outline"
                onClick={() => navigate(`/course/${courseId}/module/${moduleId}`)}>
                ← Back to Module
              </motion.button>
              {nextMod && (
                <motion.button whileTap={{ scale: 0.97 }} className="btn-primary" onClick={handleNextModule}>
                  Next Module →
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
