
import { Button } from "@/components/ui/button";
import { TaskWithAssignee, TaskStatus, TaskRelatedType } from "@/types/task";
import { TaskDetailsSection } from "./TaskDetailsSection";
import { TaskAssignmentSection } from "./TaskAssignmentSection";
import { RelatedEntitySection } from "./RelatedEntitySection";
import { EntityOption } from "@/hooks/tasks/useTaskRelatedEntity";

interface UpdateTaskFormProps {
  title: string;
  description: string;
  taskRelatedType: TaskRelatedType | string | null;
  assignedTo: string | null;
  status: TaskStatus;
  categoryName?: string | null;
  categories?: string[];
  users: { id: string; username: string; avatar_url: string | null; }[];
  sculptureEntityId: string | null;
  sculptures: EntityOption[];
  sculpturesLoading: boolean;
  clients?: EntityOption[];
  clientsLoading?: boolean;
  leads?: EntityOption[];
  leadsLoading?: boolean;
  orders?: EntityOption[];
  ordersLoading?: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onRelatedTypeChange: (type: string) => void;
  onCategoryChange?: (category: string) => void;
  onAssigneeChange: (value: string) => void;
  onStatusChange: (value: TaskStatus) => void;
  onEntitySelection: (id: string) => void;
  onDelete: () => void;
  onCancel: () => void;
  onSubmit: () => void;
  isPending: boolean;
}

export function UpdateTaskForm({
  title,
  description,
  taskRelatedType,
  assignedTo,
  status,
  categoryName,
  categories = [],
  users,
  sculptureEntityId,
  sculptures,
  sculpturesLoading,
  clients = [],
  clientsLoading = false,
  leads = [],
  leadsLoading = false,
  orders = [],
  ordersLoading = false,
  onTitleChange,
  onDescriptionChange,
  onRelatedTypeChange,
  onCategoryChange,
  onAssigneeChange,
  onStatusChange,
  onEntitySelection,
  onDelete,
  onCancel,
  onSubmit,
  isPending
}: UpdateTaskFormProps) {
  return (
    <div className="space-y-4 py-4">
      <TaskDetailsSection
        title={title}
        description={description}
        onTitleChange={onTitleChange}
        onDescriptionChange={onDescriptionChange}
      />
      
      <TaskAssignmentSection
        assignedTo={assignedTo}
        status={status}
        users={users}
        onAssigneeChange={onAssigneeChange}
        onStatusChange={onStatusChange}
      />
      
      <RelatedEntitySection
        relatedType={taskRelatedType as TaskRelatedType}
        entityId={sculptureEntityId}
        categoryName={categoryName}
        onEntitySelection={onEntitySelection}
        onRelatedTypeChange={onRelatedTypeChange}
        onCategoryChange={onCategoryChange}
        sculptures={sculptures}
        sculpturesLoading={sculpturesLoading}
        clients={clients}
        clientsLoading={clientsLoading}
        leads={leads}
        leadsLoading={leadsLoading}
        orders={orders}
        ordersLoading={ordersLoading}
        categories={categories}
      />
      
      <div className="flex items-center justify-between absolute bottom-6 right-6 left-6">
        <Button 
          variant="outline" 
          onClick={onDelete}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          Delete
        </Button>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            onClick={onSubmit} 
            disabled={isPending}
          >
            {isPending ? "Updating..." : "Apply"}
          </Button>
        </div>
      </div>
    </div>
  );
}
