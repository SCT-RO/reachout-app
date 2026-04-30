import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useProgress } from '../hooks/useProgress';
import { useCourses } from '../hooks/useCourses';
import { useCourseStructure } from '../hooks/useCourseStructure';
import { getPurchased, getModuleCompletionStatus } from '../utils/storage';
import { findCoursePackage } from '../data/courses';
import PaywallSheet from '../components/PaywallSheet';
import {
  HiArrowLeft, HiLockClosed, HiCheck, HiPlay,
  HiVideoCamera, HiMusicalNote, HiDocument, HiPhoto,
  HiBookOpen, HiClipboardList, HiPaperClip, HiCheckCircle,
} from '../components/Icons';

// ─── Module Completion Checklist ─────────────────────────────────────────────
function ChecklistRow({ icon: Icon, label, detail, done, actionLabel, onAction }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: done ? 'rgba(34,197,94,0.12)' : 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={18} style={{ color: done ? '#22C55E' : 'var(--text-muted)' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 11, color: done ? '#22C55E' : 'var(--text-muted)' }}>{done ? 'Complete' : detail}</div>
      </div>
      {!done && actionLabel && (
        <motion.button whileTap={{ scale: 0.96 }} onClick={onAction}
          style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary-text)', background: 'rgba(79,70,229,0.1)', border: '1px solid var(--primary)', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontFamily: 'Inter,sans-serif', flexShrink: 0 }}>
          {actionLabel}
        </motion.button>
      )}
      {done && <HiCheckCircle size={18} style={{ color: '#22C55E', flexShrink: 0 }} />}
    </div>
  );
}

function ModuleCompletionChecklist({ courseId, moduleId, completionStatus, allModContent, completedInMod, nextMod, navigate }) {
  const { contentComplete, quizSubmitted, assignmentSubmitted, fullyComplete } = completionStatus;
  const cardStyle = fullyComplete
    ? { background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 16, padding: 16, marginTop: 24 }
    : { background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 16, marginTop: 24 };

  return (
    <div style={cardStyle}>
      {fullyComplete ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, marginBottom: 6 }}>🎉</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#22C55E', marginBottom: 4 }}>Module Complete!</div>
          {nextMod && (
            <>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>Next: {nextMod.title}</div>
              <motion.button whileTap={{ scale: 0.97 }} className="btn-primary" style={{ width: '100%' }}
                onClick={() => navigate(`/course/${courseId}/module/${nextMod.id}`)}>
                Continue to Next Module →
              </motion.button>
            </>
          )}
        </div>
      ) : (
        <>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Complete this module</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>Finish all 3 steps to unlock the next module</div>
          <ChecklistRow icon={HiBookOpen} label="Watch / Read all lessons" detail={`${completedInMod.length}/${allModContent.length} completed`} done={contentComplete} />
          <ChecklistRow icon={HiClipboardList} label="Take the module quiz" detail={quizSubmitted ? 'Attempted' : 'Not started'} done={quizSubmitted}
            actionLabel={quizSubmitted ? 'Retake Quiz' : 'Take Quiz'} onAction={() => navigate(`/course/${courseId}/module/${moduleId}/quiz`)} />
          <ChecklistRow icon={HiPaperClip} label="Submit your assignment" detail={assignmentSubmitted ? 'Submitted' : 'Not submitted'} done={assignmentSubmitted}
            actionLabel="View Assignment" onAction={() => navigate(`/course/${courseId}/module/${moduleId}/assignment`)} />
        </>
      )}
    </div>
  );
}

const TYPE_META = {
  video: { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', Icon: HiVideoCamera },
  audio: { color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)', Icon: HiMusicalNote },
  pdf:   { color: '#EF4444', bg: 'rgba(239,68,68,0.12)',  Icon: HiDocument },
  image: { color: '#22C55E', bg: 'rgba(34,197,94,0.12)',  Icon: HiPhoto },
};

function ContentTypeIcon({ type }) {
  const meta = TYPE_META[type] || TYPE_META.video;
  const { Icon, color, bg } = meta;
  return (
    <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={16} style={{ color }} />
    </div>
  );
}

export default function SubmoduleScreen() {
  const { courseId, moduleId, submoduleId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { courses, isLoading: coursesLoading } = useCourses();
  const { isContentCompleted } = useProgress(currentUser?.userId, courseId);
  const [paywallContent, setPaywallContent] = useState(null);

  const course = courses.find(c => String(c.id) === courseId);
  const pkg = course ? findCoursePackage(course.title) : null;
  const { modules, isLoading: structLoading } = useCourseStructure(course?.title);
  const isLoading = coursesLoading || (structLoading && modules.length === 0);
  const mod = modules.find(m => m.id === moduleId);
  const sub = mod?.submodules?.find(s => s.id === submoduleId);

  const isPurchased = useMemo(() => {
    if (!currentUser) return false;
    const purchased = getPurchased(currentUser.userId);
    return purchased.some(p => String(p.id) === courseId) || (course?.price === 0);
  }, [currentUser, courseId, course]);

  // Module-level completion (parent module, not submodule)
  const allModContent = useMemo(() => {
    if (!mod) return [];
    return (mod.submodules || []).flatMap(s => s.content || []);
  }, [mod]);

  const { getCourseProgress, isModuleUnlocked } = useProgress(currentUser?.userId, courseId);
  const progressData = getCourseProgress();
  const completedAllContent = progressData.completedContent || [];
  const completedInMod = completedAllContent.filter(id => allModContent.some(c => c.id === id));

  const completionStatus = currentUser ? getModuleCompletionStatus(
    currentUser.userId, courseId, moduleId, completedInMod, allModContent.length
  ) : { contentComplete: false, quizSubmitted: false, assignmentSubmitted: false, fullyComplete: false };

  const nextMod = modules.find(m => m.order === (mod?.order ?? 0) + 1);

  if (isLoading && !course) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  if (!course || !mod || !sub) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', gap: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Submodule not found</div>
        <button className="btn-outline" style={{ width: 160 }} onClick={() => navigate(-1)}>← Back</button>
      </div>
    );
  }

  const handleContentTap = (item) => {
    const available = isPurchased;
    if (!available) { setPaywallContent(item); return; }
    navigate(`/course/${courseId}/content/${item.id}`, {
      state: { from: `/course/${courseId}/module/${moduleId}/submodule/${submoduleId}` }
    });
  };

  const completedCount = (sub.content || []).filter(c => isContentCompleted(c.id)).length;
  const total = (sub.content || []).length;
  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.22 }}
      style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)', position: 'relative', overflow: 'hidden' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 16px 14px', flexShrink: 0, borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => navigate(`/course/${courseId}/module/${moduleId}`)} aria-label="Back" style={{ color: 'var(--text-primary)', padding: 4 }}>
          <HiArrowLeft size={22} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.title}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{mod.title}</div>
        </div>
      </div>

      {/* Mini progress */}
      {pct > 0 && (
        <div style={{ padding: '10px 16px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 5 }}>
            <span>{completedCount} of {total} completed</span>
            <span style={{ color: pct === 100 ? 'var(--success-text)' : 'var(--accent-text)', fontWeight: 600 }}>{pct}%</span>
          </div>
          <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{ height: '100%', background: pct === 100 ? 'var(--success)' : 'var(--primary)', borderRadius: 2 }}
            />
          </div>
        </div>
      )}

      {/* Content list */}
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 32px' }}>
        {sub.description && (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 18 }}>{sub.description}</p>
        )}

        {(sub.content || []).map(item => {
          const available = isPurchased;
          const completed = isContentCompleted(item.id);
          return (
            <motion.button
              key={item.id}
              whileTap={available ? { scale: 0.985 } : {}}
              onClick={() => handleContentTap(item)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
                borderBottom: '1px solid var(--border)', width: '100%', textAlign: 'left',
                background: 'transparent', color: 'var(--text-primary)',
                opacity: !available ? 0.5 : 1, cursor: available ? 'pointer' : 'default',
              }}
            >
              <ContentTypeIcon type={item.type} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {item.duration && <span>{item.duration}</span>}
                  {item.size && <span>{item.size}</span>}
                </div>
              </div>
              <div style={{ flexShrink: 0, color: completed ? 'var(--success)' : available ? 'var(--primary-text)' : 'var(--text-muted)' }}>
                {completed ? <HiCheck size={18} /> : available ? <HiPlay size={18} /> : <HiLockClosed size={16} />}
              </div>
            </motion.button>
          );
        })}

        {/* Module Completion Checklist */}
        {isPurchased && (
          <ModuleCompletionChecklist
            courseId={courseId}
            moduleId={moduleId}
            completionStatus={completionStatus}
            allModContent={allModContent}
            completedInMod={completedInMod}
            nextMod={nextMod}
            navigate={navigate}
          />
        )}
      </div>

      <PaywallSheet
        visible={!!paywallContent}
        course={course}
        onClose={() => setPaywallContent(null)}
      />
    </motion.div>
  );
}
