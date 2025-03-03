
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
      <div>
        <Label htmlFor="assignee">Assign To</Label>
        <Select value={assignedTo || "unassigned"} onValueChange={onAssigneeChange}>
          <SelectTrigger id="assignee">
            <SelectValue placeholder="Select user" />
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
      
      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={(value) => onStatusChange(value as TaskStatus)}>
          <SelectTrigger id="status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="this_week">This Week</SelectItem>
            <SelectItem value="tomorrow">Tomorrow</SelectItem>
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
