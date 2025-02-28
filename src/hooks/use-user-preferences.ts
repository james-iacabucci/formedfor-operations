
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ViewSettings {
  sortBy: 'created_at' | 'ai_generated_name' | 'updated_at';
  sortOrder: 'asc' | 'desc';
  productLineId: string | null;
  materialIds: string[];
  selectedStatusIds: string[];
  heightOperator: 'eq' | 'gt' | 'lt' | null;
  heightValue: number | null;
  heightUnit: 'in' | 'cm';
  selectedTagIds: string[];
  isGridView: boolean;
  selectedProductLines: string[];
  searchValue: string;
}

export const defaultViewSettings: ViewSettings = {
  sortBy: 'created_at',
  sortOrder: 'desc',
  productLineId: null,
  materialIds: [],
  selectedStatusIds: ['all'],
  heightOperator: null,
  heightValue: null,
  heightUnit: 'in',
  selectedTagIds: ['all'],
  isGridView: true,
  selectedProductLines: [],
  searchValue: ""
};

export function useUserPreferences() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [viewSettings, setViewSettings] = useState<ViewSettings>(defaultViewSettings);
  const [hasLoadedInitialPreferences, setHasLoadedInitialPreferences] = useState(false);

  // Load user preferences
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('user_preferences')
          .select('settings')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setViewSettings(data.settings as ViewSettings);
        }
        
        setHasLoadedInitialPreferences(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading user preferences:', error);
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [user]);

  // Save user preferences
  const savePreferences = async (newSettings: Partial<ViewSettings>) => {
    if (!user) return;

    // Only save if we've loaded the initial preferences
    if (!hasLoadedInitialPreferences) return;

    const updatedSettings = { ...viewSettings, ...newSettings };
    setViewSettings(updatedSettings);

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({ 
          user_id: user.id,
          settings: updatedSettings 
        })
        .select();

      if (error) throw error;
    } catch (error) {
      console.error('Error saving user preferences:', error);
      toast.error("Failed to save preferences");
    }
  };

  return {
    viewSettings,
    isLoading,
    savePreferences
  };
}
