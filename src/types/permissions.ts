
// Available permissions in the system
export type PermissionAction = 
  // Sculpture permissions
  | 'sculpture.view'
  | 'sculpture.create'
  | 'sculpture.edit'
  | 'sculpture.delete'
  | 'sculpture.regenerate'
  
  // Variant permissions
  | 'variant.view'
  | 'variant.create'
  | 'variant.edit'
  | 'variant.delete'
  
  // Quote permissions
  | 'quote.view'
  | 'quote.view_pricing'
  | 'quote.create' 
  | 'quote.edit'
  | 'quote.edit_requested'
  | 'quote.delete'
  | 'quote.approve'
  | 'quote.reject'
  | 'quote.select'
  | 'quote.requote'
  | 'quote.submit_approval'
  
  // Chat permissions
  | 'sculpture_chat.view'
  | 'sculpture_chat.send_messages'
  | 'sculpture_chat.upload_files'
  | 'quote_chat.view'
  | 'quote_chat.send_messages'
  | 'quote_chat.upload_files'
  
  // Settings permissions
  | 'settings.manage_tags'
  | 'settings.manage_value_lists'
  | 'settings.manage_product_lines'
  | 'settings.manage_roles';

// Interface for permission records
export interface Permission {
  id: string;
  action: PermissionAction;
  description: string;
}

// Interface for role-permission mappings
export interface RolePermission {
  id: string;
  role: AppRole;
  permission: PermissionAction;
}

// Import from the roles type
import { AppRole } from './roles';

// Default permissions assigned to each role
export const DEFAULT_ROLE_PERMISSIONS: Record<AppRole, PermissionAction[]> = {
  admin: [
    // Admins have all permissions
    'sculpture.view', 'sculpture.create', 'sculpture.edit', 'sculpture.delete', 'sculpture.regenerate',
    'variant.view', 'variant.create', 'variant.edit', 'variant.delete',
    'quote.view', 'quote.view_pricing', 'quote.create', 'quote.edit', 'quote.edit_requested', 'quote.delete', 
    'quote.approve', 'quote.reject', 'quote.select', 'quote.requote', 'quote.submit_approval',
    'sculpture_chat.view', 'sculpture_chat.send_messages', 'sculpture_chat.upload_files',
    'quote_chat.view', 'quote_chat.send_messages', 'quote_chat.upload_files',
    'settings.manage_tags', 'settings.manage_value_lists', 'settings.manage_product_lines', 'settings.manage_roles'
  ],
  
  sales: [
    // Sales can view, create and edit sculptures
    'sculpture.view', 'sculpture.create', 'sculpture.edit', 'sculpture.regenerate',
    'variant.view', 'variant.create', 'variant.edit',
    'quote.view', 'quote.view_pricing', 'quote.select', 'quote.approve', 'quote.reject', 'quote.requote',
    'sculpture_chat.view', 'sculpture_chat.send_messages', 'sculpture_chat.upload_files',
    'quote_chat.view',
    'settings.manage_tags'
  ],
  
  fabrication: [
    // Fabrication team focuses on quotes with limited permissions
    'sculpture.view',
    'variant.view',
    'quote.view', 'quote.edit_requested', 'quote.submit_approval',
    'sculpture_chat.view',
    'quote_chat.view', 'quote_chat.send_messages', 'quote_chat.upload_files'
  ],
  
  orders: [
    // Orders team has view access
    'sculpture.view',
    'variant.view',
    'quote.view', 'quote.view_pricing',
    'sculpture_chat.view',
    'quote_chat.view'
  ]
};

// All available permissions with descriptions
export const ALL_PERMISSIONS: Permission[] = [
  // Sculpture permissions
  { id: 'sculpture.view', action: 'sculpture.view', description: 'View sculptures' },
  { id: 'sculpture.create', action: 'sculpture.create', description: 'Create new sculptures' },
  { id: 'sculpture.edit', action: 'sculpture.edit', description: 'Edit existing sculptures' },
  { id: 'sculpture.delete', action: 'sculpture.delete', description: 'Delete sculptures' },
  { id: 'sculpture.regenerate', action: 'sculpture.regenerate', description: 'Regenerate sculpture images' },
  
  // Variant permissions
  { id: 'variant.view', action: 'variant.view', description: 'View sculpture variants' },
  { id: 'variant.create', action: 'variant.create', description: 'Create sculpture variants' },
  { id: 'variant.edit', action: 'variant.edit', description: 'Edit sculpture variants' },
  { id: 'variant.delete', action: 'variant.delete', description: 'Delete sculpture variants' },
  
  // Quote permissions
  { id: 'quote.view', action: 'quote.view', description: 'View fabrication quotes' },
  { id: 'quote.view_pricing', action: 'quote.view_pricing', description: 'View pricing information on quotes' },
  { id: 'quote.create', action: 'quote.create', description: 'Create fabrication quotes' },
  { id: 'quote.edit', action: 'quote.edit', description: 'Edit any fabrication quotes' },
  { id: 'quote.edit_requested', action: 'quote.edit_requested', description: 'Edit quotes in requested status' },
  { id: 'quote.delete', action: 'quote.delete', description: 'Delete fabrication quotes' },
  { id: 'quote.approve', action: 'quote.approve', description: 'Approve fabrication quotes' },
  { id: 'quote.reject', action: 'quote.reject', description: 'Reject fabrication quotes' },
  { id: 'quote.select', action: 'quote.select', description: 'Select quotes as preferred' },
  { id: 'quote.requote', action: 'quote.requote', description: 'Request a requote on approved quotes' },
  { id: 'quote.submit_approval', action: 'quote.submit_approval', description: 'Submit quotes for approval' },
  
  // Chat permissions
  { id: 'sculpture_chat.view', action: 'sculpture_chat.view', description: 'View sculpture chat' },
  { id: 'sculpture_chat.send_messages', action: 'sculpture_chat.send_messages', description: 'Send messages in sculpture chat' },
  { id: 'sculpture_chat.upload_files', action: 'sculpture_chat.upload_files', description: 'Upload files in sculpture chat' },
  { id: 'quote_chat.view', action: 'quote_chat.view', description: 'View quote chat' },
  { id: 'quote_chat.send_messages', action: 'quote_chat.send_messages', description: 'Send messages in quote chat' },
  { id: 'quote_chat.upload_files', action: 'quote_chat.upload_files', description: 'Upload files in quote chat' },
  
  // Settings permissions
  { id: 'settings.manage_tags', action: 'settings.manage_tags', description: 'Manage tags' },
  { id: 'settings.manage_value_lists', action: 'settings.manage_value_lists', description: 'Manage value lists' },
  { id: 'settings.manage_product_lines', action: 'settings.manage_product_lines', description: 'Manage product lines' },
  { id: 'settings.manage_roles', action: 'settings.manage_roles', description: 'Manage user roles and permissions' }
];
