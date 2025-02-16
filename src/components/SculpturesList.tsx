
import { useState } from "react";
import { Sculpture } from "@/types/sculpture";
import { DeleteSculptureDialog } from "./sculpture/DeleteSculptureDialog";
import { ManageTagsDialog } from "./tags/ManageTagsDialog";
import { useSculpturesData } from "@/hooks/useSculpturesData";
import { SculpturesGrid } from "./sculpture/SculpturesGrid";
import { SculpturesTable } from "./sculpture/SculpturesTable";
import { Button } from "@/components/ui/button";
import { PlusIcon, UploadIcon, LayoutGrid, List } from "lucide-react";
import { TagsSelect } from "@/components/tags/TagsSelect";
import { Toggle } from "@/components/ui/toggle";

interface SculpturesListProps {
  selectedTags: string[];
}

export function SculpturesList({ selectedTags }: SculpturesListProps) {
  const [sculptureToDelete, setSculptureToDelete] = useState<Sculpture | null>(null);
  const [sculptureToManageTags, setSculptureToManageTags] = useState<Sculpture | null>(null);
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isGridView, setIsGridView] = useState(true);

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
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <TagsSelect 
          selectedTags={selectedTags} 
          onTagsChange={(tags) => {
            const event = new CustomEvent('tagsChange', { detail: tags });
            window.dispatchEvent(event);
          }}
        />
        <div className="flex gap-2 border rounded-md p-0.5">
          <Toggle
            pressed={isGridView}
            onPressedChange={() => setIsGridView(true)}
            size="sm"
            className="data-[state=on]:bg-muted"
          >
            <LayoutGrid className="h-4 w-4" />
          </Toggle>
          <Toggle
            pressed={!isGridView}
            onPressedChange={() => setIsGridView(false)}
            size="sm"
            className="data-[state=on]:bg-muted"
          >
            <List className="h-4 w-4" />
          </Toggle>
        </div>
      </div>

      {isGridView ? (
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
      ) : (
        <SculpturesTable
          sculptures={sculptures}
          tags={tags}
          sculptureTagRelations={sculptureTagRelations}
          onDelete={(sculpture) => {
            console.log("[SculpturesList] Setting sculpture to delete:", sculpture.id);
            setSculptureToDelete(sculpture);
          }}
          onManageTags={(sculpture) => setSculptureToManageTags(sculpture)}
        />
      )}

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
