import { useState, useEffect } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";
import { useAllTasks } from "@/hooks/tasks/queries/useAllTasks";
import { useUsers } from "@/hooks/tasks/queries/useUsers";
import { TaskColumn } from "./TaskColumn";
import { CreateTaskSheet } from "./CreateTaskSheet";
import { groupTasksByStatus, getStatusDisplayName, getColumnStyles } from "./utils/taskGrouping";
import { TaskStatus, TaskWithAssignee } from "@/types/task";
import { KanbanBoardHeader } from "./KanbanBoardHeader";
import { useAuth } from "@/components/AuthProvider";
import { useTaskMutations } from "@/hooks/tasks";

// For drag and drop
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

export function KanbanBoard() {
  const { user } = useAuth();
  const { data: tasks = [], isLoading } = useAllTasks();
  const { data: users = [] } = useUsers();
  const { updateTask, reorderTasks } = useTaskMutations();
  
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [filteredTasks, setFilteredTasks] = useState<TaskWithAssignee[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [activeTask, setActiveTask] = useState<TaskWithAssignee | null>(null);
  const [groupBy, setGroupBy] = useState<"status" | "assignee" | "sculpture" | "relatedType">("status");
  const [tasksByStatus, setTasksByStatus] = useState<Record<TaskStatus, TaskWithAssignee[]>>({
    todo: [],
    today: [],
    in_progress: [],
    waiting: [],
    done: [],
  });

  const statusOrder: TaskStatus[] = ["todo", "today", "in_progress", "waiting", "done"];
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  useEffect(() => {
    if (tasks) {
      let tasksToShow;
      
      if (filter === "all") {
        tasksToShow = tasks;
      } else if (filter === "me" && user) {
        tasksToShow = tasks.filter(task => task.assigned_to === user.id);
      } else if (filter === "unassigned") {
        tasksToShow = tasks.filter(task => !task.assigned_to);
      } else {
        tasksToShow = tasks;
      }
      
      setFilteredTasks(tasksToShow);
      setTasksByStatus(groupTasksByStatus(tasksToShow));
    }
  }, [tasks, filter, user]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeTaskId = active.id as string;
    const foundTask = filteredTasks.find(task => task.id === activeTaskId);
    
    if (foundTask) {
      setActiveTask(foundTask);
    }
  };
  
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over || !active || active.id === over.id) return;
    
    if (over.id.toString().includes('column-')) {
      const newStatus = over.id.toString().replace('column-', '') as TaskStatus;
      if (activeTask && activeTask.status !== newStatus) {
        const updatedTasksByStatus = { ...tasksByStatus };
        
        updatedTasksByStatus[activeTask.status] = updatedTasksByStatus[activeTask.status].filter(
          task => task.id !== activeTask.id
        );
        
        const updatedTask = { ...activeTask, status: newStatus };
        
        updatedTasksByStatus[newStatus] = [...updatedTasksByStatus[newStatus], updatedTask];
        
        setTasksByStatus(updatedTasksByStatus);
        setActiveTask(updatedTask);
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !activeTask) {
      setActiveTask(null);
      return;
    }
    
    if (over.id.toString().includes('column-')) {
      const newStatus = over.id.toString().replace('column-', '') as TaskStatus;
      
      if (activeTask.status !== newStatus) {
        try {
          await updateTask.mutateAsync({
            id: activeTask.id,
            status: newStatus
          });
        } catch (error) {
          console.error("Failed to update task status:", error);
          setTasksByStatus(groupTasksByStatus(filteredTasks));
        }
      }
    } else if (active.id !== over.id) {
      const activeId = active.id as string;
      const overId = over.id as string;
      
      const activeStatus = activeTask.status;
      const statusTasks = [...tasksByStatus[activeStatus]];
      
      const oldIndex = statusTasks.findIndex(task => task.id === activeId);
      const newIndex = statusTasks.findIndex(task => task.id === overId);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newTasksOrder = arrayMove(statusTasks, oldIndex, newIndex);
        
        const updatedTasksByStatus = {
          ...tasksByStatus,
          [activeStatus]: newTasksOrder
        };
        
        setTasksByStatus(updatedTasksByStatus);
        
        let newPriority;
        
        if (newIndex === 0) {
          newPriority = newTasksOrder[1] ? Math.floor(newTasksOrder[1].priority_order - 1) : 0;
        } else if (newIndex === newTasksOrder.length - 1) {
          newPriority = newTasksOrder[newIndex - 1] ? Math.ceil(newTasksOrder[newIndex - 1].priority_order + 1) : 1000;
        } else {
          newPriority = Math.floor(
            (newTasksOrder[newIndex - 1].priority_order + newTasksOrder[newIndex + 1].priority_order) / 2
          );
        }
        
        try {
          await reorderTasks.mutateAsync({
            taskId: activeId,
            newPriorityOrder: newPriority
          });
        } catch (error) {
          console.error("Failed to reorder tasks:", error);
          setTasksByStatus(groupTasksByStatus(filteredTasks));
        }
      }
    }
    
    setActiveTask(null);
  };

  const handleGroupByChange = (value: "status" | "assignee" | "sculpture" | "relatedType") => {
    setGroupBy(value);
  };

  return (
    <div className="w-full">
      <KanbanBoardHeader 
        groupBy={groupBy}
        onGroupByChange={handleGroupByChange}
        onAddTaskClick={() => setCreateSheetOpen(true)}
        sculpturesLoading={isLoading}
      />
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
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
        
        <Button size="sm" onClick={() => setCreateSheetOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Task
        </Button>
      </div>
      
      {isLoading ? (
        <Card className="p-8 text-center text-muted-foreground">Loading tasks...</Card>
      ) : (
        <div className="grid grid-cols-5 gap-2 mt-4">
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            {statusOrder.map((status) => (
              <div key={`column-${status}`} id={`column-${status}`} className="h-[calc(100vh-200px)]">
                <SortableContext items={tasksByStatus[status].map(task => task.id)} strategy={verticalListSortingStrategy}>
                  <TaskColumn
                    id={`column-${status}`}
                    title={getStatusDisplayName(status)}
                    count={tasksByStatus[status].length}
                    tasks={tasksByStatus[status]}
                    borderClass={getColumnStyles("status", status)}
                    activeId={activeTask?.id || null}
                  />
                </SortableContext>
              </div>
            ))}
          </DndContext>
        </div>
      )}
      
      <CreateTaskSheet
        open={createSheetOpen} 
        onOpenChange={setCreateSheetOpen}
      />
    </div>
  );
}
