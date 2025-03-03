
import { useState } from "react";
import { cva } from "class-variance-authority";
import { TaskWithAssignee } from "@/types/task";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { UpdateTaskSheet } from "./UpdateTaskSheet";
import { RichTextDisplay } from "./editor/RichTextDisplay";
import { Paperclip, ChevronDown, ChevronUp } from "lucide-react";

interface TaskItemProps {
  task: TaskWithAssignee;
  isDragging?: boolean;
}

const taskStatusColors = cva("", {
  variants: {
    status: {
      todo: "bg-secondary text-secondary-foreground",
      soon: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      today: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      in_progress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      waiting: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      done: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    },
  },
  defaultVariants: {
    status: "todo",
  },
});

export function TaskItem({ task, isDragging = false }: TaskItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const hasAttachments = task.attachments && task.attachments.length > 0;
  const hasLongDescription = task.description && task.description.length > 100;
  const shouldShowToggle = hasLongDescription || hasAttachments;

  // Handle toggle expansion without opening the edit sheet
  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      <Card 
        className={`mb-2 hover:shadow-sm transition-all cursor-pointer ${isDragging ? 'opacity-70 shadow-md' : ''}`}
        onClick={() => setIsOpen(true)}
      >
        <CardHeader className="p-3 pb-0">
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
            <div className="flex gap-1">
              {hasAttachments && (
                <div className="text-muted-foreground">
                  <Paperclip className="h-3 w-3" />
                </div>
              )}
              <Badge 
                variant="secondary" 
                className={taskStatusColors({ status: task.status })}
              >
                {task.status.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-1">
          {task.assignee && (
            <div className="flex items-center mt-1 mb-2">
              <Avatar className="h-5 w-5 mr-1">
                <AvatarImage src={task.assignee.avatar_url || undefined} />
                <AvatarFallback className="text-[10px]">
                  {getInitials(task.assignee.username || "User")}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{task.assignee.username}</span>
            </div>
          )}
          
          {task.description && (
            <div className={`task-description overflow-hidden ${!isExpanded ? 'max-h-20' : ''}`}>
              <RichTextDisplay 
                content={task.description} 
                className="text-sm" 
              />
            </div>
          )}
          
          {task.attachments && task.attachments.length > 0 && isExpanded && (
            <div className="mt-2 mb-1">
              <p className="text-xs font-medium mb-1">Attachments:</p>
              <ul className="text-xs text-muted-foreground">
                {task.attachments.map(attachment => (
                  <li key={attachment.id} className="truncate">
                    {attachment.name} ({(attachment.size / 1024).toFixed(1)} KB)
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex justify-between items-center mt-2">
            <div>
              {task.category_name && (
                <Badge variant="outline" className="text-xs font-normal">
                  {task.category_name}
                </Badge>
              )}
            </div>
            {shouldShowToggle && (
              <div className="flex items-center">
                <button 
                  className="h-6 w-6 p-0 rounded hover:bg-muted flex items-center justify-center"
                  onClick={handleToggleExpand}
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <UpdateTaskSheet 
        open={isOpen} 
        onOpenChange={setIsOpen} 
        task={task} 
      />
    </>
  );
}
