import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/** Only renders `children` for logged-in users (optionally only for a given role). */
export default function ProtectedRoute({ role, children }) {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) return <div className="section-pad text-center text-muted" role="status">Checking your session…</div>;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (role && user.role !== role) return <Navigate to="/account" replace />;
  return children;
}
