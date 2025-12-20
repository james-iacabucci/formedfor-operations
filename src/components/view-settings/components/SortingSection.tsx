
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SortingSectionProps {
  sortBy: 'created_at' | 'name' | 'updated_at';
  sortOrder: 'asc' | 'desc';
  onSortByChange: (value: 'created_at' | 'name' | 'updated_at') => void;
  onSortOrderChange: (value: 'asc' | 'desc') => void;
}

export function SortingSection({ 
  sortBy, 
  sortOrder, 
  onSortByChange, 
  onSortOrderChange 
}: SortingSectionProps) {
  return (
    <div className="space-y-4">
      <Label>Sort By</Label>
      <div className="flex gap-2 items-center">
        <Select
          value={sortBy}
          onValueChange={onSortByChange}
        >
          <SelectTrigger className="w-full focus:ring-0 focus:ring-offset-0">
            <SelectValue placeholder="Select field" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">Creation Date</SelectItem>
            <SelectItem value="name">Sculpture Name</SelectItem>
            <SelectItem value="updated_at">Last Modified</SelectItem>
          </SelectContent>
        </Select>

        <Tabs
          value={sortOrder}
          onValueChange={onSortOrderChange}
          className="w-[120px]"
        >
          <TabsList className="h-8 p-0.5 bg-muted/30">
            <TabsTrigger 
              value="asc" 
              className="h-7 px-3 py-1 text-xs font-medium rounded-md text-foreground dark:text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
            >
              ASC
            </TabsTrigger>
            <TabsTrigger 
              value="desc" 
              className="h-7 px-3 py-1 text-xs font-medium rounded-md text-foreground dark:text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
            >
              DESC
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
