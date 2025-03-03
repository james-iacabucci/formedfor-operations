
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TaskStatus } from "@/types/task";

interface TaskAssignmentSectionProps {
  assignedTo: string | null;
  status: TaskStatus;
  users: {
    id: string;
    username: string;
    avatar_url: string | null;
  }[];
  onAssigneeChange: (value: string) => void;
  onStatusChange: (value: TaskStatus) => void;
}

export function TaskAssignmentSection({
  assignedTo,
  status,
  users,
  onAssigneeChange,
  onStatusChange,
}: TaskAssignmentSectionProps) {
  return (
    <div className="space-y-4">
      <div className="border rounded-md py-0 px-3">
        <Select value={assignedTo || "unassigned"} onValueChange={onAssigneeChange}>
          <SelectTrigger id="assignee" className="border-0 px-0 h-10 focus:ring-0">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Assign To:</span>
              <SelectValue placeholder="Select user" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                <div className="flex items-center">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={user.avatar_url || ""} />
                    <AvatarFallback>{user.username?.substring(0, 2) || "??"}</AvatarFallback>
                  </Avatar>
                  {user.username}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="border rounded-md py-0 px-3">
        <Select value={status} onValueChange={(value) => onStatusChange(value as TaskStatus)}>
          <SelectTrigger id="status" className="border-0 px-0 h-10 focus:ring-0">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Status:</span>
              <SelectValue placeholder="Select status" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="soon">Soon</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="waiting">Waiting</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
