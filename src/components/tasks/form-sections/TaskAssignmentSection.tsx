
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TaskStatus } from "@/types/task";

interface User {
  id: string;
  username: string | null;
}

interface TaskAssignmentSectionProps {
  assignedTo: string | null;
  status: TaskStatus;
  users: User[];
  onAssigneeChange: (value: string) => void;
  onStatusChange: (value: TaskStatus) => void;
}

export function TaskAssignmentSection({
  assignedTo,
  status,
  users,
  onAssigneeChange,
  onStatusChange
}: TaskAssignmentSectionProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="assigned-to">Assigned To</Label>
        <Select
          value={assignedTo || "unassigned"}
          onValueChange={onAssigneeChange}
        >
          <SelectTrigger id="assigned-to">
            <SelectValue placeholder="Select assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned">Unassigned</SelectItem>
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
          value={status}
          onValueChange={(value) => onStatusChange(value as TaskStatus)}
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
    </>
  );
}
