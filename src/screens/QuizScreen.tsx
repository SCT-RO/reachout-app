import { useParams, useNavigate } from 'react-router-dom';

export default function QuizScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', gap: 12 }}>
      <div style={{ fontSize: 40 }}>🧠</div>
      <div style={{ fontSize: 18, fontWeight: 700 }}>Quiz (Course ID: {id})</div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Coming in Phase 2</div>
      <button className="btn-outline" style={{ width: 160, marginTop: 8 }} onClick={() => navigate('/learn')}>← Back</button>
    </div>
  );
}
