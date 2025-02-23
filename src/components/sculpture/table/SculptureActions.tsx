
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sculpture } from "@/types/sculpture";
import { MoreHorizontal, TagIcon, Trash2 } from "lucide-react";

interface SculptureActionsProps {
  sculpture: Sculpture;
  onManageTags: (sculpture: Sculpture) => void;
  onDelete: (sculpture: Sculpture) => void;
}

export function SculptureActions({ sculpture, onManageTags, onDelete }: SculptureActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onManageTags(sculpture)}>
          <TagIcon className="mr-2 h-4 w-4" />
          Manage Tags
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onDelete(sculpture)}
          className="text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
