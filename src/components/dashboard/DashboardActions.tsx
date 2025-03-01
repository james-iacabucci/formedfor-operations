
import { Button } from "@/components/ui/button";
import { PlusIcon, UploadIcon } from "lucide-react";

interface DashboardActionsProps {
  setIsAddSheetOpen: (value: boolean) => void;
  setIsCreateSheetOpen: (value: boolean) => void;
}

export function DashboardActions({
  setIsAddSheetOpen,
  setIsCreateSheetOpen
}: DashboardActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button 
        onClick={() => setIsAddSheetOpen(true)}
        variant="outline"
        size="sm"
        className="gap-2 h-9 px-3"
      >
        <UploadIcon className="h-4 w-4" />
        Add
      </Button>
      <Button 
        onClick={() => setIsCreateSheetOpen(true)}
        variant="outline"
        size="sm"
        className="gap-2 h-9 px-3"
      >
        <PlusIcon className="h-4 w-4" />
        Create
      </Button>
    </div>
  );
}
