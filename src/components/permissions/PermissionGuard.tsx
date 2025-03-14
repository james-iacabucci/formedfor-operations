import { ReactNode } from "react";
import { useUserRoles } from "@/hooks/use-user-roles";
import { PermissionAction } from "@/types/permissions";

interface PermissionGuardProps {
  requiredPermission: PermissionAction;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * A component that conditionally renders its children based on whether
 * the current user has the required permission.
 */
export function PermissionGuard({ requiredPermission, children, fallback = null }: PermissionGuardProps) {
  const { hasPermission, loading } = useUserRoles();
  
  // While loading, render nothing to prevent flash
  if (loading) return null;
  
  // If user has the required permission, render children
  if (hasPermission(requiredPermission)) {
    return <>{children}</>;
  }
  
  // Otherwise, render the fallback (or null if no fallback provided)
  return <>{fallback}</>;
}
