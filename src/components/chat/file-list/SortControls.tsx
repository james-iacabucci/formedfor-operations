
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type SortBy = "modified" | "uploaded" | "user";
export type SortOrder = "asc" | "desc";

interface SortControlsProps {
  sortBy: SortBy;
  sortOrder: SortOrder;
  onSortByChange: (value: SortBy) => void;
  onSortOrderChange: (value: SortOrder) => void;
}

export function SortControls({ 
  sortBy, 
  sortOrder, 
  onSortByChange, 
  onSortOrderChange 
}: SortControlsProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Sorting field tabs */}
      <Tabs 
        defaultValue="modified" 
        className="flex-1" 
        value={sortBy} 
        onValueChange={(value) => onSortByChange(value as SortBy)}
      >
        <TabsList className="h-8 p-0.5 bg-muted/30">
          <TabsTrigger 
            value="modified" 
            className="h-7 px-3 py-1 text-xs font-medium rounded-md data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
          >
            Last Modified
          </TabsTrigger>
          <TabsTrigger 
            value="uploaded" 
            className="h-7 px-3 py-1 text-xs font-medium rounded-md data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
          >
            Upload Date
          </TabsTrigger>
          <TabsTrigger 
            value="user" 
            className="h-7 px-3 py-1 text-xs font-medium rounded-md data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
          >
            Uploaded By
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Sort direction tabs */}
      <Tabs 
        defaultValue="desc" 
        className="w-[120px]" 
        value={sortOrder} 
        onValueChange={(value) => onSortOrderChange(value as SortOrder)}
      >
        <TabsList className="h-8 p-0.5 bg-muted/30">
          <TabsTrigger 
            value="asc" 
            className="h-7 px-3 py-1 text-xs font-medium rounded-md data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
          >
            ASC
          </TabsTrigger>
          <TabsTrigger 
            value="desc" 
            className="h-7 px-3 py-1 text-xs font-medium rounded-md data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
          >
            DESC
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
