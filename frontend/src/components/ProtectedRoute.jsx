import { Navigate } from 'react-router';
import { useAuth } from '../context/useAuth';
export const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="loading">Authenticating...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/tickets'} replace />;
  }
  return children;
};
export const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="loading">Authenticating...</div>;
  }
  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/tickets'} replace />;
  }
  return children;
};
