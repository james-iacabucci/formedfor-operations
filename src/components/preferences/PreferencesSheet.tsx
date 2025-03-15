
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { User, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../AuthProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserRoles } from "@/hooks/use-user-roles";
import { AppearanceSection } from "./AppearanceSection";
import { ProfileSection } from "./ProfileSection";
import { Button } from "@/components/ui/button";

interface PreferencesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PreferencesSheet({ open, onOpenChange }: PreferencesSheetProps) {
  const { user } = useAuth();
  const { role, loading: roleLoading, fetchRole } = useUserRoles();
  const [activeTab, setActiveTab] = useState("profile");

  // Force refresh roles when sheet opens
  useEffect(() => {
    if (open && user) {
      console.log('PreferencesSheet opened - forcing role refresh');
      fetchRole(true); // Force refresh
    }
  }, [open, user, fetchRole]);

  // Clean up closed portals to prevent unresponsive UI
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        try {
          const portals = document.querySelectorAll('[data-state="closed"]');
          portals.forEach(portal => {
            // Only target Preferences-related portals
            if (portal.textContent?.includes('Preferences')) {
              const parent = portal.parentNode;
              if (parent && parent.contains(portal)) {
                parent.removeChild(portal);
              }
            }
          });
        } catch (error) {
          console.error('Portal cleanup error:', error);
        }
      }, 300); // Wait for animation to complete
    }
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl flex flex-col p-0 overflow-hidden">
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
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </SheetClose>
          </SheetHeader>
          
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <TabsList className="px-6 pt-2 justify-start border-b rounded-none">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
            </TabsList>
            
            <div className="flex-1 overflow-y-auto px-6">
              <TabsContent value="profile" className="mt-0 py-6 h-full">
                <ProfileSection roleLoading={roleLoading} role={role} />
              </TabsContent>
              
              <TabsContent value="appearance" className="mt-0 py-6 h-full">
                <AppearanceSection />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
