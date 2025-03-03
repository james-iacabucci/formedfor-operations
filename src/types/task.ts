export type TaskStatus = "todo" | "soon" | "today" | "in_progress" | "waiting" | "done";

export type TaskRelatedType = "sculpture" | "client" | "order" | "lead" | "product_line" | null;

// Update the basic Task interface to match the actual database fields
export interface Task {
  id: string;
  sculpture_id: string | null;
  title: string;
  description: string | null;
  assigned_to: string | null;
  status: TaskStatus;
  priority_order: number;
  created_at: string;
  created_by: string;
  updated_at: string;
  // Add the missing fields that need to be included in queries/mutations
  client_id?: string | null;
  order_id?: string | null;
  lead_id?: string | null;
  product_line_id?: string | null;
  related_type?: TaskRelatedType;
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
  product_line_id?: string | null;
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
  product_line_id?: string | null;
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
