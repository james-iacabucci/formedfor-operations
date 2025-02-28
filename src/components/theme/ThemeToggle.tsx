
import { MoonIcon, SunIcon } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ThemeProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const pendingThemeChange = useRef(false);

  // Load theme preference from database when user logs in
  useEffect(() => {
    if (!user) {
      setInitialLoadComplete(true);
      return;
    }
    
    const loadThemePreference = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('user_preferences')
          .select('settings')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        
        if (data && data.settings && typeof data.settings === 'object' && 'theme' in data.settings) {
          const userTheme = data.settings.theme;
          if (userTheme === 'light' || userTheme === 'dark') {
            setTheme(userTheme);
          }
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      } finally {
        setIsLoading(false);
        // Mark initial load as complete after the theme has been set
        setInitialLoadComplete(true);
      }
    };

    loadThemePreference();
  }, [user, setTheme]);

  // Save theme preference to database when theme changes
  const handleThemeChange = async () => {
    // Prevent double clicks or clicks during loading
    if (isLoading || !initialLoadComplete || pendingThemeChange.current) return;
    
    // Lock the button and set pending flag
    setIsLoading(true);
    pendingThemeChange.current = true;
    
    // Toggle the theme
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    if (!user) {
      // If no user, just release the button after a short delay
      setTimeout(() => {
        setIsLoading(false);
        pendingThemeChange.current = false;
      }, 300);
      return;
    }

    try {
      // First check if user has preferences record
      const { data: existingPref, error: fetchError } = await supabase
        .from('user_preferences')
        .select('id, settings')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (fetchError) throw fetchError;

      if (existingPref) {
        // Update existing record
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
        // Create new record
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
      // Release the button after a delay to prevent rapid toggling
      setTimeout(() => {
        setIsLoading(false);
        pendingThemeChange.current = false;
      }, 400);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleThemeChange}
      disabled={isLoading || !initialLoadComplete || pendingThemeChange.current}
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      className="transition-all duration-300"
    >
      {theme === 'light' ? (
        <SunIcon className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <MoonIcon className="h-[1.2rem] w-[1.2rem]" />
      )}
      <span className="sr-only">
        {theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      </span>
    </Button>
  );
}
