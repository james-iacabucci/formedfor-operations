
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTaskMutations, useUsers } from "@/hooks/useTasks";
import { CreateTaskInput } from "@/types/task";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, ChevronsUpDown } from "lucide-react";
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
import { cn } from "@/lib/utils";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sculptureId: string;
}

export function CreateTaskDialog({ open, onOpenChange, sculptureId }: CreateTaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  const [openAssigneePopover, setOpenAssigneePopover] = useState(false);
  
  const { createTask } = useTaskMutations();
  const { data: users = [] } = useUsers();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    const taskInput: CreateTaskInput = {
      sculpture_id: sculptureId,
      title: title.trim(),
      description: description.trim() || null,
      assigned_to: assignedTo,
    };
    
    await createTask.mutateAsync(taskInput);
    resetForm();
    onOpenChange(false);
  };
  
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setAssignedTo(null);
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description"
              className="min-h-24"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="assignee">Assignee</Label>
            <Popover open={openAssigneePopover} onOpenChange={setOpenAssigneePopover}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openAssigneePopover}
                  className="w-full justify-between"
                >
                  {assignedTo ? (
                    <>
                      {users.find((user) => user.id === assignedTo)?.username || "Unassigned"}
                      {users.find((user) => user.id === assignedTo) && (
                        <Avatar className="h-6 w-6 ml-2">
                          <AvatarImage src={users.find((user) => user.id === assignedTo)?.avatar_url || ""} />
                          <AvatarFallback>
                            {users.find((user) => user.id === assignedTo)?.username?.[0].toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </>
                  ) : (
                    "Select assignee"
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
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={createTask.isPending || !title.trim()}
            >
              {createTask.isPending ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
