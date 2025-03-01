import { Card, CardContent } from "@/components/ui/card";
import { SculpturesList } from "@/components/SculpturesList";
import { CreateSculptureSheet } from "@/components/CreateSculptureSheet";
import { AddSculptureSheet } from "@/components/AddSculptureSheet";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, UploadIcon, Search, Settings2, LayoutGrid, List } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ViewSettingsSheet } from "@/components/view-settings/ViewSettingsSheet";
import { SelectedFilters } from "@/components/filters/SelectedFilters";
import { useTagsManagement } from "@/components/tags/useTagsManagement";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Toggle } from "@/components/ui/toggle";
import { Input } from "@/components/ui/input";
import { AppHeader } from "@/components/layout/AppHeader";
import { useUserPreferences, ViewSettings } from "@/hooks/use-user-preferences";

const Dashboard = () => {
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isViewSettingsOpen, setIsViewSettingsOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [previousSearchValue, setPreviousSearchValue] = useState("");
  
  const { viewSettings, isLoading: preferencesLoading, savePreferences } = useUserPreferences();
  
  const { tags } = useTagsManagement(undefined);

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

  const handleSearchClick = () => {
    setIsSearchExpanded(true);
    setPreviousSearchValue(viewSettings.searchValue);
    setTimeout(() => {
      const searchInput = document.getElementById('sculpture-search');
      if (searchInput) {
        searchInput.focus();
      }
    }, 100);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      savePreferences({ searchValue: previousSearchValue });
      e.currentTarget.blur();
      if (!previousSearchValue) {
        setIsSearchExpanded(false);
      }
    }
  };

  const handleSearchChange = (value: string) => {
    savePreferences({ searchValue: value });
  };

  const handleGridViewToggle = (isGrid: boolean) => {
    savePreferences({ isGridView: isGrid });
  };

  if (preferencesLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading preferences...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex gap-2 border rounded-md p-0.5 h-9">
              <Toggle
                pressed={viewSettings.isGridView}
                onPressedChange={() => handleGridViewToggle(true)}
                size="sm"
                className="data-[state=on]:bg-muted h-8 w-8"
              >
                <LayoutGrid className="h-4 w-4" />
              </Toggle>
              <Toggle
                pressed={!viewSettings.isGridView}
                onPressedChange={() => handleGridViewToggle(false)}
                size="sm"
                className="data-[state=on]:bg-muted h-8 w-8"
              >
                <List className="h-4 w-4" />
              </Toggle>
            </div>

            {isSearchExpanded ? (
              <div className="relative">
                <Input
                  id="sculpture-search"
                  type="text"
                  value={viewSettings.searchValue}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="h-9 w-[200px] pl-8"
                  onBlur={() => !viewSettings.searchValue && setIsSearchExpanded(false)}
                  placeholder="Search sculptures..."
                />
                <Search className="h-4 w-4 absolute left-2 top-2.5 text-muted-foreground" />
              </div>
            ) : (
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 p-0"
                  onClick={handleSearchClick}
                >
                  <Search className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 p-0"
                  onClick={() => setIsViewSettingsOpen(true)}
                >
                  <Settings2 className="h-4 w-4" />
                </Button>
              </div>
            )}

            <SelectedFilters
              viewSettings={viewSettings}
              productLines={productLines}
              materials={materials}
              tags={tags}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button 
              onClick={() => setIsAddSheetOpen(true)}
              variant="outline"
              className="gap-2 h-9 px-3"
            >
              <UploadIcon className="h-4 w-4" />
              Add
            </Button>
            <Button 
              onClick={() => setIsCreateSheetOpen(true)}
              className="gap-2 h-9 px-3"
            >
              <PlusIcon className="h-4 w-4" />
              Create
            </Button>
          </div>
        </div>

        <Card className="border-0 shadow-none">
          <CardContent className="p-0">
            <SculpturesList 
              viewSettings={viewSettings} 
              isGridView={viewSettings.isGridView}
              selectedProductLines={viewSettings.selectedProductLines}
              searchQuery={viewSettings.searchValue}
            />
          </CardContent>
        </Card>
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
