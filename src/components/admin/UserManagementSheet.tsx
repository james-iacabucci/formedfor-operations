
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { UserCog, X } from "lucide-react";
import { useEffect } from "react";
import { RoleManagement } from "@/components/admin/RoleManagement";
import { RolePermissionsManagement } from "@/components/admin/RolePermissionsManagement";
import { SculptureImport } from "@/components/admin/SculptureImport";
import { ZipImageImport } from "@/components/admin/ZipImageImport";
import { BulkSculptureDelete } from "@/components/admin/BulkSculptureDelete";
import { useAuth } from "@/components/AuthProvider";
import { useUserRoles } from "@/hooks/use-user-roles";
import { PermissionGuard } from "@/components/permissions/PermissionGuard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
            <div className="py-6">
              <PermissionGuard requiredPermission="settings.manage_roles">
                <Tabs defaultValue="users" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="permissions">Permissions</TabsTrigger>
                    <TabsTrigger value="zip-import">ZIP Import</TabsTrigger>
                    <TabsTrigger value="excel-import">Excel</TabsTrigger>
                    <TabsTrigger value="delete">Delete</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="users" className="mt-6">
                    <RoleManagement />
                  </TabsContent>
                  
                  <TabsContent value="permissions" className="mt-6">
                    <RolePermissionsManagement />
                  </TabsContent>
                  
                  <TabsContent value="zip-import" className="mt-6">
                    <ZipImageImport />
                  </TabsContent>
                  
                  <TabsContent value="excel-import" className="mt-6">
                    <SculptureImport />
                  </TabsContent>
                  
                  <TabsContent value="delete" className="mt-6">
                    <BulkSculptureDelete />
                  </TabsContent>
                </Tabs>
              </PermissionGuard>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
