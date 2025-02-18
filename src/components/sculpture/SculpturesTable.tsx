
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { ProductLine } from "@/types/product-line";

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
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: productLines } = useQuery({
    queryKey: ["product_lines"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("product_lines")
        .select("*")
        .eq("user_id", user.user.id);

      if (error) throw error;
      return data as ProductLine[];
    },
  });

  const formatDimensions = (sculpture: Sculpture) => {
    if (!sculpture.height_in && !sculpture.width_in && !sculpture.depth_in) {
      return "Not specified";
    }
    return `${sculpture.height_in || 0}h - ${sculpture.width_in || 0}w - ${sculpture.depth_in || 0}d (in)`;
  };

  const handleProductLineChange = async (sculptureId: string, productLineId: string) => {
    try {
      const { error } = await supabase
        .from('sculptures')
        .update({ product_line_id: productLineId })
        .eq('id', sculptureId);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["sculptures"] });

      toast({
        title: "Success",
        description: "Product line updated successfully",
      });
    } catch (error) {
      console.error('Error updating product line:', error);
      toast({
        title: "Error",
        description: "Failed to update product line",
        variant: "destructive",
      });
    }
  };

  const handlePrevious = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex > 0 ? selectedIndex - 1 : sculptures.length - 1);
  };

  const handleNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex < sculptures.length - 1 ? selectedIndex + 1 : 0);
  };

  // Convert sculptures to file format for preview
  const previewFiles = sculptures.map(sculpture => ({
    id: sculpture.id,
    name: sculpture.ai_generated_name || "Untitled Sculpture",
    url: sculpture.image_url || "",
    created_at: sculpture.created_at,
  }));

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Preview</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Dimensions</TableHead>
            <TableHead>Product Line</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sculptures.map((sculpture, index) => (
            <TableRow key={sculpture.id}>
              <TableCell>
                <div className="relative w-16 h-16 rounded-md overflow-hidden group">
                  <img 
                    src={sculpture.image_url || ''} 
                    alt={sculpture.prompt}
                    className="object-cover w-full h-full cursor-zoom-in"
                    onClick={() => setSelectedIndex(index)}
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
                      : sculpture.status === "pending" 
                        ? "secondary" 
                        : "outline"
                  }
                  className="capitalize"
                >
                  {sculpture.status}
                </Badge>
              </TableCell>
              <TableCell className="font-mono text-sm">
                {formatDimensions(sculpture)}
              </TableCell>
              <TableCell>
                <Select
                  value={sculpture.product_line_id || undefined}
                  onValueChange={(value) => handleProductLineChange(sculpture.id, value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select product line" />
                  </SelectTrigger>
                  <SelectContent>
                    {productLines?.map((productLine) => (
                      <SelectItem key={productLine.id} value={productLine.id}>
                        {productLine.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
        files={previewFiles}
        selectedIndex={selectedIndex}
        open={selectedIndex !== null}
        onOpenChange={(open) => !open && setSelectedIndex(null)}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />
    </div>
  );
}
