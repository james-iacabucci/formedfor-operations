
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TaskWithAssignee } from "@/types/task";
import { useUsers } from "@/hooks/tasks/queries/useUsers";
import { useTaskUpdate } from "@/hooks/tasks/useTaskUpdate";
import { DeleteTaskDialog } from "./form-sections/DeleteTaskDialog";
import { UpdateTaskForm } from "./form-sections/UpdateTaskForm";
import { useEffect } from "react";

interface UpdateTaskSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: TaskWithAssignee;
}

export function UpdateTaskSheet({ 
  open, 
  onOpenChange, 
  task 
}: UpdateTaskSheetProps) {
  const { data: users = [] } = useUsers();
  const {
    title,
    description,
    taskRelatedType,
    assignedTo,
    status,
    deleteDialogOpen,
    setTitle,
    setDescription,
    setDeleteDialogOpen,
    handleRelatedTypeChange,
    handleAssigneeChange,
    handleStatusChange,
    handleUpdateTask,
    handleDeleteTask,
    updateTask,
    deleteTask,
    sculptureEntityId,
    sculptures,
    sculpturesLoading,
    handleEntitySelection,
  } = useTaskUpdate(task, open, onOpenChange);

  // Add keyboard event listener for ESC key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Update Task</SheetTitle>
          </SheetHeader>
          
          <UpdateTaskForm
            title={title}
            description={description}
            taskRelatedType={taskRelatedType}
            assignedTo={assignedTo}
            status={status}
            users={users}
            sculptureEntityId={sculptureEntityId}
            sculptures={sculptures}
            sculpturesLoading={sculpturesLoading}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onRelatedTypeChange={handleRelatedTypeChange}
            onAssigneeChange={handleAssigneeChange}
            onStatusChange={handleStatusChange}
            onEntitySelection={handleEntitySelection}
            onDelete={() => setDeleteDialogOpen(true)}
            onCancel={() => onOpenChange(false)}
            onSubmit={handleUpdateTask}
            isPending={updateTask.isPending}
          />
        </SheetContent>
      </Sheet>

      <DeleteTaskDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDelete={handleDeleteTask}
        isDeleting={deleteTask.isPending}
      />
    </>
  );
}
