
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SortingSectionProps {
  sortBy: 'created_at' | 'ai_generated_name' | 'updated_at';
  sortOrder: 'asc' | 'desc';
  onSortByChange: (value: 'created_at' | 'ai_generated_name' | 'updated_at') => void;
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
            <SelectItem value="ai_generated_name">Sculpture Name</SelectItem>
            <SelectItem value="updated_at">Last Modified</SelectItem>
          </SelectContent>
        </Select>

        <Tabs
          value={sortOrder}
          onValueChange={onSortOrderChange}
          className="w-[120px]"
        >
          <TabsList className="w-full h-9">
            <TabsTrigger value="asc" className="flex-1 text-xs px-2">ASC</TabsTrigger>
            <TabsTrigger value="desc" className="flex-1 text-xs px-2">DESC</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
