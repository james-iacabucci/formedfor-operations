
import { Card, CardContent } from "@/components/ui/card";
import { SculpturesList } from "@/components/SculpturesList";
import { CreateSculptureSheet } from "@/components/CreateSculptureSheet";
import { AddSculptureSheet } from "@/components/AddSculptureSheet";
import { useState } from "react";
import { UserMenu } from "@/components/UserMenu";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List, PlusIcon, Settings2, UploadIcon } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { ViewSettingsSheet } from "@/components/view-settings/ViewSettingsSheet";

interface ViewSettings {
  sortBy: 'created_at' | 'ai_generated_name' | 'updated_at';
  sortOrder: 'asc' | 'desc';
  productLineId: string | null;
  materialIds: string[];
  status: string | null;
  heightOperator: 'eq' | 'gt' | 'lt' | null;
  heightValue: number | null;
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
  });

  const handleViewSettingsChange = (newSettings: ViewSettings) => {
    setViewSettings(newSettings);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="mx-auto max-w-7xl p-6">
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-2xl font-bold shrink-0">Sculptify</h1>
            <div className="flex items-center gap-4 ml-auto">
              <Button 
                onClick={() => setIsAddSheetOpen(true)}
                variant="outline"
                className="gap-2 shrink-0"
              >
                <UploadIcon className="h-4 w-4" />
                Add
              </Button>
              <Button 
                onClick={() => setIsCreateSheetOpen(true)}
                className="gap-2 shrink-0"
              >
                <PlusIcon className="h-4 w-4" />
                Create
              </Button>
              <div className="flex gap-2 border rounded-md p-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsViewSettingsOpen(true)}
                >
                  <Settings2 className="h-4 w-4" />
                </Button>
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
              <UserMenu />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl p-6 pt-6">
        <Card className="border-0 shadow-none">
          <CardContent className="pt-6">
            <SculpturesList viewSettings={viewSettings} isGridView={isGridView} />
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
