
import { useState, useEffect } from "react";
import { useAllTasks } from "@/hooks/useTasks";
import { TaskItem } from "./TaskItem";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { TaskWithAssignee, TaskStatus } from "@/types/task";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Users, Paintbrush } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sculpture } from "@/types/sculpture";

type GroupBy = "status" | "assignee" | "sculpture";

interface SculptureMinimal {
  id: string;
  ai_generated_name: string;
  image_url?: string;
}

export function KanbanBoard() {
  const { user } = useAuth();
  const { data: tasks = [], isLoading } = useAllTasks();
  const [groupBy, setGroupBy] = useState<GroupBy>("status");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedSculptureId, setSelectedSculptureId] = useState<string | null>(null);
  const [sculptures, setSculptures] = useState<SculptureMinimal[]>([]);
  
  // Get sculptures for creating new tasks
  useEffect(() => {
    const fetchSculptures = async () => {
      const { data } = await supabase
        .from("sculptures")
        .select("id, ai_generated_name, image_url")
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (data) {
        setSculptures(data as SculptureMinimal[]);
      }
    };
    
    fetchSculptures();
  }, []);
  
  const { data: users = [] } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*");
      
      if (error) throw error;
      return data || [];
    }
  });
  
  const getStatusDisplayName = (status: TaskStatus) => {
    switch (status) {
      case "todo":
        return "To Do";
      case "in_progress":
        return "In Progress";
      case "done":
        return "Done";
      default:
        return status;
    }
  };
  
  const getGroupedTasks = () => {
    if (!tasks.length) return {};
    
    if (groupBy === "status") {
      const result: Record<TaskStatus, TaskWithAssignee[]> = {
        "todo": [],
        "in_progress": [],
        "done": [],
      };
      
      tasks.forEach(task => {
        if (result[task.status]) {
          result[task.status].push(task);
        }
      });
      
      return result;
    }
    
    if (groupBy === "assignee") {
      const result: Record<string, TaskWithAssignee[]> = {
        unassigned: []
      };
      
      tasks.forEach(task => {
        const assigneeId = task.assigned_to || "unassigned";
        if (!result[assigneeId]) {
          result[assigneeId] = [];
        }
        result[assigneeId].push(task);
      });
      
      return result;
    }
    
    if (groupBy === "sculpture") {
      const result: Record<string, TaskWithAssignee[]> = {};
      
      tasks.forEach(task => {
        if (!result[task.sculpture_id]) {
          result[task.sculpture_id] = [];
        }
        result[task.sculpture_id].push(task);
      });
      
      return result;
    }
    
    return {};
  };
  
  const groupedTasks = getGroupedTasks();
  
  const renderGroupTitle = (key: string) => {
    if (groupBy === "status") {
      return getStatusDisplayName(key as TaskStatus);
    }
    
    if (groupBy === "assignee") {
      if (key === "unassigned") {
        return "Unassigned";
      }
      
      const user = users.find(u => u.id === key);
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={user?.avatar_url || ""} alt={user?.username || ""} />
            <AvatarFallback>{user?.username?.substring(0, 2) || "??"}</AvatarFallback>
          </Avatar>
          <span>{user?.username || key}</span>
        </div>
      );
    }
    
    if (groupBy === "sculpture") {
      // Find task with this sculpture ID and get sculpture info
      const sculptureTask = tasks.find(t => t.sculpture_id === key);
      const sculptureInfo = sculptures.find(s => s.id === key);
      
      return (
        <div className="flex items-center gap-2">
          {sculptureInfo?.image_url ? (
            <div className="h-6 w-6 rounded overflow-hidden">
              <img src={sculptureInfo.image_url} alt="Sculpture thumbnail" className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="h-6 w-6 bg-muted rounded flex items-center justify-center">
              <Paintbrush className="h-3 w-3" />
            </div>
          )}
          <span>{sculptureInfo?.ai_generated_name || "Unknown sculpture"}</span>
        </div>
      );
    }
    
    return key;
  };
  
  const getColumnStyles = (key: string) => {
    if (groupBy === "status") {
      switch (key) {
        case "todo":
          return "border-t-blue-500";
        case "in_progress":
          return "border-t-yellow-500";
        case "done":
          return "border-t-green-500";
        default:
          return "border-t-gray-500";
      }
    }
    
    return "border-t-primary";
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Task Board</h1>
        <div className="flex items-center gap-4 mt-4">
          <Tabs value={groupBy} onValueChange={(value) => setGroupBy(value as GroupBy)}>
            <TabsList>
              <TabsTrigger value="status">By Status</TabsTrigger>
              <TabsTrigger value="assignee">By Assignee</TabsTrigger>
              <TabsTrigger value="sculpture">By Sculpture</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button variant="outline" size="sm" onClick={() => {
            setSelectedSculptureId(sculptures[0]?.id || null);
            setCreateDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-1" /> Add Task
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground">Loading tasks...</div>
      ) : Object.keys(groupedTasks).length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          No tasks found. Click "Add Task" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
          {Object.entries(groupedTasks).map(([key, tasksGroup]) => (
            <Card key={key} className={`border-t-4 ${getColumnStyles(key)} h-full flex flex-col`}>
              <CardHeader className="pb-1">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-medium">
                    {renderGroupTitle(key)}
                  </CardTitle>
                  <Badge variant="outline">{tasksGroup.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="overflow-auto flex-grow">
                {tasksGroup.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No tasks</p>
                ) : (
                  <div className="space-y-2">
                    {tasksGroup.map((task) => (
                      <TaskItem key={task.id} task={task} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {selectedSculptureId && (
        <CreateTaskDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          sculptureId={selectedSculptureId}
        />
      )}
    </div>
  );
}
