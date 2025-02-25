
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTagsManagement } from "@/components/tags/useTagsManagement";
import { SortingSection } from "./components/SortingSection";
import { HeightFilterSection } from "./components/HeightFilterSection";
import { FilterOptionsSection } from "./components/FilterOptionsSection";

interface ViewSettings {
  sortBy: 'created_at' | 'ai_generated_name' | 'updated_at';
  sortOrder: 'asc' | 'desc';
  productLineId: string | null;
  materialIds: string[];
  selectedStatusIds: string[]; // Changed from status: string | null
  heightOperator: 'eq' | 'gt' | 'lt' | null;
  heightValue: number | null;
  heightUnit: 'in' | 'cm';
  selectedTagIds: string[];
}

interface ViewSettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: ViewSettings;
  onApply: (settings: ViewSettings) => void;
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
  const { tags } = useTagsManagement(undefined);

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

  const handleTagSelection = (tagId: string, checked: boolean) => {
    if (tagId === 'all') {
      setSettings(prev => ({
        ...prev,
        selectedTagIds: checked ? ['all'] : []
      }));
    } else {
      setSettings(prev => {
        const newSelectedTags = checked
          ? [...prev.selectedTagIds.filter(id => id !== 'all'), tagId]
          : prev.selectedTagIds.filter(id => id !== tagId);

        if (newSelectedTags.length === 0) {
          return {
            ...prev,
            selectedTagIds: ['all']
          };
        }
        
        return {
          ...prev,
          selectedTagIds: newSelectedTags
        };
      });
    }
  };

  const handleStatusSelection = (statusId: string, checked: boolean) => {
    if (statusId === 'all') {
      setSettings(prev => ({
        ...prev,
        selectedStatusIds: checked ? ['all'] : []
      }));
    } else {
      setSettings(prev => {
        const newSelectedStatuses = checked
          ? [...prev.selectedStatusIds.filter(id => id !== 'all'), statusId]
          : prev.selectedStatusIds.filter(id => id !== statusId);

        if (newSelectedStatuses.length === 0) {
          return {
            ...prev,
            selectedStatusIds: ['all']
          };
        }
        
        return {
          ...prev,
          selectedStatusIds: newSelectedStatuses
        };
      });
    }
  };

  const handleApply = () => {
    onApply(settings);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSettings({ ...initialSettings });
    onOpenChange(false);
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        className="sm:max-w-md flex flex-col"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={() => handleCancel()}
      >
        <SheetHeader>
          <SheetTitle>View Settings</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 py-6">
            <SortingSection
              sortBy={settings.sortBy}
              sortOrder={settings.sortOrder}
              onSortByChange={(value) => setSettings(prev => ({ ...prev, sortBy: value }))}
              onSortOrderChange={(value) => setSettings(prev => ({ ...prev, sortOrder: value }))}
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
              onHeightOperatorChange={(value) => setSettings(prev => ({ ...prev, heightOperator: value }))}
              onHeightValueChange={(value) => setSettings(prev => ({ ...prev, heightValue: value }))}
              onHeightUnitChange={(value) => setSettings(prev => ({ ...prev, heightUnit: value }))}
            />
          </div>
        </div>

        <div className="border-t pt-4 flex justify-end gap-4">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleApply}>
            Apply
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
