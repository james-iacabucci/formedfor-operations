import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Sculpture } from "@/types/sculpture";
import { PlusIcon, FolderIcon } from "lucide-react";

interface AddToFolderDialogProps {
  sculpture: Sculpture | null;
  onOpenChange: (open: boolean) => void;
}

interface Folder {
  id: string;
  name: string;
}

export function AddToFolderDialog({
  sculpture,
  onOpenChange,
}: AddToFolderDialogProps) {
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const queryClient = useQueryClient();

  const { data: folders } = useQuery({
    queryKey: ["folders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("folders")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as Folder[];
    },
  });

  const addToFolderMutation = useMutation({
    mutationFn: async (folderId: string) => {
      const { error } = await supabase
        .from("folder_sculptures")
        .insert([{ folder_id: folderId, sculpture_id: sculpture?.id }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      toast({
        title: "Added to folder",
        description: "The sculpture has been added to the folder.",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Error adding to folder:", error);
      toast({
        title: "Error",
        description: "Failed to add to folder. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createFolderMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from("folders")
        .insert([{ name }])
        .select()
        .single();

      if (error) throw error;
      return data as Folder;
    },
    onSuccess: (newFolder) => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      setNewFolderName("");
      setIsCreatingFolder(false);
      addToFolderMutation.mutate(newFolder.id);
    },
    onError: (error) => {
      console.error("Error creating folder:", error);
      toast({
        title: "Error",
        description: "Failed to create folder. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddToFolder = (folderId: string) => {
    addToFolderMutation.mutate(folderId);
  };

  const handleCreateAndAdd = () => {
    if (!newFolderName.trim()) return;
    createFolderMutation.mutate(newFolderName);
  };

  return (
    <Dialog open={sculpture !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Folder</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {isCreatingFolder ? (
            <div className="space-y-2">
              <Input
                placeholder="New folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
              <div className="flex gap-2">
                <Button onClick={handleCreateAndAdd}>Create and Add</Button>
                <Button
                  variant="outline"
                  onClick={() => setIsCreatingFolder(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setIsCreatingFolder(true)}
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Create New Folder
            </Button>
          )}

          <div className="space-y-2">
            {folders?.map((folder) => (
              <Button
                key={folder.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleAddToFolder(folder.id)}
              >
                <FolderIcon className="mr-2 h-4 w-4" />
                {folder.name}
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}