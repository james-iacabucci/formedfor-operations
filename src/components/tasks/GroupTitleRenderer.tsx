
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Paintbrush } from "lucide-react";
import { TaskStatus } from "@/types/task";
import { getStatusDisplayName } from "./utils/taskGrouping";

interface GroupTitleRendererProps {
  groupBy: "status" | "assignee" | "sculpture";
  groupKey: string;
  users: any[];
  sculptures: {
    id: string;
    ai_generated_name: string;
    image_url?: string;
  }[];
}

export function GroupTitleRenderer({ groupBy, groupKey, users, sculptures }: GroupTitleRendererProps) {
  if (groupBy === "status") {
    return <>{getStatusDisplayName(groupKey as TaskStatus)}</>;
  }
  
  if (groupBy === "assignee") {
    if (groupKey === "unassigned") {
      return <>Unassigned</>;
    }
    
    const user = users.find(u => u.id === groupKey);
    return (
      <div className="flex items-center gap-2">
        <Avatar className="h-6 w-6">
          <AvatarImage src={user?.avatar_url || ""} alt={user?.username || ""} />
          <AvatarFallback>{user?.username?.substring(0, 2) || "??"}</AvatarFallback>
        </Avatar>
        <span>{user?.username || groupKey}</span>
      </div>
    );
  }
  
  if (groupBy === "sculpture") {
    const sculptureInfo = sculptures.find(s => s.id === groupKey);
    
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
  
  return <>{groupKey}</>;
}
