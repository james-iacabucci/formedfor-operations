
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TaskStatus } from "@/types/task";
import { Profile } from "@/types/profile";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TaskAssignmentSectionProps {
  assignedTo: string | null;
  status: TaskStatus;
  users: Profile[];
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
      
      <div>
        <Label htmlFor="status">Status</Label>
        <Tabs 
          value={status} 
          onValueChange={(value) => onStatusChange(value as TaskStatus)}
          className="w-full"
        >
          <TabsList className="inline-flex h-auto bg-transparent p-1 rounded-full border border-[#333333] w-full">
            <TabsTrigger 
              value="todo" 
              className="h-9 px-5 py-2 text-sm font-medium rounded-full text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200 flex-1"
            >
              To Do
            </TabsTrigger>
            <TabsTrigger 
              value="in_progress" 
              className="h-9 px-5 py-2 text-sm font-medium rounded-full text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200 flex-1"
            >
              In Progress
            </TabsTrigger>
            <TabsTrigger 
              value="done" 
              className="h-9 px-5 py-2 text-sm font-medium rounded-full text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200 flex-1"
            >
              Done
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
