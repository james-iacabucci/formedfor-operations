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

interface ViewSettings {
  sortBy: 'created_at' | 'ai_generated_name' | 'updated_at';
  sortOrder: 'asc' | 'desc';
  productLineId: string | null;
  materialIds: string[];
  status: string | null;
  heightOperator: 'eq' | 'gt' | 'lt' | null;
  heightValue: number | null;
  heightUnit: 'in' | 'cm';
  selectedTagIds: string[];
}

const Dashboard = () => {
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isGridView, setIsGridView] = useState(true);
  const [isViewSettingsOpen, setIsViewSettingsOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [previousSearchValue, setPreviousSearchValue] = useState("");
  const [selectedProductLines, setSelectedProductLines] = useState<string[]>([]);
  const [viewSettings, setViewSettings] = useState<ViewSettings>({
    sortBy: 'created_at',
    sortOrder: 'desc',
    productLineId: null,
    materialIds: [],
    status: null,
    heightOperator: null,
    heightValue: null,
    heightUnit: 'in',
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

  useEffect(() => {
    if (productLines) {
      const savedSelection = localStorage.getItem('selectedProductLines');
      if (savedSelection) {
        const parsed = JSON.parse(savedSelection);
        setSelectedProductLines(parsed);
        setViewSettings(prev => ({
          ...prev,
          productLineId: parsed.length === 1 ? parsed[0] : null
        }));
      } else {
        const ffProductLine = productLines.find(pl => pl.product_line_code === 'FF');
        if (ffProductLine) {
          const defaultSelection = [ffProductLine.id];
          setSelectedProductLines(defaultSelection);
          setViewSettings(prev => ({
            ...prev,
            productLineId: ffProductLine.id
          }));
          localStorage.setItem('selectedProductLines', JSON.stringify(defaultSelection));
        }
      }
    }
  }, [productLines]);

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
    const newSettingsWithProductLine = {
      ...newSettings,
      productLineId: selectedProductLines.length === 1 ? selectedProductLines[0] : null
    };
    setViewSettings(newSettingsWithProductLine);
  };

  const handleSearchClick = () => {
    setIsSearchExpanded(true);
    setPreviousSearchValue(searchValue);
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
      setSearchValue(previousSearchValue);
      e.currentTarget.blur();
      if (!previousSearchValue) {
        setIsSearchExpanded(false);
      }
    }
  };

  const handleProductLineChange = (values: string[]) => {
    setSelectedProductLines(values);
    setViewSettings(prev => ({
      ...prev,
      productLineId: values.length === 1 ? values[0] : null
    }));
    localStorage.setItem('selectedProductLines', JSON.stringify(values));
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex gap-2 border rounded-md p-0.5">
              <Toggle
                pressed={isGridView}
                onPressedChange={() => setIsGridView(true)}
                size="sm"
                className="data-[state=on]:bg-muted h-10 w-10"
              >
                <LayoutGrid className="h-4 w-4" />
              </Toggle>
              <Toggle
                pressed={!isGridView}
                onPressedChange={() => setIsGridView(false)}
                size="sm"
                className="data-[state=on]:bg-muted h-10 w-10"
              >
                <List className="h-4 w-4" />
              </Toggle>
            </div>

            {productLines && productLines.length > 0 && (
              <ToggleGroup 
                type="multiple"
                value={selectedProductLines}
                onValueChange={handleProductLineChange}
                className="flex flex-wrap gap-1"
              >
                {productLines.map((pl) => (
                  <ToggleGroupItem
                    key={pl.id}
                    value={pl.id}
                    variant="primary"
                    size="sm"
                    className="h-10 px-[10px] py-[10px] text-xs"
                  >
                    {pl.product_line_code || pl.name}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            )}

            {isSearchExpanded ? (
              <div className="relative">
                <Input
                  id="sculpture-search"
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="h-10 w-[200px] pl-8"
                  onBlur={() => !searchValue && setIsSearchExpanded(false)}
                  placeholder="Search sculptures..."
                />
                <Search className="h-4 w-4 absolute left-2 top-3 text-muted-foreground" />
              </div>
            ) : (
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={handleSearchClick}
                >
                  <Search className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
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
              className="gap-2 h-10"
            >
              <UploadIcon className="h-4 w-4" />
              Add
            </Button>
            <Button 
              onClick={() => setIsCreateSheetOpen(true)}
              className="gap-2 h-10"
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
              isGridView={isGridView}
              selectedProductLines={selectedProductLines}
              searchQuery={searchValue}
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
