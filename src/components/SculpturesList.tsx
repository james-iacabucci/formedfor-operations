
import { useState } from "react";
import { Sculpture } from "@/types/sculpture";
import { DeleteSculptureDialog } from "./sculpture/DeleteSculptureDialog";
import { ManageTagsDialog } from "./tags/ManageTagsDialog";
import { useSculpturesData } from "@/hooks/useSculpturesData";
import { SculpturesGrid } from "./sculpture/SculpturesGrid";
import { BoxIcon } from "lucide-react";

interface SculpturesListProps {
  selectedTags: string[];
}

export function SculpturesList({ selectedTags }: SculpturesListProps) {
  const [sculptureToDelete, setSculptureToDelete] = useState<Sculpture | null>(null);
  const [sculptureToManageTags, setSculptureToManageTags] = useState<Sculpture | null>(null);

  const { sculptures, isLoading, sculptureTagRelations, tags } = useSculpturesData(selectedTags);

  console.log("[SculpturesList] Current sculptures:", sculptures);
  console.log("[SculpturesList] Current sculptureToDelete:", sculptureToDelete);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!sculptures?.length) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="relative w-64 h-64 mb-6">
          <img
            src="https://images.unsplash.com/photo-1535268647677-300dbf3d78d1"
            alt="No sculptures found"
            className="w-full h-full object-cover rounded-lg opacity-50"
          />
          <BoxIcon className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No sculptures yet</h3>
        <p className="text-muted-foreground max-w-sm">
          Start by creating a new sculpture or upload an existing one using the buttons above.
        </p>
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
