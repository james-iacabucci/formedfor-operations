
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

interface SculptureStatusProps {
  sculptureId: string;
  status: "idea" | "pending" | "approved" | "archived";
  variant?: "small" | "large";
}

export function SculptureStatus({ sculptureId, status, variant = "large" }: SculptureStatusProps) {
  const queryClient = useQueryClient();
  const buttonRef = useRef<HTMLButtonElement>(null);

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
    buttonRef.current?.blur();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          ref={buttonRef}
          variant="outline" 
          size="default"
          className={cn(
            "bg-neutral-900 text-white hover:bg-neutral-800 capitalize w-24",
            variant === "small" && "h-5 px-1.5 text-[10px]"
          )}
        >
          {status}
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
