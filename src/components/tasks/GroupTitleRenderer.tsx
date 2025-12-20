
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Paintbrush, Users, ShoppingCart, FileText } from "lucide-react";
import { TaskStatus, TaskRelatedType } from "@/types/task";
import { getStatusDisplayName, getRelatedTypeDisplayName } from "./utils/taskGrouping";

interface GroupTitleRendererProps {
  groupBy: "status" | "assignee" | "sculpture" | "relatedType";
  groupKey: string;
  users: any[];
  sculptures: {
    id: string;
    name: string;
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
    if (groupKey === "unassociated") {
      return <>Unassociated</>;
    }
    
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
        <span>{sculptureInfo?.name || "Unknown sculpture"}</span>
      </div>
    );
  }
  
  if (groupBy === "relatedType") {
    const relatedType = groupKey as TaskRelatedType;
    let icon;
    
    switch (relatedType) {
      case "sculpture":
        icon = <Paintbrush className="h-4 w-4" />;
        break;
      case "client":
        icon = <Users className="h-4 w-4" />;
        break;
      case "order":
        icon = <ShoppingCart className="h-4 w-4" />;
        break;
      case "lead":
        icon = <FileText className="h-4 w-4" />;
        break;
      default:
        icon = null;
    }
    
    return (
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 bg-muted rounded flex items-center justify-center">
          {icon}
        </div>
        <span>{getRelatedTypeDisplayName(relatedType)}</span>
      </div>
    );
  }
  
  return <>{groupKey}</>;
}
