import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { PlusIcon } from "lucide-react";

interface Folder {
  id: string;
  name: string;
}

interface FolderSelectProps {
  selectedFolderId: string | null;
  onFolderChange: (folderId: string | null) => void;
}

export function FolderSelect({ selectedFolderId, onFolderChange }: FolderSelectProps) {
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const queryClient = useQueryClient();

  const { data: folders } = useQuery({
    queryKey: ["folders"],
    queryFn: async () => {
      console.log("Fetching folders...");
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("folders")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching folders:", error);
        throw error;
      }

      console.log("Fetched folders:", data);
      return data as Folder[];
    },
  });

  const createFolderMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("folders")
        .insert([{ name, user_id: user.user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      setNewFolderName("");
      setIsNewFolderDialogOpen(false);
      toast({
        title: "Folder created",
        description: "Your new folder has been created successfully.",
      });
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

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    createFolderMutation.mutate(newFolderName);
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedFolderId || "all"}
        onValueChange={(value) => onFolderChange(value === "all" ? null : value)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select folder" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sculptures</SelectItem>
          {folders?.map((folder) => (
            <SelectItem key={folder.id} value={folder.id}>
              {folder.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={isNewFolderDialogOpen} onOpenChange={setIsNewFolderDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <PlusIcon className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Input
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
            />
            <Button onClick={handleCreateFolder}>Create Folder</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}