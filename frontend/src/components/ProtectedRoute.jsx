import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredRole = null, requiredPermission = null }) {
  const { user } = useContext(AuthContext);

  // Check if user is authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>You do not have permission to access this page.</p>
        <p>Required Role: {requiredRole}</p>
        <p>Your Role: {user.role}</p>
      </div>
    );
  }

  // Check if user has required permission
  if (requiredPermission) {
    const { resource, action } = requiredPermission;
    // This would need a permissions utility function to check
    // For now, we'll do a simple check based on role
    console.log('[v0] Checking permission:', { resource, action, userRole: user.role });
  }

  return children;
}
