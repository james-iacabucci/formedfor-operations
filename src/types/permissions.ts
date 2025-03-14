import { AppRole } from "./roles";

export type PermissionAction =
  | "sculpture.create"
  | "sculpture.edit"
  | "sculpture.delete"
  | "sculpture.generate"
  | "sculpture.view_all"
  | "sculpture.duplicate"
  | "sculpture.regenerate"
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
  | "task.create"
  | "task.edit"
  | "task.delete"
  | "task.view_all"
  | "task.view_own"
  | "user.manage"
  | "settings.manage";

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
    'task.create',
    'task.edit',
    'task.delete',
    'task.view_all',
    'task.view_own',
    'user.manage',
    'settings.manage'
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
    'task.view_own'
  ],
  marketing: [
    // Marketing permissions
    'sculpture.view_all',
    'task.view_own'
  ]
};
