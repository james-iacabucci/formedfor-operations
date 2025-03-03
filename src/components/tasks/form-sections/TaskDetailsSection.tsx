
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "../editor/RichTextEditor";
import { TaskAttachments } from "../attachments/TaskAttachments";
import { TaskAttachment } from "@/types/task";

interface TaskDetailsSectionProps {
  title: string;
  description: string;
  attachments?: TaskAttachment[] | null;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onAttachmentsChange?: (attachments: TaskAttachment[]) => void;
  disabled?: boolean;
}

export function TaskDetailsSection({
  title,
  description,
  attachments = null,
  onTitleChange,
  onDescriptionChange,
  onAttachmentsChange,
  disabled = false
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
          disabled={disabled}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <RichTextEditor
          value={description}
          onChange={onDescriptionChange}
          disabled={disabled}
        />
      </div>

      {onAttachmentsChange && (
        <TaskAttachments
          attachments={attachments}
          onAttachmentsChange={onAttachmentsChange}
          disabled={disabled}
        />
      )}
    </>
  );
}
