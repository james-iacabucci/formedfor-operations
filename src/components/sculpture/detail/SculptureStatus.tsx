
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SculptureStatusProps {
  sculptureId: string;
  status: "idea" | "pending" | "approved" | "archived";
  variant?: "small" | "large";
}

export function SculptureStatus({ sculptureId, status, variant = "large" }: SculptureStatusProps) {
  const queryClient = useQueryClient();

  const handleStatusChange = async (newStatus: string) => {
    const { error } = await supabase
      .from('sculptures')
      .update({ status: newStatus })
      .eq('id', sculptureId);

    if (error) {
      console.error('Error updating status:', error);
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["sculpture", sculptureId] });
  };

  const getDisplayName = (status: string) => {
    switch (status) {
      case "idea":
        return "Idea";
      case "pending":
        return "Pending";
      case "approved":
        return "Approved";
      case "archived":
        return "Archived";
      default:
        return status;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            variant === "small" ? "h-8 px-2 text-xs" : "h-9 px-4"
          )}
        >
          <Badge
            variant={
              status === "approved" 
                ? "default" 
                : status === "pending" 
                  ? "secondary" 
                  : "outline"
            }
            className="capitalize"
          >
            {status}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleStatusChange("idea")}>
          Idea
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange("pending")}>
          Pending
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange("approved")}>
          Approved
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange("archived")}>
          Archived
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
