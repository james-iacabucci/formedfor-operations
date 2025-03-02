
import { useState, useEffect } from "react";
import { useAllTasks } from "@/hooks/tasks";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { TaskWithAssignee } from "@/types/task";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { KanbanBoardHeader } from "./KanbanBoardHeader";
import { TaskColumn } from "./TaskColumn";
import { GroupTitleRenderer } from "./GroupTitleRenderer";
import { 
  GroupedTasksMap, 
  groupTasksByStatus, 
  groupTasksByAssignee, 
  groupTasksBySculpture,
  getColumnStyles
} from "./utils/taskGrouping";

type GroupBy = "status" | "assignee" | "sculpture";

interface SculptureMinimal {
  id: string;
  ai_generated_name: string;
  image_url?: string;
}

export function KanbanBoard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: tasks = [], isLoading: isTasksLoading } = useAllTasks();
  const [groupBy, setGroupBy] = useState<GroupBy>("status");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedSculptureId, setSelectedSculptureId] = useState<string>("");
  const [sculpturesLoading, setSculpturesLoading] = useState(true);
  const [sculptures, setSculptures] = useState<SculptureMinimal[]>([]);
  
  // Get sculptures for creating new tasks
  useEffect(() => {
    const fetchSculptures = async () => {
      setSculpturesLoading(true);
      try {
        const { data, error } = await supabase
          .from("sculptures")
          .select("id, ai_generated_name, image_url")
          .order("created_at", { ascending: false })
          .limit(10);
        
        if (error) throw error;
        
        const sculpturesData = data as SculptureMinimal[];
        setSculptures(sculpturesData);
        
        // If we have sculptures, preselect the first one
        if (sculpturesData.length > 0) {
          setSelectedSculptureId(sculpturesData[0].id);
        }
      } catch (error) {
        console.error("Error fetching sculptures:", error);
        toast({
          title: "Error",
          description: "Failed to load sculptures",
          variant: "destructive",
        });
      } finally {
        setSculpturesLoading(false);
      }
    };
    
    fetchSculptures();
  }, [toast]);
  
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
  
  // Handle opening the create task dialog
  const handleAddTaskClick = () => {
    if (sculpturesLoading) {
      toast({
        title: "Loading sculptures",
        description: "Please wait while we load available sculptures",
      });
      return;
    }
    
    // If there are sculptures available, select the first one
    if (sculptures.length > 0) {
      setSelectedSculptureId(sculptures[0].id);
      setCreateDialogOpen(true);
    } else {
      // If no sculptures are available, show a toast message
      toast({
        title: "No sculptures available",
        description: "Please create a sculpture first before adding tasks",
        variant: "destructive"
      });
    }
  };
  
  const getGroupedTasks = (): GroupedTasksMap => {
    if (!tasks.length) return {};
    
    if (groupBy === "status") {
      return groupTasksByStatus(tasks);
    }
    
    if (groupBy === "assignee") {
      return groupTasksByAssignee(tasks);
    }
    
    if (groupBy === "sculpture") {
      return groupTasksBySculpture(tasks);
    }
    
    return {};
  };
  
  // Calculate the grouped tasks once to avoid multiple calls
  const groupedTasks = getGroupedTasks();
  
  return (
    <div className="container mx-auto py-6">
      <KanbanBoardHeader 
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
        onAddTaskClick={handleAddTaskClick}
        sculpturesLoading={sculpturesLoading}
      />
      
      {isTasksLoading ? (
        <div className="p-8 text-center text-muted-foreground">Loading tasks...</div>
      ) : Object.keys(groupedTasks).length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          No tasks found. Click "Add Task" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
          {Object.entries(groupedTasks).map(([key, tasksGroup]) => (
            <TaskColumn
              key={key}
              columnKey={key}
              title={
                <GroupTitleRenderer 
                  groupBy={groupBy} 
                  groupKey={key} 
                  users={users}
                  sculptures={sculptures}
                />
              }
              tasks={tasksGroup}
              columnStyleClass={getColumnStyles(groupBy, key)}
            />
          ))}
        </div>
      )}
      
      {/* Only render the dialog when we have a valid sculpture ID */}
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
