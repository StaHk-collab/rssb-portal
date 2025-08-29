import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Protected Route Component
 * 
 * Wrapper component that handles authentication and authorization.
 * Redirects to login if not authenticated or shows unauthorized message
 * if user doesn't have required permissions.
 */
const ProtectedRoute = ({ children, requiredRoles = null }) => {
  const { isAuthenticated, user, isLoading, hasRole } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Check role-based access if required roles are specified
  if (requiredRoles && !hasRole(requiredRoles)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="card p-8">
            {/* Unauthorized icon */}
            <div className="w-16 h-16 mx-auto mb-6 bg-status-error-light rounded-full flex items-center justify-center">
              <svg 
                className="w-8 h-8 text-status-error-main" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
                />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-text-primary mb-4">
              Access Denied
            </h2>
            
            <p className="text-text-secondary mb-6">
              You don't have permission to access this page. This area is restricted to{' '}
              <span className="font-medium text-text-primary">
                {Array.isArray(requiredRoles) 
                  ? requiredRoles.join(' and ').toLowerCase()
                  : requiredRoles.toLowerCase()
                }
              </span> users only.
            </p>

            <div className="space-y-3">
              <p className="text-sm text-text-secondary">
                Your current role: <span className="font-medium text-primary">{user.role.toLowerCase()}</span>
              </p>

              <button
                onClick={() => window.history.back()}
                className="btn btn-primary w-full"
              >
                Go Back
              </button>

              <p className="text-xs text-text-secondary">
                If you believe this is an error, please contact your administrator.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render protected content
  return children;
};

export default ProtectedRoute;