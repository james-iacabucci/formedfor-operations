
import { Sculpture } from "@/types/sculpture";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { SculpturePreviewDialog } from "./SculpturePreviewDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductLineSelector } from "./table/ProductLineSelector";
import { SculptureActions } from "./table/SculptureActions";
import { SculpturePreview } from "./table/SculpturePreview";

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

  const handlePrevious = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex > 0 ? selectedIndex - 1 : sculptures.length - 1);
  };

  const handleNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex < sculptures.length - 1 ? selectedIndex + 1 : 0);
  };

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
                <SculpturePreview
                  imageUrl={sculpture.image_url}
                  prompt={sculpture.prompt}
                  onClick={() => setSelectedIndex(index)}
                />
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
                <ProductLineSelector
                  sculptureId={sculpture.id}
                  productLineId={sculpture.product_line_id}
                  productLines={productLines}
                />
              </TableCell>
              <TableCell>
                <SculptureActions
                  sculpture={sculpture}
                  onManageTags={onManageTags}
                  onDelete={onDelete}
                />
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
