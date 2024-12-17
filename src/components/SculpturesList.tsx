import { useState } from "react";
import { Sculpture } from "@/types/sculpture";
import { DeleteSculptureDialog } from "./sculpture/DeleteSculptureDialog";
import { ManageTagsDialog } from "./tags/ManageTagsDialog";
import { useSculpturesData } from "@/hooks/useSculpturesData";
import { SculpturesGrid } from "./sculpture/SculpturesGrid";

interface SculpturesListProps {
  selectedTags: string[];
}

export function SculpturesList({ selectedTags }: SculpturesListProps) {
  const [sculptureToDelete, setSculptureToDelete] = useState<Sculpture | null>(null);
  const [sculptureToManageTags, setSculptureToManageTags] = useState<Sculpture | null>(null);

  const { sculptures, isLoading, sculptureTagRelations, tags } = useSculpturesData(selectedTags);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!sculptures?.length) {
    return <div>No sculptures found</div>;
  }

  return (
    <>
      <SculpturesGrid 
        sculptures={sculptures}
        tags={tags}
        sculptureTagRelations={sculptureTagRelations}
        onDelete={setSculptureToDelete}
        onManageTags={setSculptureToManageTags}
      />

      <DeleteSculptureDialog
        sculpture={sculptureToDelete}
        open={!!sculptureToDelete}
        onOpenChange={(open) => !open && setSculptureToDelete(null)}
      />

      <ManageTagsDialog
        sculpture={sculptureToManageTags}
        open={!!sculptureToManageTags}
        onOpenChange={(open) => !open && setSculptureToManageTags(null)}
      />
    </>
  );
}