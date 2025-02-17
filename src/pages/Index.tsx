
import { Card, CardContent } from "@/components/ui/card";
import { SculpturesList } from "@/components/SculpturesList";
import { CreateSculptureSheet } from "@/components/CreateSculptureSheet";
import { AddSculptureSheet } from "@/components/AddSculptureSheet";
import { useState } from "react";
import { UserMenu } from "@/components/UserMenu";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List, Settings2 } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { ViewSettingsSheet } from "@/components/view-settings/ViewSettingsSheet";
import { SelectedFilters } from "@/components/filters/SelectedFilters";
import { useTagsManagement } from "@/components/tags/useTagsManagement";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ViewSettings {
  sortBy: 'created_at' | 'ai_generated_name' | 'updated_at';
  sortOrder: 'asc' | 'desc';
  productLineId: string | null;
  materialIds: string[];
  status: string | null;
  heightOperator: 'eq' | 'gt' | 'lt' | null;
  heightValue: number | null;
  selectedTagIds: string[];
}

const Index = () => {
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isGridView, setIsGridView] = useState(true);
  const [isViewSettingsOpen, setIsViewSettingsOpen] = useState(false);
  const [viewSettings, setViewSettings] = useState<ViewSettings>({
    sortBy: 'created_at',
    sortOrder: 'desc',
    productLineId: null,
    materialIds: [],
    status: null,
    heightOperator: null,
    heightValue: null,
    selectedTagIds: ['all'],
  });

  const { tags } = useTagsManagement(undefined);

  const { data: productLines } = useQuery({
    queryKey: ["product_lines"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("product_lines")
        .select("*")
        .eq("user_id", user.user.id);

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

  const handleViewSettingsChange = (newSettings: ViewSettings) => {
    setViewSettings(newSettings);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* App Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="mx-auto max-w-7xl p-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Sculptify</h1>
            <div className="flex items-center gap-4 ml-auto">
              <UserMenu />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl p-6 pt-6">
        {/* Sculpture Listing Toolbar */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex gap-2 border rounded-md p-0.5">
              <Toggle
                pressed={isGridView}
                onPressedChange={() => setIsGridView(true)}
                size="sm"
                className="data-[state=on]:bg-muted"
              >
                <LayoutGrid className="h-4 w-4" />
              </Toggle>
              <Toggle
                pressed={!isGridView}
                onPressedChange={() => setIsGridView(false)}
                size="sm"
                className="data-[state=on]:bg-muted"
              >
                <List className="h-4 w-4" />
              </Toggle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsViewSettingsOpen(true)}
            >
              <Settings2 className="h-4 w-4" />
            </Button>
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
            >
              Add
            </Button>
            <Button 
              onClick={() => setIsCreateSheetOpen(true)}
            >
              Create
            </Button>
          </div>
        </div>

        <Card className="border-0 shadow-none">
          <CardContent className="p-0">
            <SculpturesList 
              viewSettings={viewSettings} 
              isGridView={isGridView} 
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

export default Index;
