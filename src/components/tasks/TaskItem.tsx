
import { useState } from "react";
import { Task, TaskStatus, TaskWithAssignee } from "@/types/task";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, Edit, Trash, GripVertical, ChevronsUpDown } from "lucide-react";
import { useTaskMutations, useUsers } from "@/hooks/useTasks";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: TaskWithAssignee;
  isDragging?: boolean;
}

export function TaskItem({ task, isDragging }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [assignedTo, setAssignedTo] = useState<string | null>(task.assigned_to);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [openAssigneePopover, setOpenAssigneePopover] = useState(false);
  
  const { updateTask, deleteTask } = useTaskMutations();
  const { data: users = [] } = useUsers();
  
  const handleSaveEdit = async () => {
    if (!title.trim()) return;
    
    await updateTask.mutateAsync({
      id: task.id,
      title: title.trim(),
      description: description.trim() || null,
      assigned_to: assignedTo,
      status
    });
    
    setIsEditing(false);
  };
  
  const handleStatusChange = async (newStatus: TaskStatus) => {
    setStatus(newStatus);
    if (!isEditing) {
      await updateTask.mutateAsync({
        id: task.id,
        status: newStatus
      });
    }
  };
  
  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this task?")) {
      await deleteTask.mutateAsync(task.id);
    }
  };
  
  const statusOptions = [
    { value: "todo", label: "To Do" },
    { value: "in_progress", label: "In Progress" },
    { value: "done", label: "Done" }
  ];
  
  return (
    <Card className={cn(
      "mb-2 relative transition-shadow",
      isDragging ? "shadow-lg" : "shadow-sm",
      task.status === "done" ? "opacity-60" : ""
    )}>
      <div className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-grab text-muted-foreground">
        <GripVertical className="h-4 w-4" />
      </div>
      <CardContent className="p-3 pl-8">
        {isEditing ? (
          <div className="space-y-2">
            <Input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full font-medium"
              placeholder="Task title"
            />
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-24 text-sm"
              placeholder="Task description"
            />
            <div className="flex items-center justify-between pt-2">
              <div className="flex space-x-2">
                <Popover open={openAssigneePopover} onOpenChange={setOpenAssigneePopover}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      role="combobox"
                      aria-expanded={openAssigneePopover}
                      className="justify-between"
                    >
                      {assignedTo ? (
                        <>
                          {users.find((user) => user.id === assignedTo)?.username || "Unassigned"}
                          <Avatar className="h-6 w-6 ml-2">
                            <AvatarImage src={users.find((user) => user.id === assignedTo)?.avatar_url || ""} />
                            <AvatarFallback>
                              {users.find((user) => user.id === assignedTo)?.username?.[0].toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                        </>
                      ) : (
                        "Unassigned"
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Search assignee..." />
                      <CommandEmpty>No user found.</CommandEmpty>
                      <CommandGroup>
                        {users.map((user) => (
                          <CommandItem
                            key={user.id}
                            value={user.id}
                            onSelect={() => {
                              setAssignedTo(user.id);
                              setOpenAssigneePopover(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                assignedTo === user.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex items-center">
                              <span>{user.username || "User"}</span>
                              <Avatar className="h-6 w-6 ml-2">
                                <AvatarImage src={user.avatar_url || ""} />
                                <AvatarFallback>
                                  {user.username?.[0].toUpperCase() || "U"}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                
                <Select value={status} onValueChange={(value) => handleStatusChange(value as TaskStatus)}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSaveEdit}
                  disabled={updateTask.isPending || !title.trim()}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Select value={status} onValueChange={(value) => handleStatusChange(value as TaskStatus)}>
                  <SelectTrigger className="w-[120px] h-8">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <h3 className="font-medium ml-2">{task.title}</h3>
              </div>
              
              <div className="flex space-x-1">
                <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} className="h-8 w-8">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleDelete} className="h-8 w-8">
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {task.description && (
              <p className="text-sm text-muted-foreground">{task.description}</p>
            )}
            
            {task.assignee && (
              <div className="flex items-center pt-1">
                <span className="text-xs text-muted-foreground mr-1">Assigned to:</span>
                <div className="flex items-center">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={task.assignee.avatar_url || ""} />
                    <AvatarFallback>
                      {task.assignee.username?.[0].toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="ml-1 text-xs font-medium">
                    {task.assignee.username || "Unknown User"}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
