
import React from "react";
import { UserWithRoles } from "@/types/roles";
import { AppRole } from "@/types/roles";
import { UserRow } from "./UserRow";

interface UsersListProps {
  users: UserWithRoles[];
  availableRoles: AppRole[];
  formatRoleName: (role: AppRole) => string;
  onRoleChange: (userId: string, newRole: AppRole) => void;
  onDeleteClick: (user: UserWithRoles) => void;
}

export function UsersList({ 
  users, 
  availableRoles, 
  formatRoleName, 
  onRoleChange, 
  onDeleteClick 
}: UsersListProps) {
  if (users.length === 0) {
    return <p className="text-muted-foreground">No users found.</p>;
  }

  return (
    <div className="space-y-4">
      {users.map(user => (
        <UserRow 
          key={user.id}
          user={user}
          availableRoles={availableRoles}
          formatRoleName={formatRoleName}
          onRoleChange={onRoleChange}
          onDeleteClick={onDeleteClick}
        />
      ))}
    </div>
  );
}
