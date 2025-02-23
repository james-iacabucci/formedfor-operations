
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
import { useRef } from "react";
import { SCULPTURE_STATUS, SculptureStatusCode, getStatusDisplayName } from "@/lib/status";
import { toast } from "sonner";

interface SculptureStatusProps {
  sculptureId: string;
  status: SculptureStatusCode;
  variant?: "small" | "large";
}

export function SculptureStatus({ sculptureId, status, variant = "large" }: SculptureStatusProps) {
  const queryClient = useQueryClient();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleStatusChange = async (newStatus: SculptureStatusCode) => {
    try {
      const { error } = await supabase
        .from('sculptures')
        .update({ status: newStatus })
        .eq('id', sculptureId);

      if (error) {
        throw error;
      }

      await queryClient.invalidateQueries({ queryKey: ["sculpture", sculptureId] });
      buttonRef.current?.blur();
      toast.success(`Status updated to ${getStatusDisplayName(newStatus)}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error("Failed to update status");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          ref={buttonRef}
          variant="outline" 
          size="default"
          className={cn(
            variant === "small" && "h-5 px-1.5 text-[10px]"
          )}
        >
          {getStatusDisplayName(status)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleStatusChange(SCULPTURE_STATUS.IDEA.code)}>
          {SCULPTURE_STATUS.IDEA.displayName}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange(SCULPTURE_STATUS.PENDING.code)}>
          {SCULPTURE_STATUS.PENDING.displayName}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange(SCULPTURE_STATUS.APPROVED.code)}>
          {SCULPTURE_STATUS.APPROVED.displayName}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange(SCULPTURE_STATUS.ARCHIVED.code)}>
          {SCULPTURE_STATUS.ARCHIVED.displayName}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
