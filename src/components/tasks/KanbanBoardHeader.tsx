
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";

interface KanbanBoardHeaderProps {
  groupBy: "status" | "assignee" | "sculpture" | "relatedType";
  onGroupByChange: (value: "status" | "assignee" | "sculpture" | "relatedType") => void;
  onAddTaskClick: () => void;
  sculpturesLoading: boolean;
}

export function KanbanBoardHeader({
  groupBy,
  onGroupByChange,
  onAddTaskClick,
  sculpturesLoading
}: KanbanBoardHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold">Task Board</h1>
      <div className="flex items-center gap-4 mt-4">
        <Tabs value={groupBy} onValueChange={(value) => onGroupByChange(value as "status" | "assignee" | "sculpture" | "relatedType")}>
          <TabsList>
            <TabsTrigger value="status">By Status</TabsTrigger>
            <TabsTrigger value="assignee">By Assignee</TabsTrigger>
            <TabsTrigger value="sculpture">By Sculpture</TabsTrigger>
            <TabsTrigger value="relatedType">By Entity Type</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onAddTaskClick}
          disabled={sculpturesLoading}
        >
          {sculpturesLoading ? (
            <span className="animate-pulse">Loading...</span>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-1" /> Add Task
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
