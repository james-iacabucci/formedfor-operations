
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Settings2, LayoutGrid, List } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Input } from "@/components/ui/input";
import { ViewSettings } from "@/hooks/use-user-preferences";
import { SelectedFilters } from "@/components/filters/SelectedFilters";

interface DashboardHeaderProps {
  viewSettings: ViewSettings;
  isSearchExpanded: boolean;
  setIsSearchExpanded: (value: boolean) => void;
  setIsViewSettingsOpen: (value: boolean) => void;
  previousSearchValue: string;
  setPreviousSearchValue: (value: string) => void;
  savePreferences: (preferences: Partial<ViewSettings>) => void;
  productLines?: Array<{ id: string; name: string }>;
  materials?: Array<{ id: string; name: string }>;
  tags?: Array<{ id: string; name: string }>;
}

export function DashboardHeader({
  viewSettings,
  isSearchExpanded,
  setIsSearchExpanded,
  setIsViewSettingsOpen,
  previousSearchValue,
  setPreviousSearchValue,
  savePreferences,
  productLines = [],
  materials = [],
  tags = []
}: DashboardHeaderProps) {
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

  return (
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
  );
}
