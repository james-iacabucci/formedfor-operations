
import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTagsManagement } from "@/components/tags/useTagsManagement";
import { SortingSection } from "./components/SortingSection";
import { HeightFilterSection } from "./components/HeightFilterSection";
import { FilterOptionsSection } from "./components/FilterOptionsSection";
import { ViewSettings } from "@/hooks/use-user-preferences";
import { toast } from "sonner";
import { markClosedPortals, fixUIAfterPortalClose } from "@/lib/portalUtils";

interface ViewSettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: ViewSettings;
  onApply: (settings: Partial<ViewSettings>) => void;
}

export function ViewSettingsSheet({ 
  open, 
  onOpenChange,
  settings: initialSettings,
  onApply,
}: ViewSettingsSheetProps) {
  const [settings, setSettings] = useState<ViewSettings>({ 
    ...initialSettings,
    heightUnit: initialSettings.heightUnit || 'in',
    selectedStatusIds: initialSettings.selectedStatusIds || ['all']
  });
  const [lastSavedSettings, setLastSavedSettings] = useState<ViewSettings>(settings);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
  const { tags } = useTagsManagement(undefined);

  // Set initial settings when sheet opens
  useEffect(() => {
    if (open) {
      const initialState = { 
        ...initialSettings,
        heightUnit: initialSettings.heightUnit || 'in',
        selectedStatusIds: initialSettings.selectedStatusIds || ['all']
      };
      setSettings(initialState);
      setLastSavedSettings(initialState);
    } else {
      // Mark portals as closed and apply UI fix
      setTimeout(() => {
        markClosedPortals();
        
        // Apply UI fix after animation completes
        setTimeout(() => {
          fixUIAfterPortalClose();
        }, 500);
      }, 300);
    }
  }, [open, initialSettings]);

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

  const { data: materials } = useQuery({
    queryKey: ["value_lists_materials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("value_lists")
        .select("*")
        .eq("type", "material");

      if (error) throw error;
      return data;
    },
  });

  // Apply changes with debounce
  const applyChangesWithDebounce = (newSettings: ViewSettings) => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    
    setSettings(newSettings);
    
    // Only save if something has changed
    if (JSON.stringify(newSettings) !== JSON.stringify(lastSavedSettings)) {
      const timeout = setTimeout(() => {
        onApply(newSettings);
        setLastSavedSettings(newSettings);
        toast.success("View settings updated");
      }, 800); // 800ms debounce
      
      setDebounceTimeout(timeout);
    }
  };

  const handleTagSelection = (tagId: string, checked: boolean) => {
    const newSettings = { ...settings };
    
    if (tagId === 'all') {
      newSettings.selectedTagIds = checked ? ['all'] : [];
    } else {
      newSettings.selectedTagIds = checked
        ? [...newSettings.selectedTagIds.filter(id => id !== 'all'), tagId]
        : newSettings.selectedTagIds.filter(id => id !== tagId);

      if (newSettings.selectedTagIds.length === 0) {
        newSettings.selectedTagIds = ['all'];
      }
    }
    
    applyChangesWithDebounce(newSettings);
  };

  const handleStatusSelection = (statusId: string, checked: boolean) => {
    const newSettings = { ...settings };
    
    if (statusId === 'all') {
      newSettings.selectedStatusIds = checked ? ['all'] : [];
    } else {
      newSettings.selectedStatusIds = checked
        ? [...newSettings.selectedStatusIds.filter(id => id !== 'all'), statusId]
        : newSettings.selectedStatusIds.filter(id => id !== statusId);

      if (newSettings.selectedStatusIds.length === 0) {
        newSettings.selectedStatusIds = ['all'];
      }
    }
    
    applyChangesWithDebounce(newSettings);
  };

  const handleClose = () => {
    // Make sure any pending changes are applied
    if (JSON.stringify(settings) !== JSON.stringify(lastSavedSettings)) {
      onApply(settings);
    }
    
    onOpenChange(false);
    
    // Apply UI fix after closing
    setTimeout(() => {
      fixUIAfterPortalClose();
    }, 500);
  };

  const allTags = [
    { id: 'all', name: 'All Sculptures' },
    ...(tags || [])
  ];

  const allStatuses = [
    { id: 'all', name: 'All Sculptures' },
    { id: 'idea', name: 'Idea' },
    { id: 'pending', name: 'Pending' },
    { id: 'approved', name: 'Approved' },
    { id: 'archived', name: 'Archived' }
  ];

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent 
        className="sm:max-w-md flex flex-col"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={() => handleClose()}
      >
        <SheetHeader>
          <SheetTitle>View Settings</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 py-6">
            <SortingSection
              sortBy={settings.sortBy}
              sortOrder={settings.sortOrder}
              onSortByChange={(value) => {
                const newSettings = { ...settings, sortBy: value };
                applyChangesWithDebounce(newSettings);
              }}
              onSortOrderChange={(value) => {
                const newSettings = { ...settings, sortOrder: value };
                applyChangesWithDebounce(newSettings);
              }}
            />

            <FilterOptionsSection
              title="Status"
              options={allStatuses}
              selectedIds={settings.selectedStatusIds}
              onSelectionChange={handleStatusSelection}
            />

            <FilterOptionsSection
              title="Tags"
              options={allTags}
              selectedIds={settings.selectedTagIds}
              onSelectionChange={handleTagSelection}
            />

            <HeightFilterSection
              heightOperator={settings.heightOperator}
              heightValue={settings.heightValue}
              heightUnit={settings.heightUnit}
              onHeightOperatorChange={(value) => {
                const newSettings = { ...settings, heightOperator: value };
                applyChangesWithDebounce(newSettings);
              }}
              onHeightValueChange={(value) => {
                const newSettings = { ...settings, heightValue: value };
                applyChangesWithDebounce(newSettings);
              }}
              onHeightUnitChange={(value) => {
                const newSettings = { ...settings, heightUnit: value };
                applyChangesWithDebounce(newSettings);
              }}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
