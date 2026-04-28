import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useProgress } from '../hooks/useProgress';
import { useCourses } from '../hooks/useCourses';
import { getPurchased } from '../utils/storage';
import { findCoursePackage } from '../data/courses';
import PaywallSheet from '../components/PaywallSheet';
import {
  HiArrowLeft, HiChevronRight, HiLockClosed, HiCheck,
  HiVideoCamera, HiMusicalNote, HiDocument, HiPhoto, HiPlay,
} from '../components/Icons';

const TYPE_META = {
  video: { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', Icon: HiVideoCamera },
  audio: { color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)', Icon: HiMusicalNote },
  pdf:   { color: '#EF4444', bg: 'rgba(239,68,68,0.12)',  Icon: HiDocument },
  image: { color: '#22C55E', bg: 'rgba(34,197,94,0.12)',  Icon: HiPhoto },
};

function ContentTypeIcon({ type, size = 16 }) {
  const meta = TYPE_META[type] || TYPE_META.video;
  const { Icon, color, bg } = meta;
  return (
    <div style={{ width: size + 12, height: size + 12, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={size} style={{ color }} />
    </div>
  );
}

function ContentRow({ item, available, completed, onTap }) {
  return (
    <motion.button
      whileTap={available ? { scale: 0.985 } : {}}
      onClick={onTap}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
        borderBottom: '1px solid var(--border)', width: '100%', textAlign: 'left',
        background: 'transparent', color: 'var(--text-primary)',
        opacity: !available ? 0.5 : 1, cursor: available ? 'pointer' : 'default',
      }}
    >
      <ContentTypeIcon type={item.type} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.title}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
          {item.duration && <span>{item.duration}</span>}
          {item.size && <span>{item.size}</span>}
          {item.isPreview && (
            <span style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--warning)', padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>
              PREVIEW
            </span>
          )}
        </div>
      </div>
      <div style={{ flexShrink: 0, color: completed ? 'var(--success)' : available ? 'var(--primary-text)' : 'var(--text-muted)' }}>
        {completed ? <HiCheck size={18} /> : available ? <HiPlay size={18} /> : <HiLockClosed size={16} />}
      </div>
    </motion.button>
  );
}

function SubmoduleRow({ sub, courseId, moduleId, completedContent, navigate }) {
  const allContent = sub.content || [];
  const completedInSub = allContent.filter(c => completedContent.includes(c.id)).length;
  const isDone = completedInSub === allContent.length && allContent.length > 0;
  const types = [...new Set(allContent.map(c => c.type))];

  return (
    <motion.button
      whileTap={{ scale: 0.985 }}
      onClick={() => navigate(`/course/${courseId}/module/${moduleId}/submodule/${sub.id}`)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '14px',
        background: 'var(--bg-surface)', borderRadius: 14,
        border: `1px solid ${isDone ? 'rgba(34,197,94,0.25)' : 'var(--border)'}`,
        width: '100%', textAlign: 'left', color: 'var(--text-primary)',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{sub.title}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span>{allContent.length} lesson{allContent.length !== 1 ? 's' : ''}</span>
          <span>·</span>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {types.map(t => {
              const meta = TYPE_META[t];
              return meta ? <span key={t} style={{ width: 8, height: 8, borderRadius: '50%', background: meta.color, display: 'inline-block' }} /> : null;
            })}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {isDone ? (
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--success-text)', background: 'rgba(34,197,94,0.1)', padding: '3px 8px', borderRadius: 6 }}>Done</span>
        ) : completedInSub > 0 ? (
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--warning)', background: 'rgba(245,158,11,0.1)', padding: '3px 8px', borderRadius: 6 }}>
            {completedInSub}/{allContent.length}
          </span>
        ) : null}
        <HiChevronRight />
      </div>
    </motion.button>
  );
}

export default function ModuleDetailScreen() {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { courses } = useCourses();
  const { isContentCompleted, getCourseProgress } = useProgress(currentUser?.userId, courseId);
  const [paywallContent, setPaywallContent] = useState(null);

  const course = courses.find(c => String(c.id) === courseId);
  const pkg = course ? findCoursePackage(course.title) : null;
  const mod = pkg?.modules?.find(m => m.id === moduleId);

  const isPurchased = useMemo(() => {
    if (!currentUser) return false;
    const purchased = getPurchased(currentUser.userId);
    return purchased.some(p => String(p.id) === courseId) || (course?.price === 0);
  }, [currentUser, courseId, course]);

  const progressData = getCourseProgress();
  const completedContent = progressData.completedContent || [];

  if (!course || !pkg || !mod) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', gap: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Module not found</div>
        <button className="btn-outline" style={{ width: 160 }} onClick={() => navigate(-1)}>← Back</button>
      </div>
    );
  }

  const handleContentTap = (item) => {
    const available = isPurchased || item.isPreview;
    if (!available) { setPaywallContent(item); return; }
    navigate(`/course/${courseId}/content/${item.id}`, {
      state: { from: `/course/${courseId}/module/${moduleId}` }
    });
  };

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.22 }}
      style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)', position: 'relative', overflow: 'hidden' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 16px 14px', flexShrink: 0, borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => navigate(`/course/${courseId}/modules`)} aria-label="Back" style={{ color: 'var(--text-primary)', padding: 4 }}>
          <HiArrowLeft size={22} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mod.title}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
            Module {pkg.modules.findIndex(m => m.id === moduleId) + 1} of {pkg.modules.length}
          </div>
        </div>
      </div>

      <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 32px' }}>
        {mod.description && (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 20 }}>{mod.description}</p>
        )}

        {mod.type === 'content' ? (
          /* Direct content list */
          <div>
            {(mod.content || []).map(item => (
              <ContentRow
                key={item.id}
                item={item}
                available={isPurchased || item.isPreview}
                completed={isContentCompleted(item.id)}
                onTap={() => handleContentTap(item)}
              />
            ))}
          </div>
        ) : (
          /* Submodule cards */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(mod.submodules || []).map(sub => (
              <SubmoduleRow
                key={sub.id}
                sub={sub}
                courseId={courseId}
                moduleId={moduleId}
                completedContent={completedContent}
                navigate={navigate}
              />
            ))}
          </div>
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
