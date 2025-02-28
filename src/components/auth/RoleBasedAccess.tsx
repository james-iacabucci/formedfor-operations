
import { ReactNode } from "react";
import { useUserRoles, AppRole } from "@/hooks/useUserRoles";

interface RoleBasedAccessProps {
  requiredRole: AppRole;
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleBasedAccess({ 
  requiredRole, 
  children, 
  fallback = null 
}: RoleBasedAccessProps) {
  const { currentUserRoles, hasRole } = useUserRoles();
  
  if (hasRole(currentUserRoles, requiredRole)) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}
