
import React from "react";
import { UserWithRoles } from "@/types/roles";
import { AppRole } from "@/types/roles";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";

interface UserRowProps {
  user: UserWithRoles;
  availableRoles: AppRole[];
  formatRoleName: (role: AppRole) => string;
  onRoleChange: (userId: string, newRole: AppRole) => void;
  onDeleteClick: (user: UserWithRoles) => void;
}

export function UserRow({ user, availableRoles, formatRoleName, onRoleChange, onDeleteClick }: UserRowProps) {
  const getInitials = (username: string | null): string => {
    if (!username) return "U";
    return username.charAt(0).toUpperCase();
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar_url || undefined} alt={user.username || "User"} />
            <AvatarFallback>
              {getInitials(user.username)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-medium">{user.username || 'Unnamed User'}</h3>
            <p className="text-sm text-muted-foreground">{user.id}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select 
            defaultValue={user.role} 
            value={user.role}
            onValueChange={(value) => {
              onRoleChange(user.id, value as AppRole);
            }}
          >
            <SelectTrigger className="w-32 sm:w-40">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {availableRoles.map(role => (
                <SelectItem key={role} value={role} className="capitalize">
                  {formatRoleName(role)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDeleteClick(user)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
