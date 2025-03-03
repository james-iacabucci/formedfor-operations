
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface TaskDetailsSectionProps {
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

export function TaskDetailsSection({
  title,
  description,
  onTitleChange,
  onDescriptionChange
}: TaskDetailsSectionProps) {
  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center gap-2 border rounded-md py-0 px-3">
          <span className="text-muted-foreground text-sm">Title:</span>
          <Input
            id="title"
            placeholder="Task title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            required
            className="border-0 focus-visible:ring-0 px-0"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-start border rounded-md py-2 px-3">
          <span className="text-muted-foreground text-sm pt-1 mr-2">Description:</span>
          <Textarea
            id="description"
            placeholder="Task description"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            className="min-h-[100px] border-0 focus-visible:ring-0 px-0 py-0"
          />
        </div>
      </div>
    </>
  );
}
