
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Settings2, X } from "lucide-react";
import { ManageTagsSection } from "./ManageTagsSection";
import { useState, useEffect } from "react";
import { AIContextSection } from "./AIContextSection";
import { ValueListsSection } from "./ValueListsSection";
import { ProductLinesSection } from "./ProductLinesSection";
import { RoleManagement } from "@/components/admin/RoleManagement";
import { RolePermissionsManagement } from "@/components/admin/RolePermissionsManagement";
import { useAuth } from "@/components/AuthProvider";
import { useUserRoles } from "@/hooks/use-user-roles";
import { PermissionGuard } from "@/components/permissions/PermissionGuard";
import { Button } from "@/components/ui/button";

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsSheet({ open, onOpenChange }: SettingsSheetProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { user } = useAuth();
  const { hasPermission } = useUserRoles();
  const isJames = user?.email === "james@formedfor.com";

  // Reset state when sheet closes
  useEffect(() => {
    if (!open) {
      setShowCreateForm(false);
      
      // Cleanup portals safely
      setTimeout(() => {
        try {
          const portals = document.querySelectorAll('[data-state="closed"]');
          portals.forEach(portal => {
            if (portal instanceof HTMLElement && 
                portal.closest('[role="dialog"]') && 
                portal.textContent?.includes('Settings')) {
              portal.remove();
            }
          });
        } catch (error) {
          console.error('Portal cleanup error:', error);
        }
      }, 300); // Wait for animation to complete
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

  return (
    <Sheet 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onOpenChange(false);
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
                <Settings2 className="h-5 w-5" />
                Settings
              </SheetTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onOpenChange(false)}
                className="h-8 w-8" 
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <SheetDescription className="sr-only">
              Configure application settings
            </SheetDescription>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto px-6">
            <div className="py-6 space-y-8">
              <PermissionGuard requiredPermission="settings.manage">
                <AIContextSection />
              </PermissionGuard>
              
              <PermissionGuard requiredPermission="settings.manage_tags">
                <ManageTagsSection />
              </PermissionGuard>
              
              <PermissionGuard requiredPermission="settings.manage_value_lists">
                <ValueListsSection />
              </PermissionGuard>
              
              <PermissionGuard requiredPermission="settings.manage_product_lines">
                <ProductLinesSection />
              </PermissionGuard>
              
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
