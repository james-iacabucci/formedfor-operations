
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
import { useState } from "react";
import { SculpturePreviewDialog } from "./SculpturePreviewDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductLineSelector } from "./table/ProductLineSelector";
import { SculptureActions } from "./table/SculptureActions";
import { ProductLine } from "@/types/product-line";

interface SculpturesTableProps {
  sculptures: Sculpture[];
  tags: Array<{ id: string; name: string; }> | undefined;
  sculptureTagRelations: Array<{ sculpture_id: string; tag_id: string; }> | undefined;
  onDelete: (sculpture: Sculpture) => void;
  onManageTags: (sculpture: Sculpture) => void;
  onSculptureClick: (sculptureId: string) => void;
}

export function SculpturesTable({ 
  sculptures, 
  tags, 
  sculptureTagRelations,
  onDelete,
  onManageTags,
  onSculptureClick
}: SculpturesTableProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const { data: productLines } = useQuery({
    queryKey: ["product-lines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_lines")
        .select("*");

      if (error) throw error;
      return data as ProductLine[];
    },
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Name</TableHead>
            <TableHead>Product Line</TableHead>
            <TableHead>Material</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sculptures.map((sculpture, index) => {
            const sculptureSpecificTags = tags?.filter(tag => 
              sculptureTagRelations?.some(relation => 
                relation.sculpture_id === sculpture.id && relation.tag_id === tag.id
              )
            ) || [];
            const productLine = productLines?.find(pl => pl.id === sculpture.product_line_id);
            
            return (
              <TableRow key={sculpture.id}>
                <TableCell>
                  <div 
                    className="font-medium cursor-pointer hover:text-primary"
                    onClick={() => onSculptureClick(sculpture.id)}
                  >
                    {sculpture.ai_generated_name || "Untitled Sculpture"}
                  </div>
                </TableCell>
                <TableCell>
                  <ProductLineSelector
                    sculptureId={sculpture.id}
                    productLineId={sculpture.product_line_id}
                    productLines={productLines || []}
                  />
                </TableCell>
                <TableCell>Material Here</TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {sculptureSpecificTags.map((tag) => (
                      <Badge key={tag.id} variant="outline">{tag.name}</Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{sculpture.status}</TableCell>
                <TableCell>
                  {new Date(sculpture.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <SculptureActions
                    sculpture={sculpture}
                    onDelete={() => onDelete(sculpture)}
                    onPreview={() => setSelectedIndex(index)}
                    onManageTags={() => onManageTags(sculpture)}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <SculpturePreviewDialog
        open={selectedIndex !== null}
        onOpenChange={(open) => !open && setSelectedIndex(null)}
        sculpture={selectedIndex !== null ? sculptures[selectedIndex] : null}
      />
    </div>
  );
}
