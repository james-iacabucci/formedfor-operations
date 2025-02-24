
import { Button } from "@/components/ui/button";
import { Search, Settings2, LayoutGrid, List } from "lucide-react";
import { UserMenu } from "@/components/UserMenu";
import { Toggle } from "@/components/ui/toggle";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface AppHeaderProps {
  isGridView: boolean;
  onGridViewChange: (isGrid: boolean) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSettingsClick?: () => void;
}

export function AppHeader({ 
  isGridView, 
  onGridViewChange,
  searchValue,
  onSearchChange,
  onSettingsClick
}: AppHeaderProps) {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [previousSearchValue, setPreviousSearchValue] = useState("");

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
      onSearchChange(previousSearchValue);
      e.currentTarget.blur();
      if (!previousSearchValue) {
        setIsSearchExpanded(false);
      }
    }
  };

  return (
    <div className="sticky top-0 z-10 bg-background border-b">
      <div className="mx-auto max-w-7xl p-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Sculptify</h1>
          <div className="flex items-center gap-4">
            <div className="flex gap-2 border rounded-md p-0.5">
              <Toggle
                pressed={isGridView}
                onPressedChange={() => onGridViewChange(true)}
                size="sm"
                className="data-[state=on]:bg-muted h-10 w-10"
              >
                <LayoutGrid className="h-4 w-4" />
              </Toggle>
              <Toggle
                pressed={!isGridView}
                onPressedChange={() => onGridViewChange(false)}
                size="sm"
                className="data-[state=on]:bg-muted h-10 w-10"
              >
                <List className="h-4 w-4" />
              </Toggle>
            </div>

            {isSearchExpanded ? (
              <div className="relative">
                <Input
                  id="sculpture-search"
                  type="text"
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
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
                {onSettingsClick && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10"
                    onClick={onSettingsClick}
                  >
                    <Settings2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <UserMenu />
          </div>
        </div>
      </div>
    </div>
  );
}
