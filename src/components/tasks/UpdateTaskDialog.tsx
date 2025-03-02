
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTaskMutations } from "@/hooks/tasks";
import { useUsers } from "@/hooks/tasks";
import { TaskWithAssignee, TaskStatus, TaskRelatedType } from "@/types/task";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UpdateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: TaskWithAssignee;
}

export function UpdateTaskDialog({ open, onOpenChange, task }: UpdateTaskDialogProps) {
  const { updateTask } = useTaskMutations();
  const { data: users = [] } = useUsers();
  const { toast } = useToast();
  
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [assignedTo, setAssignedTo] = useState(task.assigned_to || "");
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [relatedType, setRelatedType] = useState<TaskRelatedType>(task.related_type);
  const [sculptureId, setSculptureId] = useState<string | null>(task.sculpture_id);
  const [clientId, setClientId] = useState<string | null>(task.client_id);
  const [orderId, setOrderId] = useState<string | null>(task.order_id);
  const [leadId, setLeadId] = useState<string | null>(task.lead_id);
  
  // Fetch available sculptures for the dropdown
  const { data: sculptures = [], isLoading: sculpturesLoading } = useQuery({
    queryKey: ["sculptures-minimal"],
    queryFn: async () => {
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
      }));
    },
    enabled: open && relatedType === "sculpture",
  });
  
  // Reset form values when task changes
  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || "");
    setAssignedTo(task.assigned_to || "");
    setStatus(task.status);
    setRelatedType(task.related_type);
    setSculptureId(task.sculpture_id);
    setClientId(task.client_id);
    setOrderId(task.order_id);
    setLeadId(task.lead_id);
  }, [task]);
  
  // Handle related type change
  const handleRelatedTypeChange = (type: string) => {
    const newType = type === "" ? null : type as TaskRelatedType;
    setRelatedType(newType);
    
    // Reset all entity IDs
    setSculptureId(null);
    setClientId(null);
    setOrderId(null);
    setLeadId(null);
  };
  
  const handleEntitySelection = (id: string) => {
    switch (relatedType) {
      case "sculpture":
        setSculptureId(id || null);
        break;
      case "client":
        setClientId(id || null);
        break;
      case "order":
        setOrderId(id || null);
        break;
      case "lead":
        setLeadId(id || null);
        break;
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateTask.mutateAsync({
        id: task.id,
        title,
        description: description || null,
        assigned_to: assignedTo || null,
        status,
        related_type: relatedType,
        sculpture_id: sculptureId,
        client_id: clientId,
        order_id: orderId,
        lead_id: leadId
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Task</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="related-type">Task Related To</Label>
            <Select
              value={relatedType || ""}
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
          
          {relatedType === "sculpture" && (
            <div className="space-y-2">
              <Label htmlFor="sculpture">Sculpture</Label>
              <Select
                value={sculptureId || ""}
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
                    sculptures.map((sculpture: any) => (
                      <SelectItem key={sculpture.id} value={sculpture.id}>
                        {sculpture.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {relatedType === "client" && (
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
          
          {relatedType === "order" && (
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
          
          {relatedType === "lead" && (
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
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as TaskStatus)}>
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
          
          <div className="space-y-2">
            <Label htmlFor="assignee">Assignee</Label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger id="assignee">
                <SelectValue placeholder="Unassigned" />
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
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateTask.isPending}>
              {updateTask.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
