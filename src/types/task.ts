
export type TaskStatus = "todo" | "in_progress" | "done";

export type TaskRelatedType = "sculpture" | "client" | "order" | "lead" | null;

export interface Task {
  id: string;
  sculpture_id: string | null;
  client_id: string | null;
  order_id: string | null;
  lead_id: string | null;
  related_type: TaskRelatedType;
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
  } | null;
  sculpture?: {
    id: string;
    ai_generated_name: string | null;
    image_url: string | null;
  } | null;
}

export interface CreateTaskInput {
  sculpture_id?: string | null;
  client_id?: string | null;
  order_id?: string | null;
  lead_id?: string | null;
  related_type?: TaskRelatedType;
  title: string;
  description?: string | null;
  assigned_to?: string | null;
  status?: TaskStatus;
}

export interface UpdateTaskInput {
  id: string;
  sculpture_id?: string | null;
  client_id?: string | null;
  order_id?: string | null;
  lead_id?: string | null;
  related_type?: TaskRelatedType;
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
