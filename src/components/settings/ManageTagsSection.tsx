
import { useTagsManagement } from "../tags/useTagsManagement";
import { useTagsState } from "./useTagsState";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { DeletedTagItem } from "./DeletedTagItem";

export function ManageTagsSection() {
  const { tags } = useTagsManagement(undefined);
  const {
    editingTag,
    setEditingTag,
    pendingDeletes,
    pendingEdits,
    startEditingTag,
    handleUpdateTag,
    handleDeleteTag,
    undoDelete,
    undoEdit,
    applyChanges,
  } = useTagsState();

  return (
    <div className="border rounded-md">
      <ScrollArea className="h-[400px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Name</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tags?.filter(tag => !pendingDeletes.has(tag.id)).map((tag) => (
              <TableRow key={tag.id}>
                <TableCell>
                  {pendingEdits.has(tag.id) ? pendingEdits.get(tag.id)! : tag.name}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditingTag(tag.id, tag.name)}
                      className="h-7 w-7 p-0"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTag(tag.id)}
                      className="h-7 w-7 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      {Array.from(pendingDeletes).map(tagId => {
        const tag = tags?.find(t => t.id === tagId);
        if (!tag) return null;
        
        return (
          <DeletedTagItem
            key={tag.id}
            name={tag.name}
            onUndo={() => undoDelete(tag.id)}
          />
        );
      })}
    </div>
  );
}
