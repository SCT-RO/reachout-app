import { Navigate } from 'react-router-dom';
import { getSession } from '../utils/storage';

export default function ProtectedRoute({ children }) {
  const session = getSession();
  if (!session) return <Navigate to="/auth" replace />;
  return children;
}
