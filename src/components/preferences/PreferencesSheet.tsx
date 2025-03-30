
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { User, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../AuthProvider";
import { useUserRoles } from "@/hooks/use-user-roles";
import { AppearanceSection } from "./AppearanceSection";
import { ProfileSection } from "./ProfileSection";
import { Button } from "@/components/ui/button";
import { markClosedPortals, fixUIAfterPortalClose } from "@/lib/portalUtils";

interface PreferencesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PreferencesSheet({ open, onOpenChange }: PreferencesSheetProps) {
  const { user } = useAuth();
  const { role, loading: roleLoading, fetchRole } = useUserRoles();
  const didFetchRef = useRef(false);

  // Only fetch role once when sheet opens and user exists
  useEffect(() => {
    if (open && user && !didFetchRef.current) {
      console.log('PreferencesSheet opened - refreshing role');
      didFetchRef.current = true;
      fetchRole(true); // Force refresh once
    }
    
    // Reset the flag when sheet closes and fix UI
    if (!open) {
      didFetchRef.current = false;
      
      // Mark portals as closed first
      setTimeout(() => {
        markClosedPortals();
        
        // Apply UI fix after the animation completes
        setTimeout(() => {
          fixUIAfterPortalClose();
        }, 500);
      }, 300);
    }
  }, [open, user, fetchRole]);

  const handleClose = () => {
    onOpenChange(false);
    
    // Apply UI fix after closing
    setTimeout(() => {
      fixUIAfterPortalClose();
    }, 500);
  };

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

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
          <SheetHeader className="sticky top-0 z-10 bg-background px-6 py-4 border-b flex-shrink-0 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <SheetTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Preferences
              </SheetTitle>
              <SheetDescription className="sr-only">
                Manage your profile preferences
              </SheetDescription>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-8">
              <ProfileSection roleLoading={roleLoading} role={role || ''} />
              <AppearanceSection />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
