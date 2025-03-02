
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUsers } from "@/hooks/useTasks";
import { useTaskMutations } from "@/hooks/useTasks";
import { CreateTaskInput, TaskStatus, TaskRelatedType } from "@/types/task";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sculptureId?: string | null;
  clientId?: string | null;
  orderId?: string | null;
  leadId?: string | null;
  relatedType?: TaskRelatedType;
}

interface SculptureOption {
  id: string;
  name: string;
}

export function CreateTaskDialog({ 
  open, 
  onOpenChange, 
  sculptureId = null,
  clientId = null,
  orderId = null,
  leadId = null,
  relatedType = null
}: CreateTaskDialogProps) {
  const { toast } = useToast();
  const { createTask } = useTaskMutations();
  const { data: users = [] } = useUsers();
  
  const [taskData, setTaskData] = useState<CreateTaskInput>({
    title: "",
    description: "",
    assigned_to: null,
    status: "todo",
    related_type: relatedType,
    sculpture_id: sculptureId,
    client_id: clientId,
    order_id: orderId,
    lead_id: leadId
  });

  // Fetch available sculptures for the dropdown
  const { data: sculptures = [], isLoading: sculpturesLoading } = useQuery({
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
      
      return (data || []).map(s => ({
        id: s.id,
        name: s.ai_generated_name || "Unnamed Sculpture"
      })) as SculptureOption[];
    },
    enabled: open && (taskData.related_type === "sculpture" || taskData.related_type === null), 
  });

  // Update taskData when props change or when dialog opens
  useEffect(() => {
    if (open) {
      console.log("Setting initial task data in dialog");
      setTaskData(prev => ({ 
        ...prev, 
        sculpture_id: sculptureId,
        client_id: clientId,
        order_id: orderId,
        lead_id: leadId,
        related_type: relatedType
      }));
    }
  }, [open, sculptureId, clientId, orderId, leadId, relatedType]);

  // Handle related type change
  const handleRelatedTypeChange = (type: string) => {
    const newType = type === "" ? null : type as TaskRelatedType;
    
    // Reset all related entity IDs
    const newData = {
      ...taskData,
      related_type: newType,
      sculpture_id: null,
      client_id: null,
      order_id: null,
      lead_id: null
    };
    
    // Set the previously selected ID if it matches the new type
    if (newType === "sculpture" && sculptureId) {
      newData.sculpture_id = sculptureId;
    } else if (newType === "client" && clientId) {
      newData.client_id = clientId;
    } else if (newType === "order" && orderId) {
      newData.order_id = orderId;
    } else if (newType === "lead" && leadId) {
      newData.lead_id = leadId;
    }
    
    setTaskData(newData);
  };

  const handleEntitySelection = (id: string) => {
    switch (taskData.related_type) {
      case "sculpture":
        setTaskData(prev => ({ ...prev, sculpture_id: id }));
        break;
      case "client":
        setTaskData(prev => ({ ...prev, client_id: id }));
        break;
      case "order":
        setTaskData(prev => ({ ...prev, order_id: id }));
        break;
      case "lead":
        setTaskData(prev => ({ ...prev, lead_id: id }));
        break;
    }
  };

  const handleCreateTask = async () => {
    if (!taskData.title.trim()) {
      toast({
        title: "Error",
        description: "Task title is required",
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
      title: "",
      description: "",
      assigned_to: null,
      status: "todo",
      related_type: relatedType,
      sculpture_id: sculptureId,
      client_id: clientId,
      order_id: orderId,
      lead_id: leadId
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="related-type">Task Related To</Label>
            <Select
              value={taskData.related_type || ""}
              onValueChange={handleRelatedTypeChange}
            >
              <SelectTrigger id="related-type">
                <SelectValue placeholder="Not associated with anything" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Not associated</SelectItem>
                <SelectItem value="sculpture">Sculpture</SelectItem>
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="order">Order</SelectItem>
                <SelectItem value="lead">Lead</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {taskData.related_type === "sculpture" && (
            <div className="space-y-2">
              <Label htmlFor="sculpture">Sculpture</Label>
              <Select
                value={taskData.sculpture_id || ""}
                onValueChange={handleEntitySelection}
              >
                <SelectTrigger id="sculpture">
                  <SelectValue placeholder="Select a sculpture" />
                </SelectTrigger>
                <SelectContent>
                  {sculpturesLoading ? (
                    <SelectItem value="" disabled>Loading sculptures...</SelectItem>
                  ) : sculptures.length === 0 ? (
                    <SelectItem value="" disabled>No sculptures available</SelectItem>
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
          )}
          
          {taskData.related_type === "client" && (
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Select disabled value="">
                <SelectTrigger id="client">
                  <SelectValue placeholder="Client functionality coming soon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Client functionality coming soon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          {taskData.related_type === "order" && (
            <div className="space-y-2">
              <Label htmlFor="order">Order</Label>
              <Select disabled value="">
                <SelectTrigger id="order">
                  <SelectValue placeholder="Order functionality coming soon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Order functionality coming soon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          {taskData.related_type === "lead" && (
            <div className="space-y-2">
              <Label htmlFor="lead">Lead</Label>
              <Select disabled value="">
                <SelectTrigger id="lead">
                  <SelectValue placeholder="Lead functionality coming soon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Lead functionality coming soon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
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
        
        <div className="flex justify-end gap-3">
          <DialogClose asChild>
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
          </DialogClose>
          <Button 
            onClick={handleCreateTask} 
            disabled={createTask.isPending}
          >
            {createTask.isPending ? "Creating..." : "Create Task"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
