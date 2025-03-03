
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
        <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
        <Input
          id="title"
          placeholder="Task title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          required
          className="bg-transparent text-base border border-input rounded-md"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Task description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className="min-h-[100px] bg-transparent text-base border border-input rounded-md"
        />
      </div>
    </>
  );
}
