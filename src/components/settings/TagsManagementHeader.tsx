
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface TagsManagementHeaderProps {
  onCreateTag: () => void;
}

export function TagsManagementHeader({ onCreateTag }: TagsManagementHeaderProps) {
  return (
    <div className="sticky top-0 bg-background pt-4 z-10">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Sculpture Tags</h3>
        <Button 
          onClick={onCreateTag} 
          size="sm"
          className="h-8"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Tag
        </Button>
      </div>
      <Separator className="mt-4" />
    </div>
  );
}
