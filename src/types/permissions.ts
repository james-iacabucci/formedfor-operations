
import { AppRole } from "./roles";

// Define permission types
export interface PermissionDefinition {
  id: string;
  action: PermissionAction;
  description: string;
}

export type PermissionAction =
  | "sculpture.create"
  | "sculpture.edit"
  | "sculpture.delete"
  | "sculpture.generate"
  | "sculpture.view_all"
  | "sculpture.duplicate"
  | "sculpture.regenerate"
  | "variant.create"
  | "quote.create"
  | "quote.edit"
  | "quote.delete"
  | "quote.select"
  | "quote.view_pricing"
  | "quote.approve"
  | "quote.reject"
  | "quote.requote"
  | "quote.edit_requested"
  | "quote.submit_approval"
  | "quote_chat.view"
  | "quote_chat.send"
  | "quote_chat.upload_files"
  | "sculpture_chat.view"
  | "sculpture_chat.send"
  | "sculpture_chat.send_messages"
  | "quote_chat.send_messages"
  | "sculpture_chat.upload_files"
  | "task.create"
  | "task.edit"
  | "task.delete"
  | "task.view_all"
  | "task.view_own"
  | "user.manage"
  | "settings.manage"
  | "settings.manage_tags"
  | "settings.manage_value_lists"
  | "settings.manage_product_lines"
  | "settings.manage_roles";

// Define all permissions with descriptions
export const ALL_PERMISSIONS: PermissionDefinition[] = [
  // Sculpture permissions
  { id: "sculpture-create", action: "sculpture.create", description: "Create sculptures" },
  { id: "sculpture-edit", action: "sculpture.edit", description: "Edit sculptures" },
  { id: "sculpture-delete", action: "sculpture.delete", description: "Delete sculptures" },
  { id: "sculpture-generate", action: "sculpture.generate", description: "Generate sculptures with AI" },
  { id: "sculpture-view-all", action: "sculpture.view_all", description: "View all sculptures" },
  { id: "sculpture-duplicate", action: "sculpture.duplicate", description: "Duplicate sculptures" },
  { id: "sculpture-regenerate", action: "sculpture.regenerate", description: "Regenerate sculpture images" },
  { id: "variant-create", action: "variant.create", description: "Create sculpture variants" },
  
  // Quote permissions
  { id: "quote-create", action: "quote.create", description: "Create fabrication quotes" },
  { id: "quote-edit", action: "quote.edit", description: "Edit fabrication quotes" },
  { id: "quote-delete", action: "quote.delete", description: "Delete fabrication quotes" },
  { id: "quote-select", action: "quote.select", description: "Select fabrication quotes" },
  { id: "quote-view-pricing", action: "quote.view_pricing", description: "View quote pricing details" },
  { id: "quote-approve", action: "quote.approve", description: "Approve fabrication quotes" },
  { id: "quote-reject", action: "quote.reject", description: "Reject fabrication quotes" },
  { id: "quote-requote", action: "quote.requote", description: "Request a requote" },
  { id: "quote-edit-requested", action: "quote.edit_requested", description: "Edit requested quotes" },
  { id: "quote-submit-approval", action: "quote.submit_approval", description: "Submit quotes for approval" },
  
  // Quote chat permissions
  { id: "quote-chat-view", action: "quote_chat.view", description: "View quote chat" },
  { id: "quote-chat-send", action: "quote_chat.send", description: "Send quote chat messages" },
  { id: "quote-chat-send-messages", action: "quote_chat.send_messages", description: "Send quote chat messages" },
  { id: "quote-chat-upload-files", action: "quote_chat.upload_files", description: "Upload files in quote chat" },
  
  // Sculpture chat permissions
  { id: "sculpture-chat-view", action: "sculpture_chat.view", description: "View sculpture chat" },
  { id: "sculpture-chat-send", action: "sculpture_chat.send", description: "Send sculpture chat messages" },
  { id: "sculpture-chat-send-messages", action: "sculpture_chat.send_messages", description: "Send sculpture chat messages" },
  { id: "sculpture-chat-upload-files", action: "sculpture_chat.upload_files", description: "Upload files in sculpture chat" },
  
  // Task permissions
  { id: "task-create", action: "task.create", description: "Create tasks" },
  { id: "task-edit", action: "task.edit", description: "Edit tasks" },
  { id: "task-delete", action: "task.delete", description: "Delete tasks" },
  { id: "task-view-all", action: "task.view_all", description: "View all tasks" },
  { id: "task-view-own", action: "task.view_own", description: "View own tasks" },
  
  // User permissions
  { id: "user-manage", action: "user.manage", description: "Manage users" },
  
  // Settings permissions
  { id: "settings-manage", action: "settings.manage", description: "Manage application settings" },
  { id: "settings-manage-tags", action: "settings.manage_tags", description: "Manage tags" },
  { id: "settings-manage-value-lists", action: "settings.manage_value_lists", description: "Manage value lists" },
  { id: "settings-manage-product-lines", action: "settings.manage_product_lines", description: "Manage product lines" },
  { id: "settings-manage-roles", action: "settings.manage_roles", description: "Manage user roles" }
];

export const DEFAULT_ROLE_PERMISSIONS: Record<AppRole, PermissionAction[]> = {
  admin: [
    // Admin permissions include all permissions
    'sculpture.create',
    'sculpture.edit',
    'sculpture.delete',
    'sculpture.generate',
    'sculpture.view_all',
    'sculpture.duplicate',
    'sculpture.regenerate',
    'variant.create',
    'quote.create',
    'quote.edit',
    'quote.delete',
    'quote.select',
    'quote.view_pricing',
    'quote.approve',
    'quote.reject',
    'quote.requote',
    'quote.edit_requested',
    'quote.submit_approval',
    'quote_chat.view',
    'quote_chat.send',
    'quote_chat.send_messages',
    'quote_chat.upload_files',
    'sculpture_chat.view',
    'sculpture_chat.send',
    'sculpture_chat.send_messages',
    'sculpture_chat.upload_files',
    'task.create',
    'task.edit',
    'task.delete',
    'task.view_all',
    'task.view_own',
    'user.manage',
    'settings.manage',
    'settings.manage_tags',
    'settings.manage_value_lists',
    'settings.manage_product_lines',
    'settings.manage_roles'
  ],
  sales: [
    // Sales permissions
    'sculpture.create',
    'sculpture.edit',
    'sculpture.delete',
    'sculpture.generate',
    'sculpture.view_all',
    'sculpture.duplicate',
    'sculpture.regenerate',
    'variant.create',
    'quote.create',
    'quote.edit',
    'quote.delete',
    'quote.select',
    'quote.view_pricing',
    'quote.approve',
    'quote.reject',
    'quote.requote',
    'quote_chat.view',
    'quote_chat.send',
    'quote_chat.send_messages',
    'quote_chat.upload_files',
    'sculpture_chat.view',
    'sculpture_chat.send',
    'sculpture_chat.send_messages',
    'sculpture_chat.upload_files',
    'task.create',
    'task.edit',
    'task.delete',
    'task.view_own'
  ],
  fabrication: [
    // Fabrication permissions
    'sculpture.view_all',
    'quote.edit_requested',
    'quote.submit_approval',
    'quote_chat.view',
    'quote_chat.send',
    'quote_chat.send_messages',
    'quote_chat.upload_files',
    'sculpture_chat.view',
    'sculpture_chat.send_messages',
    'sculpture_chat.upload_files',
    'task.view_own'
  ],
  orders: [
    // Orders permissions
    'sculpture.view_all',
    'quote.view_pricing',
    'task.view_own',
    'quote_chat.view',
    'sculpture_chat.view'
  ]
};
