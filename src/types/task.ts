
export type TaskStatus = "todo" | "in_progress" | "done";

export interface Task {
  id: string;
  sculpture_id: string;
  title: string;
  description: string | null;
  assigned_to: string | null;
  status: TaskStatus;
  priority_order: number;
  created_at: string;
  created_by: string;
  updated_at: string;
}

export interface TaskWithAssignee extends Task {
  assignee?: {
    id: string;
    username: string | null;
    avatar_url: string | null;
  };
}

export interface CreateTaskInput {
  sculpture_id: string;
  title: string;
  description?: string | null;
  assigned_to?: string | null;
  status?: TaskStatus;
}

export interface UpdateTaskInput {
  id: string;
  title?: string;
  description?: string | null;
  assigned_to?: string | null;
  status?: TaskStatus;
  priority_order?: number;
}

export interface ReorderTasksInput {
  taskId: string;
  newPriorityOrder: number;
}
