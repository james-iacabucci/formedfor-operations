
import { useTagsManagement } from "../tags/useTagsManagement";
import { useTagsState } from "./useTagsState";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { CreateTagForm } from "../tags/CreateTagForm";
import { TagsManagementHeader } from "./TagsManagementHeader";
import { Input } from "@/components/ui/input";

export function ManageTagsSection() {
  const { tags, createTagMutation } = useTagsManagement(undefined);
  const {
    editingTag,
    setEditingTag,
    savingTagId,
    deletingTagId,
    startEditingTag,
    handleUpdateTag,
    handleDeleteTag,
  } = useTagsState();
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  const handleCreateTag = (name: string) => {
    createTagMutation.mutate(name);
    setIsCreatingTag(false);
  };

  const handleCancelEdit = () => {
    setEditingTag(null);
  };

  return (
    <div className="space-y-4">
      <TagsManagementHeader onCreateTag={() => setIsCreatingTag(true)} />
      
      {isCreatingTag && (
        <CreateTagForm
          onCreateTag={handleCreateTag}
          onCancel={() => setIsCreatingTag(false)}
          isSubmitting={createTagMutation.isPending}
        />
      )}

      <div className="border rounded-md">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className="w-[300px]">Name</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tags?.map((tag) => (
              <TableRow key={tag.id} className="group">
                <TableCell>
                  {editingTag?.id === tag.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editingTag.name}
                        onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                        className="h-8"
                        autoFocus
                        disabled={!!savingTagId}
                      />
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleUpdateTag}
                          disabled={!!savingTagId}
                          className="h-7 w-7 p-0 hover:bg-muted/50"
                        >
                          {savingTagId === tag.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <span className="text-xs">✓</span>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCancelEdit}
                          disabled={!!savingTagId}
                          className="h-7 w-7 p-0 hover:bg-muted/50"
                        >
                          <span className="text-xs">✕</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    tag.name
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {editingTag?.id !== tag.id && (
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditingTag(tag.id, tag.name)}
                        className="h-7 w-7 p-0 hover:bg-muted/50"
                        disabled={!!savingTagId || !!deletingTagId}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTag(tag.id)}
                        className="h-7 w-7 p-0 hover:bg-muted/50"
                        disabled={!!savingTagId || !!deletingTagId}
                      >
                        {deletingTagId === tag.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
