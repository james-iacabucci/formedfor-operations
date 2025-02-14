
import { useState } from "react";
import { Sculpture } from "@/types/sculpture";
import { DeleteSculptureDialog } from "./sculpture/DeleteSculptureDialog";
import { ManageTagsDialog } from "./tags/ManageTagsDialog";
import { useSculpturesData } from "@/hooks/useSculpturesData";
import { SculpturesGrid } from "./sculpture/SculpturesGrid";
import { Button } from "@/components/ui/button";
import { PlusIcon, UploadIcon } from "lucide-react";

interface SculpturesListProps {
  selectedTags: string[];
}

export function SculpturesList({ selectedTags }: SculpturesListProps) {
  const [sculptureToDelete, setSculptureToDelete] = useState<Sculpture | null>(null);
  const [sculptureToManageTags, setSculptureToManageTags] = useState<Sculpture | null>(null);
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);

  const { sculptures, isLoading, sculptureTagRelations, tags } = useSculpturesData(selectedTags);

  console.log("[SculpturesList] Current sculptures:", sculptures);
  console.log("[SculpturesList] Current sculptureToDelete:", sculptureToDelete);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!sculptures?.length) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <h3 className="text-xl font-semibold mb-2">No sculptures yet</h3>
        <p className="text-muted-foreground max-w-sm mb-8">
          Start by creating a new sculpture or upload an existing one using the buttons below.
        </p>
        <div className="flex gap-4">
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
    );
  }

  return (
    <>
      <SculpturesGrid 
        sculptures={sculptures}
        tags={tags}
        sculptureTagRelations={sculptureTagRelations}
        onDelete={(sculpture) => {
          console.log("[SculpturesList] Setting sculpture to delete:", sculpture.id);
          setSculptureToDelete(sculpture);
        }}
        onManageTags={(sculpture) => setSculptureToManageTags(sculpture)}
      />

      {sculptureToDelete && (
        <DeleteSculptureDialog
          sculpture={sculptureToDelete}
          open={!!sculptureToDelete}
          onOpenChange={(open) => {
            console.log("[SculpturesList] Dialog open change:", open);
            if (!open) setSculptureToDelete(null);
          }}
        />
      )}

      <ManageTagsDialog
        sculpture={sculptureToManageTags}
        open={!!sculptureToManageTags}
        onOpenChange={(open) => !open && setSculptureToManageTags(null)}
      />
    </>
  );
}
