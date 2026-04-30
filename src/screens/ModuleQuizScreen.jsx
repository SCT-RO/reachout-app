import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useCourses } from '../hooks/useCourses';
import { useCourseStructure } from '../hooks/useCourseStructure';
import { findCoursePackage } from '../data/courses';
import { getModuleQuizByOrder } from '../data/quizzes';
import { getQuizResults, saveQuizResults } from '../utils/storage';
import { HiArrowLeft, HiXCircle, HiCheckCircle } from '../components/Icons';

// ─── Fisher-Yates shuffle ─────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuestions(rawQuestions) {
  return rawQuestions.map(q => {
    const indexed = q.options.map((opt, i) => ({ text: opt, originalIndex: i }));
    const shuffled = shuffle(indexed);
    const newCorrect = shuffled.findIndex(o => o.originalIndex === q.correctAnswer);
    return {
      ...q,
      shuffledOptions: shuffled.map(o => o.text),
      correctAnswer: newCorrect,
    };
  });
}

// ─── Circular progress ring ───────────────────────────────────────────────────
function ScoreRing({ score, total, pass }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const pct = total > 0 ? score / total : 0;
  const dash = circ * pct;
  const color = pass ? '#22C55E' : '#F59E0B';
  return (
    <svg width={112} height={112} viewBox="0 0 112 112">
      <circle cx={56} cy={56} r={r} fill="none" stroke="var(--border)" strokeWidth={8} />
      <circle cx={56} cy={56} r={r} fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 56 56)" style={{ transition: 'stroke-dasharray 0.6s ease' }} />
      <text x={56} y={60} textAnchor="middle" fontSize={22} fontWeight={800}
        fill={color} fontFamily="Inter,sans-serif">{score}/{total}</text>
    </svg>
  );
}

export default function ModuleQuizScreen() {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { courses, isLoading } = useCourses();

  const course = courses.find(c => String(c.id) === courseId);
  const pkg = course ? findCoursePackage(course.title) : null;
  const { modules, isLoading: structLoading } = useCourseStructure(course?.title);
  // Get mod from Airtable modules (moduleId in URL is an Airtable record ID)
  const mod = modules.find(m => m.id === moduleId);
  // Look up quiz by module order since Airtable record IDs don't match static quiz IDs
  const rawQuiz = useMemo(() => {
    if (!pkg || !mod) return null;
    return getModuleQuizByOrder(pkg.id, mod.order);
  }, [pkg, mod]);

  const userId = currentUser?.userId;

  const [questions, setQuestions] = useState([]);
  useEffect(() => {
    if (rawQuiz) setQuestions(buildQuestions(rawQuiz.questions));
  }, [rawQuiz]);

  const [screen, setScreen] = useState('quiz'); // 'quiz' | 'results'
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]); // [{questionId, selected, correct}]

  const existingResults = useMemo(() =>
    userId ? getQuizResults(userId, courseId, moduleId) : null,
  [userId, courseId, moduleId]);

  // ── Results state ───────────────────────────────────────────────────────────
  const [results, setResults] = useState(null);

  const currentQ = questions[currentIdx];
  const total = questions.length;
  const progressPct = total > 0 ? ((currentIdx) / total) * 100 : 0;

  const handleCheck = () => {
    if (selected === null || checked) return;
    setChecked(true);
    setUserAnswers(prev => [...prev, {
      questionId: currentQ.id,
      selected,
      correct: selected === currentQ.correctAnswer,
    }]);
  };

  const handleNext = () => {
    if (currentIdx < total - 1) {
      setCurrentIdx(i => i + 1);
      setSelected(null);
      setChecked(false);
    } else {
      // Calculate score and save
      const allAnswers = [...userAnswers];
      const score = allAnswers.filter(a => a.correct).length;
      const passed = score >= Math.ceil(total / 2); // >=3/5
      const attempt = {
        score, total, passed,
        answers: allAnswers,
        completedAt: new Date().toISOString(),
      };

      const prev = userId ? getQuizResults(userId, courseId, moduleId) : null;
      const attempts = prev?.attempts ? [...prev.attempts, attempt] : [attempt];
      const bestScore = Math.max(...attempts.map(a => a.score));
      const newResults = { attempts, bestScore, submitted: true };

      if (userId) saveQuizResults(userId, courseId, moduleId, newResults);

      setResults({ attempt, allResults: newResults });
      setScreen('results');
    }
  };

  const handleRetake = () => {
    setQuestions(rawQuiz ? buildQuestions(rawQuiz.questions) : []);
    setCurrentIdx(0);
    setSelected(null);
    setChecked(false);
    setUserAnswers([]);
    setResults(null);
    setScreen('quiz');
  };

  if (isLoading && !course || structLoading && !mod) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  if (!rawQuiz) {
    return (
      <motion.div
        initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.22 }}
        style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', gap: 16, padding: 24 }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, textAlign: 'center' }}>Quiz not available for this module.</div>
        <button className="btn-outline" onClick={() => navigate(-1)}>← Back</button>
      </motion.div>
    );
  }

  // ── RESULTS SCREEN ─────────────────────────────────────────────────────────
  if (screen === 'results' && results) {
    const { attempt, allResults } = results;
    const pass = attempt.passed;
    const bestScore = allResults.bestScore;
    const prevBest = existingResults?.bestScore;

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
          <div style={{ flex: 1, fontSize: 15, fontWeight: 700 }}>Quiz Results</div>
        </div>

        <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '24px 20px 32px' }}>
          {/* Score */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <ScoreRing score={attempt.score} total={attempt.total} pass={pass} />
            <div style={{ fontSize: 18, fontWeight: 800, color: pass ? '#22C55E' : '#F59E0B' }}>
              {pass ? 'Great work! You passed.' : 'Keep going! Review and try again.'}
            </div>
            {typeof prevBest === 'number' && prevBest !== bestScore && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Best: {bestScore}/{attempt.total}</div>
            )}
            {existingResults && existingResults.attempts && existingResults.attempts.length > 1 && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Best: {bestScore}/{attempt.total} over {existingResults.attempts.length} attempts
              </div>
            )}
          </div>

          {/* Question review */}
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Review
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {attempt.answers.map((ans, i) => {
              const q = questions[i] || rawQuiz.questions[i];
              const isCorrect = ans.correct;
              return (
                <div key={ans.questionId} style={{
                  padding: '12px 14px', borderRadius: 12,
                  background: isCorrect ? 'rgba(34,197,94,0.07)' : 'rgba(239,68,68,0.07)',
                  border: `1px solid ${isCorrect ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{isCorrect ? '✓' : '✗'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, lineHeight: 1.4 }}>Q{i + 1}: {q.question}</div>
                      <div style={{ fontSize: 12, color: isCorrect ? '#22C55E' : '#EF4444' }}>
                        Your answer: {(q.shuffledOptions || q.options)[ans.selected]}
                      </div>
                      {!isCorrect && (
                        <div style={{ fontSize: 12, color: '#22C55E', marginTop: 2 }}>
                          Correct: {(q.shuffledOptions || q.options)[q.correctAnswer]}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pass ? (
              <>
                <motion.button whileTap={{ scale: 0.97 }} className="btn-primary"
                  onClick={() => navigate(`/course/${courseId}/module/${moduleId}/assignment`)}>
                  Continue to Assignment →
                </motion.button>
                <motion.button whileTap={{ scale: 0.97 }} className="btn-outline" onClick={handleRetake}>
                  Retake Quiz
                </motion.button>
              </>
            ) : (
              <>
                <motion.button whileTap={{ scale: 0.97 }} className="btn-primary" onClick={handleRetake}>
                  Retake Quiz
                </motion.button>
                <motion.button whileTap={{ scale: 0.97 }} className="btn-outline"
                  onClick={() => navigate(`/course/${courseId}/module/${moduleId}`)}>
                  Review Module
                </motion.button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // ── QUIZ SCREEN ────────────────────────────────────────────────────────────
  const isCorrectOption = (i) => checked && i === currentQ.correctAnswer;
  const isWrongSelected = (i) => checked && i === selected && i !== currentQ.correctAnswer;

  function optionStyle(i) {
    if (!checked) {
      return {
        border: `2px solid ${selected === i ? 'var(--primary)' : 'var(--border)'}`,
        background: selected === i ? 'rgba(79,70,229,0.08)' : 'var(--bg-surface)',
      };
    }
    if (isCorrectOption(i)) return { border: '2px solid #22C55E', background: 'rgba(34,197,94,0.1)' };
    if (isWrongSelected(i)) return { border: '2px solid #EF4444', background: 'rgba(239,68,68,0.1)' };
    return { border: '2px solid var(--border)', background: 'var(--bg-surface)' };
  }

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.22 }}
      style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)', overflow: 'hidden' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 16px 10px', flexShrink: 0 }}>
        <button onClick={() => navigate(`/course/${courseId}/module/${moduleId}`)} style={{ color: 'var(--text-primary)', padding: 4 }}>
          <HiArrowLeft size={22} />
        </button>
        <div style={{ flex: 1, fontSize: 15, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {mod?.title || 'Module'} Quiz
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', flexShrink: 0 }}>
          Q{currentIdx + 1} of {total}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: 'var(--border)', flexShrink: 0 }}>
        <motion.div
          animate={{ width: `${((currentIdx + (checked ? 1 : 0)) / total) * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{ height: '100%', background: 'var(--primary)', borderRadius: 2 }}
        />
      </div>

      {/* Question card */}
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 100px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }}
            transition={{ duration: 0.18 }}
          >
            {/* Q pill */}
            <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, color: 'var(--primary-text)', background: 'rgba(79,70,229,0.12)', padding: '3px 10px', borderRadius: 20, marginBottom: 12, letterSpacing: '0.04em' }}>
              Q{currentIdx + 1}
            </div>

            {/* Question text */}
            <p style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.5, marginBottom: 20, color: 'var(--text-primary)' }}>
              {currentQ.question}
            </p>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {currentQ.shuffledOptions.map((opt, i) => (
                <motion.button
                  key={i}
                  whileTap={!checked ? { scale: 0.98 } : {}}
                  onClick={() => !checked && setSelected(i)}
                  style={{
                    ...optionStyle(i),
                    padding: '13px 14px', borderRadius: 12, textAlign: 'left',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: 10, cursor: checked ? 'default' : 'pointer',
                    color: 'var(--text-primary)', fontFamily: 'Inter,sans-serif',
                    fontSize: 14, lineHeight: 1.45,
                  }}
                >
                  <span style={{ flex: 1 }}>{opt}</span>
                  {isCorrectOption(i) && <HiCheckCircle size={18} style={{ color: '#22C55E', flexShrink: 0 }} />}
                  {isWrongSelected(i) && <HiXCircle size={18} style={{ color: '#EF4444', flexShrink: 0 }} />}
                </motion.button>
              ))}
            </div>

            {/* Explanation card */}
            <AnimatePresence>
              {checked && currentQ.explanation && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ marginTop: 16, padding: '12px 14px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 12, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.55 }}
                >
                  <span style={{ fontWeight: 700 }}>Explanation: </span>{currentQ.explanation}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom action bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 16px 24px', background: 'var(--bg-dark)', borderTop: '1px solid var(--border)' }}>
        {!checked ? (
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="btn-primary"
            disabled={selected === null}
            style={{ width: '100%', opacity: selected === null ? 0.5 : 1 }}
            onClick={handleCheck}
          >
            Check Answer
          </motion.button>
        ) : (
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="btn-primary"
            style={{ width: '100%' }}
            onClick={handleNext}
          >
            {currentIdx < total - 1 ? 'Next Question →' : 'See Results →'}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
