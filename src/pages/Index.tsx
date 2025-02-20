
import { Card, CardContent } from "@/components/ui/card";
import { SculpturesList } from "@/components/SculpturesList";
import { CreateSculptureSheet } from "@/components/CreateSculptureSheet";
import { AddSculptureSheet } from "@/components/AddSculptureSheet";
import { useState } from "react";
import { UserMenu } from "@/components/UserMenu";
import { Button } from "@/components/ui/button";
import { 
  AlertCircle, 
  CheckCircle, 
  Clock,
  LayoutGrid, 
  List, 
  PlusIcon, 
  Search, 
  Settings2, 
  UploadIcon, 
  XCircle 
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ViewSettingsSheet } from "@/components/view-settings/ViewSettingsSheet";
import { SelectedFilters } from "@/components/filters/SelectedFilters";
import { useTagsManagement } from "@/components/tags/useTagsManagement";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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

const Index = () => {
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isGridView, setIsGridView] = useState(true);
  const [isViewSettingsOpen, setIsViewSettingsOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [previousSearchValue, setPreviousSearchValue] = useState("");
  const [selectedProductLines, setSelectedProductLines] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
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
  };

  const handleStatusChange = (value: string | null) => {
    setSelectedStatus(value);
    setViewSettings(prev => ({
      ...prev,
      status: value
    }));
  };

  return (
    <div className="min-h-screen bg-background">
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
                    variant="outline"
                    size="sm"
                    className="px-2 py-1 text-xs"
                  >
                    {pl.product_line_code || pl.name}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            )}

            <ToggleGroup
              type="single"
              value={selectedStatus || ""}
              onValueChange={handleStatusChange}
              className="flex gap-1"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem
                    value="ideas"
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Clock className="h-4 w-4" />
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent>Ideas</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem
                    value="pending_additions"
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <AlertCircle className="h-4 w-4" />
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent>Pending Additions</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem
                    value="approved"
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent>Approved</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem
                    value="archived"
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <XCircle className="h-4 w-4" />
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent>Archived</TooltipContent>
              </Tooltip>
            </ToggleGroup>
            
            <Button
              variant="outline"
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

            {isSearchExpanded ? (
              <div className="relative">
                <Input
                  id="sculpture-search"
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="h-8 w-[200px] pl-8"
                  onBlur={() => !searchValue && setIsSearchExpanded(false)}
                  placeholder="Search sculptures..."
                />
                <Search className="h-4 w-4 absolute left-2 top-2 text-muted-foreground" />
              </div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleSearchClick}
              >
                <Search className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button 
              onClick={() => setIsAddSheetOpen(true)}
              variant="outline"
              className="gap-2"
            >
              <UploadIcon className="h-4 w-4" />
              Add
            </Button>
            <Button 
              onClick={() => setIsCreateSheetOpen(true)}
              className="gap-2"
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

export default Index;
