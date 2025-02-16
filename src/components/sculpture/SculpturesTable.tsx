
import { Sculpture } from "@/types/sculpture";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TagIcon, MoreHorizontal, Trash2, ZoomIn } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { SculpturePreviewDialog } from "./SculpturePreviewDialog";

interface SculpturesTableProps {
  sculptures: Sculpture[];
  tags: Array<{ id: string; name: string; }> | undefined;
  sculptureTagRelations: Array<{ sculpture_id: string; tag_id: string; }> | undefined;
  onDelete: (sculpture: Sculpture) => void;
  onManageTags: (sculpture: Sculpture) => void;
}

export function SculpturesTable({ 
  sculptures, 
  tags, 
  sculptureTagRelations,
  onDelete,
  onManageTags 
}: SculpturesTableProps) {
  const navigate = useNavigate();
  const [previewSculpture, setPreviewSculpture] = useState<Sculpture | null>(null);

  const formatDimensions = (sculpture: Sculpture) => {
    if (!sculpture.height_in && !sculpture.width_in && !sculpture.depth_in) {
      return "Not specified";
    }
    return `${sculpture.height_in || 0}h - ${sculpture.width_in || 0}w - ${sculpture.depth_in || 0}d (in)`;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Preview</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Dimensions</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sculptures.map((sculpture) => (
            <TableRow key={sculpture.id}>
              <TableCell>
                <div className="relative w-16 h-16 rounded-md overflow-hidden group">
                  <img 
                    src={sculpture.image_url || ''} 
                    alt={sculpture.prompt}
                    className="object-cover w-full h-full cursor-zoom-in"
                    onClick={() => setPreviewSculpture(sculpture)}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ZoomIn className="w-6 h-6 text-white" />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div 
                  className="font-medium cursor-pointer hover:text-primary"
                  onClick={() => navigate(`/sculpture/${sculpture.id}`)}
                >
                  {sculpture.ai_generated_name || "Untitled Sculpture"}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    sculpture.status === "approved" 
                      ? "default" 
                      : sculpture.status === "pending_additions" 
                        ? "secondary" 
                        : "outline"
                  }
                  className="capitalize"
                >
                  {sculpture.status === "pending_additions" ? "Pending" : sculpture.status}
                </Badge>
              </TableCell>
              <TableCell className="font-mono text-sm">
                {formatDimensions(sculpture)}
              </TableCell>
              <TableCell>
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <SculpturePreviewDialog
        sculpture={previewSculpture}
        open={!!previewSculpture}
        onOpenChange={(open) => !open && setPreviewSculpture(null)}
      />
    </div>
  );
}
