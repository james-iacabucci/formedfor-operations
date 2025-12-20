
import { useState } from "react";
import { cva } from "class-variance-authority";
import { TaskWithAssignee } from "@/types/task";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { UpdateTaskSheet } from "./UpdateTaskSheet";
import { 
  Paperclip, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Settings, 
  Image, 
  UserCircle, 
  ShoppingCart, 
  UserPlus 
} from "lucide-react";
import { getTaskAge } from "./utils/taskGrouping";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface TaskItemProps {
  task: TaskWithAssignee;
  isDragging?: boolean;
}

const taskStatusColors = cva("", {
  variants: {
    status: {
      todo: "bg-secondary text-secondary-foreground",
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

// Helper function to get the appropriate icon based on related_type
const getRelatedTypeIcon = (relatedType: string | null) => {
  switch (relatedType) {
    case "sculpture":
      return <Image className="h-3.5 w-3.5" />;
    case "client":
      return <UserCircle className="h-3.5 w-3.5" />;
    case "order":
      return <ShoppingCart className="h-3.5 w-3.5" />;
    case "lead":
      return <UserPlus className="h-3.5 w-3.5" />;
    case null:
    default:
      return <Settings className="h-3.5 w-3.5" />;
  }
};

export function TaskItem({ task, isDragging = false }: TaskItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const hasAttachments = task.attachments && task.attachments.length > 0;
  const shouldShowToggle = hasAttachments;
  const daysSinceAdded = getTaskAge(task.created_at);

  // Initialize sortable functionality
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isDraggingNow,
  } = useSortable({
    id: task.id,
    data: task,
  });

  // Combine the dragging states
  const isCurrentlyDragging = isDragging || isDraggingNow;

  // Apply transform styles from dnd-kit
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const getRelatedEntityName = () => {
    if (!task.related_type || task.related_type === null) return null;
    
    switch (task.related_type) {
      case "sculpture":
        return task.sculpture?.name || "Unnamed Sculpture";
      case "client":
        return task.client?.name || "Unnamed Client";
      case "order":
        return task.order?.name || "Unnamed Order";
      case "lead":
        return task.lead?.name || "Unnamed Lead";
      default:
        return null;
    }
  };

  const relatedEntityName = getRelatedEntityName();
  const relatedTypeIcon = getRelatedTypeIcon(task.related_type);

  return (
    <>
      <Card 
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        style={style}
        className={`mb-2 hover:shadow-sm transition-all cursor-pointer ${isCurrentlyDragging ? 'opacity-70 shadow-md' : ''}`}
        onClick={() => setIsOpen(true)}
      >
        <CardHeader className="p-3 pb-1">
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-sm font-medium w-full">{task.title}</CardTitle>
            {hasAttachments && (
              <div className="text-muted-foreground flex-shrink-0">
                <Paperclip className="h-3 w-3" />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-1">
          {/* Display related entity with icon */}
          {(task.related_type === null || task.category_name) && (
            <div className="mb-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Settings className="h-3.5 w-3.5" />
                <span>{task.category_name || "General"}</span>
              </div>
            </div>
          )}
          
          {task.related_type !== null && relatedEntityName && (
            <div className="mb-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {relatedTypeIcon}
                <span>{relatedEntityName}</span>
              </div>
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
          
          <div className="flex justify-between items-center mt-3">
            <div className="flex items-center">
              {task.assignee && (
                <div className="flex items-center">
                  <Avatar className="h-5 w-5 mr-1">
                    <AvatarImage src={task.assignee.avatar_url || undefined} />
                    <AvatarFallback className="text-[10px]">
                      {getInitials(task.assignee.username || "User")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">{task.assignee.username}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{daysSinceAdded} {daysSinceAdded === 1 ? 'day' : 'days'} ago</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-2">
            <div>
              {task.category_name && task.related_type !== null && (
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
