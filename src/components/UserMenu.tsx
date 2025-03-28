import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, User, LogOut, Moon, Sun, UserCog } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { useState, useEffect } from "react";
import { SettingsSheet } from "./settings/SettingsSheet";
import { PreferencesSheet } from "./preferences/PreferencesSheet";
import { UserManagementSheet } from "./admin/UserManagementSheet";
import { useTheme } from "./ThemeProvider";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { toast } from "sonner";
import { useUserRoles } from "@/hooks/use-user-roles";
import { PermissionGuard } from "./permissions/PermissionGuard";

export function UserMenu() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { fetchRole, hasPermission } = useUserRoles();
  const [showSettings, setShowSettings] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isChangingTheme, setIsChangingTheme] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      if (data) {
        setAvatar(data.avatar_url);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleThemeChange = async () => {
    if (isChangingTheme) return;
    
    setIsChangingTheme(true);
    
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    if (!user) {
      setTimeout(() => setIsChangingTheme(false), 300);
      return;
    }

    try {
      const { data: existingPref, error: fetchError } = await supabase
        .from('user_preferences')
        .select('id, settings')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (fetchError) throw fetchError;

      if (existingPref) {
        const updatedSettings = {
          ...(typeof existingPref.settings === 'object' ? existingPref.settings : {}),
          theme: newTheme
        };

        const { error } = await supabase
          .from('user_preferences')
          .update({ settings: updatedSettings })
          .eq('id', existingPref.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_preferences')
          .insert({
            user_id: user.id,
            settings: { theme: newTheme }
          });
          
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error saving theme preference:', error);
      toast.error("Failed to save theme preference");
    } finally {
      setTimeout(() => setIsChangingTheme(false), 400);
    }
  };

  const handlePreferencesClick = () => {
    console.log('Opening preferences - refreshing role data');
    if (fetchRole) {
      fetchRole(true);
    }
    setShowPreferences(true);
  };

  useEffect(() => {
    console.log("UserMenu rendered, user:", user ? "logged in" : "not logged in");
  }, [user]);

  return (
    <>
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative p-0 h-9 w-9 transition-all duration-300 ease-in-out hover:bg-transparent focus:bg-transparent"
            data-testid="user-menu-button"
          >
            <Avatar className="h-full w-full overflow-hidden">
              <AvatarImage src={avatar || undefined} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <span className="sr-only">User menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="transition-all duration-300 ease-in-out z-50 bg-background border shadow-md"
        >
          <DropdownMenuItem onClick={handlePreferencesClick}>
            <User className="mr-2 h-4 w-4" />
            User Profile
          </DropdownMenuItem>
          
          <PermissionGuard 
            requiredPermission="settings.manage_roles"
            fallback={null}
          >
            <DropdownMenuItem onClick={() => setShowUserManagement(true)}>
              <UserCog className="mr-2 h-4 w-4" />
              User Management
            </DropdownMenuItem>
          </PermissionGuard>
          
          <PermissionGuard 
            requiredPermission="settings.manage"
            fallback={null}
          >
            <DropdownMenuItem onClick={() => setShowSettings(true)}>
              <Settings className="mr-2 h-4 w-4" />
              System Settings
            </DropdownMenuItem>
          </PermissionGuard>
          
          <DropdownMenuItem onClick={handleThemeChange} disabled={isChangingTheme}>
            {theme === "light" ? (
              <Moon className="mr-2 h-4 w-4" />
            ) : (
              <Sun className="mr-2 h-4 w-4" />
            )}
            {theme === "light" ? "Change to Dark Theme" : "Change to Light Theme"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SettingsSheet 
        open={showSettings} 
        onOpenChange={setShowSettings}
      />

      <UserManagementSheet
        open={showUserManagement}
        onOpenChange={setShowUserManagement}
      />

      <PreferencesSheet
        open={showPreferences}
        onOpenChange={setShowPreferences}
      />
    </>
  );
}
