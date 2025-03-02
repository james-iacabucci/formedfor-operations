
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TaskStatus } from "@/types/task";
import { Profile } from "@/types/profile";

interface TaskAssignmentSectionProps {
  assignedTo: string | null;
  status: TaskStatus;
  users: Profile[];
  onAssigneeChange: (value: string) => void;
  onStatusChange: (value: TaskStatus) => void;
}

export function TaskAssignmentSection({
  assignedTo,
  users,
  onAssigneeChange
}: TaskAssignmentSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="assignee">Assignee</Label>
        <Select value={assignedTo || "unassigned"} onValueChange={onAssigneeChange}>
          <SelectTrigger id="assignee">
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
    </div>
  );
}
