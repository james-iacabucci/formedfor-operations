
import { useState, useEffect } from "react";
import { useSculptureTasks, useTaskMutations } from "@/hooks/useTasks";
import { TaskItem } from "./TaskItem";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { TaskWithAssignee } from "@/types/task";
import { useAuth } from "@/components/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// For drag and drop
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Sortable wrapper for TaskItem
function SortableTaskItem({ task }: { task: TaskWithAssignee }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };
  
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskItem task={task} isDragging={isDragging} />
    </div>
  );
}

interface TaskListProps {
  sculptureId?: string;  // Make sculptureId optional
}

export function TaskList({ sculptureId }: TaskListProps) {
  const { user } = useAuth();
  const { data: tasks = [], isLoading, refetch } = useSculptureTasks(sculptureId);
  const { reorderTasks } = useTaskMutations();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [filteredTasks, setFilteredTasks] = useState<TaskWithAssignee[]>([]);
  const [filter, setFilter] = useState<string>("all");

  // For drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (tasks) {
      if (filter === "all") {
        setFilteredTasks(tasks);
      } else if (filter === "me" && user) {
        setFilteredTasks(tasks.filter(task => task.assigned_to === user.id));
      } else if (filter === "unassigned") {
        setFilteredTasks(tasks.filter(task => !task.assigned_to));
      }
    }
  }, [tasks, filter, user]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = filteredTasks.findIndex(task => task.id === active.id);
      const newIndex = filteredTasks.findIndex(task => task.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        // Update local state for optimistic UI update
        const newTaskOrder = arrayMove(filteredTasks, oldIndex, newIndex);
        setFilteredTasks(newTaskOrder);
        
        // Calculate the new priority value based on surrounding tasks
        let newPriority;
        
        if (newIndex === 0) {
          // Moving to the top
          newPriority = newTaskOrder[1] ? Math.floor(newTaskOrder[1].priority_order - 1) : 0;
        } else if (newIndex === newTaskOrder.length - 1) {
          // Moving to the bottom
          newPriority = newTaskOrder[newIndex - 1] ? Math.ceil(newTaskOrder[newIndex - 1].priority_order + 1) : 1000;
        } else {
          // Moving to the middle - calculate average of surrounding priorities
          newPriority = Math.floor(
            (newTaskOrder[newIndex - 1].priority_order + newTaskOrder[newIndex + 1].priority_order) / 2
          );
        }
        
        // Update on the server
        await reorderTasks.mutateAsync({
          taskId: active.id.toString(),
          newPriorityOrder: newPriority
        });
      }
    }
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold">Tasks</h3>
          <div className="ml-4 flex items-center">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[150px] h-8">
                <SelectValue placeholder="Filter tasks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="me">Assigned to Me</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Task
        </Button>
      </div>
      
      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground">Loading tasks...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          No tasks found. Click "Add Task" to create one.
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredTasks.map(task => task.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1">
              {filteredTasks.map((task) => (
                <SortableTaskItem key={task.id} task={task} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
      
      <CreateTaskDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen}
        sculptureId={sculptureId}
        relatedType={sculptureId ? "sculpture" : null}
      />
    </div>
  );
}
