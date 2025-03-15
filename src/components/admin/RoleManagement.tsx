
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { ArchiveDeleteDialog } from "@/components/common/ArchiveDeleteDialog";
import { useRoleManagement } from "@/hooks/admin/useRoleManagement";
import { UsersList } from "./users/UsersList";

export function RoleManagement() {
  const {
    users,
    loading,
    isAdmin,
    availableRoles,
    handleRoleChange,
    userToDelete,
    setUserToDelete,
    deleteDialogOpen,
    setDeleteDialogOpen,
    isDeleting,
    handleDeleteUser,
    formatRoleName
  } = useRoleManagement();

  if (!isAdmin) {
    return (
      <div className="p-4">
        <p>You don't have permission to manage users.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          User Management
        </CardTitle>
        <CardDescription>
          Manage users and their roles in the system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UsersList 
          users={users}
          availableRoles={availableRoles}
          formatRoleName={formatRoleName}
          onRoleChange={handleRoleChange}
          onDeleteClick={(user) => {
            setUserToDelete(user);
            setDeleteDialogOpen(true);
          }}
        />
      </CardContent>
      
      <ArchiveDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete User"
        description={`Are you sure you want to delete ${userToDelete?.username || 'this user'}? This will remove their profile from the system, but the authentication record will require administrative access to fully remove.`}
        onArchive={() => setDeleteDialogOpen(false)} // Required by the component
        onDelete={handleDeleteUser}
        isLoading={isDeleting}
        hideArchive={true}
      />
    </Card>
  );
}
