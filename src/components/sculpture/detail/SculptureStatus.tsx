
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface SculptureStatusProps {
  sculptureId: string;
  status: "idea" | "pending" | "approved" | "archived";
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
    <ToggleGroup
      type="single"
      value={status}
      onValueChange={handleStatusChange}
      className="flex gap-1"
    >
      <ToggleGroupItem
        value="idea"
        className="text-xs capitalize whitespace-nowrap"
        aria-label="Set status to idea"
      >
        {getDisplayName("idea")}
      </ToggleGroupItem>
      <ToggleGroupItem
        value="pending"
        className="text-xs capitalize whitespace-nowrap"
        aria-label="Set status to pending"
      >
        {getDisplayName("pending")}
      </ToggleGroupItem>
      <ToggleGroupItem
        value="approved"
        className="text-xs capitalize whitespace-nowrap"
        aria-label="Set status to approved"
      >
        {getDisplayName("approved")}
      </ToggleGroupItem>
      <ToggleGroupItem
        value="archived"
        className="text-xs capitalize whitespace-nowrap"
        aria-label="Set status to archived"
      >
        {getDisplayName("archived")}
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
