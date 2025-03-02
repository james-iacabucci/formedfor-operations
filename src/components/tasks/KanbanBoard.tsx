
import { useState, useEffect } from "react";
import { useAllTasks, useTaskMutations } from "@/hooks/useTasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskItem } from "./TaskItem";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Users, Boxes } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { TaskWithAssignee, TaskStatus } from "@/types/task";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Sculpture } from "@/types/sculpture";

// Kanban columns
const STATUSES: TaskStatus[] = ["todo", "in_progress", "done"];
const STATUS_LABELS = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done"
};

// Group tasks by different criteria
type GroupingMode = "status" | "assignee" | "sculpture";

export function KanbanBoard() {
  const { user } = useAuth();
  const { data: tasks = [], isLoading } = useAllTasks();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [activeSculptureId, setActiveSculptureId] = useState<string | null>(null);
  const [groupingMode, setGroupingMode] = useState<GroupingMode>("status");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [sculptureFilter, setSculptureFilter] = useState<string>("all");
  const { updateTask } = useTaskMutations();
  const [sculptures, setSculptures] = useState<Sculpture[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  // Fetch sculptures for the dropdown
  useEffect(() => {
    const fetchSculptures = async () => {
      const { data } = await supabase
        .from("sculptures")
        .select("id, ai_generated_name, manual_name");
      
      if (data) {
        setSculptures(data);
      }
    };

    const fetchUsers = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, username, avatar_url");
      
      if (data) {
        setUsers(data);
      }
    };

    fetchSculptures();
    fetchUsers();
  }, []);

  // Filter and group tasks
  const getFilteredTasks = () => {
    let filtered = [...tasks];
    
    // Apply assignee filter
    if (assigneeFilter !== "all") {
      if (assigneeFilter === "me" && user) {
        filtered = filtered.filter(task => task.assigned_to === user.id);
      } else if (assigneeFilter === "unassigned") {
        filtered = filtered.filter(task => !task.assigned_to);
      } else {
        filtered = filtered.filter(task => task.assigned_to === assigneeFilter);
      }
    }
    
    // Apply sculpture filter
    if (sculptureFilter !== "all") {
      filtered = filtered.filter(task => task.sculpture_id === sculptureFilter);
    }
    
    return filtered;
  };

  const getGroupedTasks = () => {
    const filtered = getFilteredTasks();
    const grouped: Record<string, TaskWithAssignee[]> = {};
    
    if (groupingMode === "status") {
      // Group by status
      STATUSES.forEach(status => {
        grouped[status] = filtered.filter(task => task.status === status);
      });
    } else if (groupingMode === "assignee") {
      // Group by assignee
      const assignees = new Set<string>();
      filtered.forEach(task => {
        if (task.assigned_to) {
          assignees.add(task.assigned_to);
        }
      });
      
      // Create "Unassigned" group
      grouped["unassigned"] = filtered.filter(task => !task.assigned_to);
      
      // Create groups for each assignee
      Array.from(assignees).forEach(assigneeId => {
        grouped[assigneeId] = filtered.filter(task => task.assigned_to === assigneeId);
      });
    } else if (groupingMode === "sculpture") {
      // Group by sculpture
      const sculptureIds = new Set<string>();
      filtered.forEach(task => {
        sculptureIds.add(task.sculpture_id);
      });
      
      Array.from(sculptureIds).forEach(sculptureId => {
        grouped[sculptureId] = filtered.filter(task => task.sculpture_id === sculptureId);
      });
    }
    
    return grouped;
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    
    if (taskId) {
      await updateTask.mutateAsync({
        id: taskId,
        status: targetStatus
      });
    }
  };

  const handleTaskDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const renderGroupTitle = (groupKey: string) => {
    if (groupingMode === "status") {
      return <span>{STATUS_LABELS[groupKey as TaskStatus]}</span>;
    } else if (groupingMode === "assignee") {
      if (groupKey === "unassigned") {
        return <span>Unassigned</span>;
      }
      
      const assignee = users.find(u => u.id === groupKey);
      return (
        <div className="flex items-center space-x-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={assignee?.avatar_url || ""} />
            <AvatarFallback>
              {assignee?.username?.[0].toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <span>{assignee?.username || "Unknown User"}</span>
        </div>
      );
    } else if (groupingMode === "sculpture") {
      const sculpture = sculptures.find(s => s.id === groupKey);
      return <span>{sculpture?.ai_generated_name || sculpture?.manual_name || "Unknown Sculpture"}</span>;
    }
    
    return null;
  };

  const renderGroupHeaders = () => {
    const grouped = getGroupedTasks();
    return Object.keys(grouped).map(groupKey => (
      <Card key={groupKey} className="flex-1 min-w-[300px] max-w-[400px]">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            {renderGroupTitle(groupKey)}
            <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
              {grouped[groupKey].length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent 
          className="p-2 overflow-y-auto max-h-[calc(100vh-250px)]" 
          onDragOver={handleDragOver}
          onDrop={(e) => {
            if (groupingMode === "status") {
              handleDrop(e, groupKey as TaskStatus);
            }
          }}
        >
          {grouped[groupKey].length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              No tasks
            </div>
          ) : (
            <div className="space-y-2">
              {grouped[groupKey].map(task => (
                <div 
                  key={task.id}
                  draggable={groupingMode === "status"}
                  onDragStart={(e) => handleTaskDragStart(e, task.id)}
                  className="cursor-grab"
                >
                  <TaskItem task={task} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    ));
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">Tasks</h1>
          
          <div className="flex items-center ml-4 space-x-3">
            <div className="flex items-center">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                <SelectTrigger className="w-[150px] h-8">
                  <SelectValue placeholder="Filter by assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assignees</SelectItem>
                  <SelectItem value="me">Assigned to Me</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.username || "User"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center">
              <Select value={sculptureFilter} onValueChange={setSculptureFilter}>
                <SelectTrigger className="w-[150px] h-8">
                  <SelectValue placeholder="Filter by sculpture" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sculptures</SelectItem>
                  {sculptures.map(sculpture => (
                    <SelectItem key={sculpture.id} value={sculpture.id}>
                      {sculpture.ai_generated_name || sculpture.manual_name || "Untitled"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center border rounded-md p-0.5">
            <Button
              variant={groupingMode === "status" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setGroupingMode("status")}
              className="text-xs px-3 py-1 h-8"
            >
              By Status
            </Button>
            <Button
              variant={groupingMode === "assignee" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setGroupingMode("assignee")}
              className="text-xs px-3 py-1 h-8"
            >
              <Users className="h-4 w-4 mr-1" />
              By Assignee
            </Button>
            <Button
              variant={groupingMode === "sculpture" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setGroupingMode("sculpture")}
              className="text-xs px-3 py-1 h-8"
            >
              <Boxes className="h-4 w-4 mr-1" />
              By Sculpture
            </Button>
          </div>
          
          <Button onClick={() => {
            setActiveSculptureId(null);
            setCreateDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-1" /> Add Task
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="py-16 text-center text-muted-foreground">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-muted-foreground mb-4">No tasks found</p>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Create Your First Task
          </Button>
        </div>
      ) : (
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {renderGroupHeaders()}
        </div>
      )}
      
      <CreateTaskDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen}
        sculptureId={activeSculptureId || (sculptures[0]?.id || "")}
      />
    </div>
  );
}
