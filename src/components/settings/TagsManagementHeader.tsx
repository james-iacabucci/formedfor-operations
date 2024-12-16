import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface TagsManagementHeaderProps {
  onCreateTag: () => void;
}

export function TagsManagementHeader({ onCreateTag }: TagsManagementHeaderProps) {
  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Manage Sculpture Tags</h3>
        <Button 
          onClick={onCreateTag} 
          size="sm"
          className="h-8"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Tag
        </Button>
      </div>
      <Separator />
    </>
  );
}