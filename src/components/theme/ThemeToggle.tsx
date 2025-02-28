
import { MoonIcon, SunIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ThemeProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Load theme preference from database when user logs in
  useEffect(() => {
    if (!user) return;
    
    const loadThemePreference = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('user_preferences')
          .select('settings')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        
        if (data && data.settings && data.settings.theme) {
          setTheme(data.settings.theme);
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadThemePreference();
  }, [user, setTheme]);

  // Save theme preference to database when theme changes
  const handleThemeChange = async (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    
    if (!user) return;

    try {
      setIsLoading(true);
      
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
          ...existingPref.settings,
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
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-1">
      <Button
        variant={theme === 'light' ? 'default' : 'outline'}
        size="icon"
        onClick={() => handleThemeChange('light')}
        disabled={isLoading}
        title="Light mode"
      >
        <SunIcon className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Light mode</span>
      </Button>
      <Button
        variant={theme === 'dark' ? 'default' : 'outline'}
        size="icon"
        onClick={() => handleThemeChange('dark')}
        disabled={isLoading}
        title="Dark mode"
      >
        <MoonIcon className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Dark mode</span>
      </Button>
    </div>
  );
}
