
import { TaskWithAssignee, TaskStatus } from "@/types/task";

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

// Group tasks by sculpture
export const groupTasksBySculpture = (tasks: TaskWithAssignee[]): GroupedTasksMap => {
  const result: GroupedTasksMap = {};
  
  tasks.forEach(task => {
    if (!result[task.sculpture_id]) {
      result[task.sculpture_id] = [];
    }
    result[task.sculpture_id].push(task);
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
  
  return "border-t-primary";
};
