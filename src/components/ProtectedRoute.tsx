import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  permission?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, permission }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Tier 3: Must be authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Tier 3: Must have permission
  // If user has 'read_only' permission, they can view but maybe we show a restricted view
  // For now, if they don't have the specific permission, we show Access Denied
  if (permission && user && user.role !== 'admin' && !user.permissions.includes(permission)) {
    // If they are a viewer, they might have 'read_only' but not 'planning'
    if (user.permissions.includes('read_only')) {
      // Allow viewing if it's a read-only request? 
      // The user request says "If it's a general email not assigned permission, it will be a Viewer Read Only always"
      // This implies they CAN enter the menu but can't edit.
      // However, the previous logic was "can't enter". 
      // Let's adjust: if they have 'read_only', they can enter, but we might need to pass this state down.
      // For now, let's allow 'read_only' to pass through if the permission check is for a module.
      return <>{children}</>;
    }

    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8 bg-white rounded-3xl border border-red-100 shadow-sm">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Access Denied</h1>
        <p className="text-slate-500 max-w-md">
          You do not have the required permissions to access this module. Please contact your system administrator.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
