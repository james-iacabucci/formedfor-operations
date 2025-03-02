
import { TaskWithAssignee, TaskStatus, TaskRelatedType } from "@/types/task";

// Type definition for grouped tasks
export type GroupedTasksMap = Record<string, TaskWithAssignee[]>;

// Group tasks by status
export const groupTasksByStatus = (tasks: TaskWithAssignee[]): Record<TaskStatus, TaskWithAssignee[]> => {
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
};

// Group tasks by assignee
export const groupTasksByAssignee = (tasks: TaskWithAssignee[]): GroupedTasksMap => {
  const result: GroupedTasksMap = {
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
};

// Group tasks by related entity type
export const groupTasksByRelatedType = (tasks: TaskWithAssignee[]): GroupedTasksMap => {
  const result: GroupedTasksMap = {
    unassociated: []
  };
  
  tasks.forEach(task => {
    if (!task.related_type) {
      result.unassociated.push(task);
    } else {
      if (!result[task.related_type]) {
        result[task.related_type] = [];
      }
      result[task.related_type].push(task);
    }
  });
  
  return result;
};

// Group tasks by sculpture
export const groupTasksBySculpture = (tasks: TaskWithAssignee[]): GroupedTasksMap => {
  const result: GroupedTasksMap = {
    unassociated: []
  };
  
  tasks.forEach(task => {
    if (!task.sculpture_id) {
      result.unassociated.push(task);
    } else {
      if (!result[task.sculpture_id]) {
        result[task.sculpture_id] = [];
      }
      result[task.sculpture_id].push(task);
    }
  });
  
  return result;
};

// Get status display name
export const getStatusDisplayName = (status: TaskStatus): string => {
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

// Get related type display name
export const getRelatedTypeDisplayName = (type: TaskRelatedType): string => {
  if (!type) return "Unassociated";
  
  switch (type) {
    case "sculpture":
      return "Sculptures";
    case "client":
      return "Clients";
    case "order":
      return "Orders";
    case "lead":
      return "Leads";
    default:
      return "Unknown";
  }
};

// Get column styles based on group type and key
export const getColumnStyles = (groupBy: string, key: string): string => {
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
  
  if (groupBy === "relatedType") {
    switch (key) {
      case "sculpture":
        return "border-t-purple-500";
      case "client":
        return "border-t-cyan-500";
      case "order":
        return "border-t-amber-500";
      case "lead":
        return "border-t-emerald-500";
      case "unassociated":
        return "border-t-gray-400";
      default:
        return "border-t-primary";
    }
  }
  
  return "border-t-primary";
};
