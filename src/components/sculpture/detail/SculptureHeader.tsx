
import { EditableField } from "./EditableField";
import { Sculpture } from "@/types/sculpture";
import { SculptureStatus } from "./SculptureStatus";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileIcon, ImageIcon, MoreHorizontalIcon, Trash2Icon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductLine } from "@/types/product-line";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";

interface SculptureHeaderProps {
  sculpture: Sculpture;
}

export function SculptureHeader({ sculpture }: SculptureHeaderProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const { data: currentProductLine } = useQuery({
    queryKey: ["product_line", sculpture.product_line_id],
    queryFn: async () => {
      if (!sculpture.product_line_id) return null;
      const { data, error } = await supabase
        .from("product_lines")
        .select("*")
        .eq("id", sculpture.product_line_id)
        .single();
      
      if (error) throw error;
      return data as ProductLine;
    },
    enabled: !!sculpture.product_line_id,
  });

  const handleProductLineChange = async (productLineId: string) => {
    try {
      const { error } = await supabase
        .from('sculptures')
        .update({ product_line_id: productLineId })
        .eq('id', sculpture.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["sculptures"] });
      await queryClient.invalidateQueries({ queryKey: ["sculpture", sculpture.id] });
      await queryClient.invalidateQueries({ queryKey: ["product_line", productLineId] });

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

  const handleDownloadImage = () => {
    if (sculpture?.image_url) {
      const link = document.createElement("a");
      link.href = sculpture.image_url;
      link.download = `${sculpture.ai_generated_name || 'sculpture'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: "Download started",
        description: "Your image download has started.",
      });
    }
  };

  const handleDownloadPDF = () => {
    if (sculpture) {
      const link = document.createElement("a");
      link.href = `/sculpture-spec/${sculpture.id}.pdf`;
      link.download = `${sculpture.ai_generated_name || 'sculpture'}-spec.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: "Download started",
        description: "Your spec sheet download has started.",
      });
    }
  };

  const handleDelete = () => {
    if (sculpture) {
      const deleteDialog = document.getElementById(`delete-sculpture-${sculpture.id}`);
      if (deleteDialog instanceof HTMLDialogElement) {
        deleteDialog.showModal();
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-2 flex-1">
          <div className="group inline-flex items-center">
            <EditableField
              value={sculpture.ai_generated_name || "Untitled Sculpture"}
              type="input"
              sculptureId={sculpture.id}
              field="ai_generated_name"
              className="text-4xl font-bold tracking-tight"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={sculpture.product_line_id || undefined}
            onValueChange={handleProductLineChange}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="-">
                {currentProductLine?.product_line_code || "-"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {productLines?.map((productLine) => (
                <SelectItem key={productLine.id} value={productLine.id}>
                  {productLine.product_line_code || productLine.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <SculptureStatus
            sculptureId={sculpture.id}
            status={sculpture.status}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleDownloadImage}>
                <ImageIcon className="h-4 w-4 mr-2" />
                Download Image
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadPDF}>
                <FileIcon className="h-4 w-4 mr-2" />
                Download Spec Sheet
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2Icon className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div>
        <EditableField
          value={sculpture.ai_description || "Sculpture description not defined"}
          type="textarea"
          sculptureId={sculpture.id}
          field="ai_description"
          className="text-muted-foreground italic"
        />
      </div>
    </div>
  );
}
