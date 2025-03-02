
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUsers } from "@/hooks/useTasks";
import { useTaskMutations } from "@/hooks/useTasks";
import { CreateTaskInput, TaskStatus } from "@/types/task";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sculptureId: string;
}

interface SculptureOption {
  id: string;
  name: string;
}

export function CreateTaskDialog({ open, onOpenChange, sculptureId }: CreateTaskDialogProps) {
  const { toast } = useToast();
  const { createTask } = useTaskMutations();
  const { data: users = [] } = useUsers();
  
  const [taskData, setTaskData] = useState<CreateTaskInput>({
    sculpture_id: "",
    title: "",
    description: "",
    assigned_to: null,
    status: "todo",
  });

  // Fetch available sculptures for the dropdown
  const { data: sculptures = [], isLoading: sculpturesLoading, error: sculpturesError } = useQuery({
    queryKey: ["sculptures-minimal"],
    queryFn: async () => {
      console.log("Fetching sculptures for dialog");
      const { data, error } = await supabase
        .from("sculptures")
        .select("id, ai_generated_name")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching sculptures:", error);
        throw error;
      }
      
      console.log("Fetched sculptures:", data);
      return (data || []).map(s => ({
        id: s.id,
        name: s.ai_generated_name || "Unnamed Sculpture"
      })) as SculptureOption[];
    },
    enabled: open, // Only fetch when dialog is open
  });

  // Update taskData when sculptureId prop changes or when dialog opens
  useEffect(() => {
    if (open && sculptureId) {
      console.log("Setting sculpture ID in dialog:", sculptureId);
      setTaskData(prev => ({ ...prev, sculpture_id: sculptureId }));
    }
  }, [sculptureId, open]);

  // Log state for debugging
  useEffect(() => {
    if (open) {
      console.log("Dialog opened with sculpture ID:", sculptureId);
      console.log("Current task data:", taskData);
      console.log("Available sculptures:", sculptures);
    }
  }, [open, sculptureId, taskData, sculptures]);

  const handleCreateTask = async () => {
    if (!taskData.title.trim()) {
      toast({
        title: "Error",
        description: "Task title is required",
        variant: "destructive",
      });
      return;
    }

    if (!taskData.sculpture_id) {
      toast({
        title: "Error",
        description: "Please select a sculpture",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Creating task with data:", taskData);
      await createTask.mutateAsync(taskData);
      toast({
        title: "Success",
        description: "Task created successfully",
      });
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Error creating task:", error);
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setTaskData({
      sculpture_id: sculptureId,
      title: "",
      description: "",
      assigned_to: null,
      status: "todo",
    });
  };

  if (sculpturesError) {
    console.error("Sculpture fetch error:", sculpturesError);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        
        {sculpturesLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading sculptures...
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="sculpture">Sculpture</Label>
              <Select
                value={taskData.sculpture_id || ""}
                onValueChange={(value) => {
                  console.log("Selected sculpture:", value);
                  setTaskData(prev => ({ ...prev, sculpture_id: value }));
                }}
              >
                <SelectTrigger id="sculpture">
                  <SelectValue placeholder="Select a sculpture" />
                </SelectTrigger>
                <SelectContent>
                  {sculptures.length === 0 ? (
                    <SelectItem value="">No sculptures available</SelectItem>
                  ) : (
                    sculptures.map((sculpture) => (
                      <SelectItem key={sculpture.id} value={sculpture.id}>
                        {sculpture.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Task title"
                value={taskData.title}
                onChange={(e) => setTaskData((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Task description"
                value={taskData.description || ""}
                onChange={(e) => setTaskData((prev) => ({ ...prev, description: e.target.value }))}
                className="min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="assigned-to">Assigned To</Label>
              <Select
                value={taskData.assigned_to || ""}
                onValueChange={(value) => setTaskData((prev) => ({ ...prev, assigned_to: value || null }))}
              >
                <SelectTrigger id="assigned-to">
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.username || user.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={taskData.status}
                onValueChange={(value) => setTaskData((prev) => ({ ...prev, status: value as TaskStatus }))}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        
        <div className="flex justify-end gap-3">
          <DialogClose asChild>
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
          </DialogClose>
          <Button 
            onClick={handleCreateTask} 
            disabled={createTask.isPending || sculpturesLoading}
          >
            {createTask.isPending ? "Creating..." : "Create Task"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
