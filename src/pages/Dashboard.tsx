
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CreateSculptureSheet } from "@/components/CreateSculptureSheet";
import { AddSculptureSheet } from "@/components/AddSculptureSheet";
import { ViewSettingsSheet } from "@/components/view-settings/ViewSettingsSheet";
import { useTagsManagement } from "@/components/tags/useTagsManagement";
import { AppHeader } from "@/components/layout/AppHeader";
import { useUserPreferences, ViewSettings } from "@/hooks/use-user-preferences";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardActions } from "@/components/dashboard/DashboardActions";
import { DashboardContent } from "@/components/dashboard/DashboardContent";

interface DashboardProps {
  initialProductLineId?: string;
}

const Dashboard = ({ initialProductLineId }: DashboardProps) => {
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isViewSettingsOpen, setIsViewSettingsOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [previousSearchValue, setPreviousSearchValue] = useState("");
  
  const { viewSettings, isLoading: preferencesLoading, savePreferences } = useUserPreferences();
  
  const { tags } = useTagsManagement(undefined);

  // Set the product line filter if initialProductLineId is provided
  useEffect(() => {
    if (initialProductLineId && !preferencesLoading) {
      // Only update if the product line isn't already selected
      if (!viewSettings.selectedProductLines.includes(initialProductLineId)) {
        savePreferences({
          ...viewSettings,
          selectedProductLines: [initialProductLineId]
        });
      }
    }
  }, [initialProductLineId, viewSettings, savePreferences, preferencesLoading]);

  const { data: productLines } = useQuery({
    queryKey: ["product_lines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_lines")
        .select("*");

      if (error) throw error;
      return data;
    },
  });

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

  const handleViewSettingsChange = (newSettings: Partial<ViewSettings>) => {
    const productLineId = viewSettings.selectedProductLines.length === 1 
      ? viewSettings.selectedProductLines[0] 
      : null;
      
    savePreferences({
      ...newSettings,
      productLineId
    });
  };

  if (preferencesLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading preferences...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <DashboardHeader
            viewSettings={viewSettings}
            isSearchExpanded={isSearchExpanded}
            setIsSearchExpanded={setIsSearchExpanded}
            setIsViewSettingsOpen={setIsViewSettingsOpen}
            previousSearchValue={previousSearchValue}
            setPreviousSearchValue={setPreviousSearchValue}
            savePreferences={savePreferences}
            productLines={productLines}
            materials={materials}
            tags={tags}
          />

          <DashboardActions 
            setIsAddSheetOpen={setIsAddSheetOpen}
            setIsCreateSheetOpen={setIsCreateSheetOpen}
          />
        </div>

        <DashboardContent viewSettings={viewSettings} />
      </div>

      <CreateSculptureSheet 
        open={isCreateSheetOpen} 
        onOpenChange={setIsCreateSheetOpen}
      />
      <AddSculptureSheet
        open={isAddSheetOpen}
        onOpenChange={setIsAddSheetOpen}
      />
      <ViewSettingsSheet
        open={isViewSettingsOpen}
        onOpenChange={setIsViewSettingsOpen}
        settings={viewSettings}
        onApply={handleViewSettingsChange}
      />
    </div>
  );
}

export default Dashboard;
