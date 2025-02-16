
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface SculptureStatusProps {
  sculptureId: string;
  status: "ideas" | "pending_additions" | "approved";
}

export function SculptureStatus({ sculptureId, status }: SculptureStatusProps) {
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
      case "ideas":
        return "Idea";
      case "pending_additions":
        return "Pending Addition";
      case "approved":
        return "Approved";
      default:
        return status;
    }
  };

  return (
    <ToggleGroup
      type="single"
      value={status}
      onValueChange={handleStatusChange}
      className="flex gap-1"
    >
      <ToggleGroupItem
        value="ideas"
        className="text-xs capitalize whitespace-nowrap"
        aria-label="Set status to idea"
      >
        {getDisplayName("ideas")}
      </ToggleGroupItem>
      <ToggleGroupItem
        value="pending_additions"
        className="text-xs capitalize whitespace-nowrap"
        aria-label="Set status to pending addition"
      >
        {getDisplayName("pending_additions")}
      </ToggleGroupItem>
      <ToggleGroupItem
        value="approved"
        className="text-xs capitalize whitespace-nowrap"
        aria-label="Set status to approved"
      >
        {getDisplayName("approved")}
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
