
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
import { TagIcon, MoreHorizontal, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Preview</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Prompt</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sculptures.map((sculpture) => {
            const sculptureSpecificTags = tags?.filter(tag => 
              sculptureTagRelations?.some(relation => 
                relation.sculpture_id === sculpture.id && relation.tag_id === tag.id
              )
            ) || [];

            return (
              <TableRow key={sculpture.id}>
                <TableCell>
                  <div 
                    className="relative w-16 h-16 rounded-md overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/sculpture/${sculpture.id}`)}
                  >
                    <img 
                      src={sculpture.image_url || ''} 
                      alt={sculpture.prompt}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {sculpture.ai_generated_name || "Untitled Sculpture"}
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {sculpture.prompt}
                  </p>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {sculptureSpecificTags.map(tag => (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className="flex items-center gap-1 text-xs px-2 py-0.5"
                      >
                        <TagIcon className="w-3 h-3" />
                        <span>{tag.name}</span>
                      </Badge>
                    ))}
                  </div>
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
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
