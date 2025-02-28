
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type AppRole = "company_staff" | "client" | "public";

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export function useUserRoles() {
  const queryClient = useQueryClient();

  const { data: userRoles, isLoading } = useQuery({
    queryKey: ["user_roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*");

      if (error) throw error;
      return data as UserRole[];
    },
  });

  const { data: currentUserRoles } = useQuery({
    queryKey: ["current_user_roles"],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        throw new Error("No authenticated user");
      }

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.session.user.id);

      if (error) throw error;
      return data.map(r => r.role) as AppRole[];
    },
  });

  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .insert([{ user_id: userId, role }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_roles"] });
      toast.success("Role assigned successfully");
    },
    onError: (error) => {
      console.error("Error assigning role:", error);
      toast.error("Failed to assign role. Please try again.");
    },
  });

  const removeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_roles"] });
      toast.success("Role removed successfully");
    },
    onError: (error) => {
      console.error("Error removing role:", error);
      toast.error("Failed to remove role. Please try again.");
    },
  });

  const hasRole = (roles: AppRole[] | undefined, role: AppRole): boolean => {
    if (!roles) return false;
    return roles.includes(role);
  };

  return {
    userRoles,
    currentUserRoles,
    isLoading,
    assignRoleMutation,
    removeRoleMutation,
    hasRole,
  };
}
