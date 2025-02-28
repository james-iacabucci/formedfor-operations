
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

// Helper function to validate and ensure we have a proper ViewSettings object
function ensureValidViewSettings(data: any): ViewSettings {
  if (!data || typeof data !== 'object') {
    return { ...defaultViewSettings };
  }

  // Create a new object with all default values
  const settings: ViewSettings = { ...defaultViewSettings };

  // Only override with valid values from data
  if (data.sortBy && ['created_at', 'ai_generated_name', 'updated_at'].includes(data.sortBy)) {
    settings.sortBy = data.sortBy;
  }
  
  if (data.sortOrder && ['asc', 'desc'].includes(data.sortOrder)) {
    settings.sortOrder = data.sortOrder;
  }
  
  if (data.productLineId === null || typeof data.productLineId === 'string') {
    settings.productLineId = data.productLineId;
  }
  
  if (Array.isArray(data.materialIds)) {
    settings.materialIds = data.materialIds;
  }
  
  if (Array.isArray(data.selectedStatusIds)) {
    settings.selectedStatusIds = data.selectedStatusIds;
  }
  
  if (data.heightOperator === null || ['eq', 'gt', 'lt'].includes(data.heightOperator)) {
    settings.heightOperator = data.heightOperator;
  }
  
  if (data.heightValue === null || typeof data.heightValue === 'number') {
    settings.heightValue = data.heightValue;
  }
  
  if (data.heightUnit && ['in', 'cm'].includes(data.heightUnit)) {
    settings.heightUnit = data.heightUnit;
  }
  
  if (Array.isArray(data.selectedTagIds)) {
    settings.selectedTagIds = data.selectedTagIds;
  }
  
  if (typeof data.isGridView === 'boolean') {
    settings.isGridView = data.isGridView;
  }
  
  if (Array.isArray(data.selectedProductLines)) {
    settings.selectedProductLines = data.selectedProductLines;
  }
  
  if (typeof data.searchValue === 'string') {
    settings.searchValue = data.searchValue;
  }
  
  return settings;
}

export function useUserPreferences() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [viewSettings, setViewSettings] = useState<ViewSettings>(defaultViewSettings);
  const [hasLoadedInitialPreferences, setHasLoadedInitialPreferences] = useState(false);
  const [prefId, setPrefId] = useState<string | null>(null);

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
          .select('id, settings')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data && data.settings) {
          // Use the helper function to ensure we have valid settings
          setViewSettings(ensureValidViewSettings(data.settings));
          if (data.id) {
            setPrefId(data.id);
          }
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
      if (prefId) {
        // Update existing record
        const { error } = await supabase
          .from('user_preferences')
          .update({ settings: updatedSettings })
          .eq('id', prefId);

        if (error) throw error;
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from('user_preferences')
          .insert({ 
            user_id: user.id,
            settings: updatedSettings 
          })
          .select();

        if (error) throw error;
        
        if (data && data.length > 0) {
          setPrefId(data[0].id);
        }
      }
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
