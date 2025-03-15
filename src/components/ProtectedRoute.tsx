
import { useAuth } from "./AuthProvider";
import { Navigate, useLocation } from "react-router-dom";
import { AppRole } from "@/types/roles";
import { useUserRoles } from "@/hooks/use-user-roles";
import { PermissionAction } from "@/types/permissions";
import { useEffect, useRef } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: AppRole[];
  requiredPermissions?: PermissionAction[];
}

export const ProtectedRoute = ({ 
  children, 
  requiredRoles,
  requiredPermissions 
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const { role, loading: roleLoading, hasPermission, fetchRole } = useUserRoles();
  const location = useLocation();
  const lastPathRef = useRef(location.pathname);

  // Only refresh role when route path changes, not on every render
  useEffect(() => {
    if (user && location.pathname !== lastPathRef.current) {
      console.log('Route changed to a new path - refreshing user role');
      lastPathRef.current = location.pathname;
      fetchRole(false); // Not forcing refresh to allow caching
    }
  }, [location.pathname, user, fetchRole]);

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If roles are required, check if the user has one of them
  if (requiredRoles && requiredRoles.length > 0 && role) {
    const hasRequiredRole = requiredRoles.includes(role);
    console.log(`Required roles: ${requiredRoles.join(', ')}, User role: ${role}, Has required role: ${hasRequiredRole}`);
    
    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 text-center mb-4">
            You don't have the required role to access this page.
          </p>
          <Navigate to="/" replace />
        </div>
      );
    }
  }

  // If permissions are required, check if the user has all of them
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasRequiredPermissions = requiredPermissions.every(permission => 
      hasPermission(permission)
    );
    
    if (!hasRequiredPermissions) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 text-center mb-4">
            You don't have the required permissions to access this page.
          </p>
          <Navigate to="/" replace />
        </div>
      );
    }
  }

  return <>{children}</>;
};
