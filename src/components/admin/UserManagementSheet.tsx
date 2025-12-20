
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { UserCog, X } from "lucide-react";
import { useState, useEffect } from "react";
import { RoleManagement } from "@/components/admin/RoleManagement";
import { RolePermissionsManagement } from "@/components/admin/RolePermissionsManagement";
import { useAuth } from "@/components/AuthProvider";
import { useUserRoles } from "@/hooks/use-user-roles";
import { PermissionGuard } from "@/components/permissions/PermissionGuard";
import { Button } from "@/components/ui/button";
import { markClosedPortals, fixUIAfterPortalClose } from "@/lib/portalUtils";

interface UserManagementSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserManagementSheet({ open, onOpenChange }: UserManagementSheetProps) {
  const { user } = useAuth();
  const { hasPermission } = useUserRoles();

  // Reset state when sheet closes and fix UI
  useEffect(() => {
    if (!open) {
      // Just mark portals as closed, don't try to remove them
      setTimeout(() => {
        markClosedPortals();
        
        // Apply UI fix after animation completes
        setTimeout(() => {
          fixUIAfterPortalClose();
        }, 500);
      }, 300);
    }
  }, [open]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  const handleClose = () => {
    onOpenChange(false);
    
    // Apply UI fix after closing
    setTimeout(() => {
      fixUIAfterPortalClose();
    }, 500);
  };

  return (
    <Sheet 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleClose();
        }
      }}
    >
      <SheetContent 
        className="sm:max-w-2xl flex flex-col p-0 overflow-hidden"
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
      >
        <div className="flex flex-col h-full">
          <SheetHeader className="sticky top-0 z-10 bg-background px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5" />
                User Management
              </SheetTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleClose}
                className="h-8 w-8" 
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <SheetDescription className="sr-only">
              Manage users and roles
            </SheetDescription>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto px-6">
            <div className="py-6 space-y-8">
              <PermissionGuard requiredPermission="settings.manage_roles">
                <RoleManagement />
                <RolePermissionsManagement />
              </PermissionGuard>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
