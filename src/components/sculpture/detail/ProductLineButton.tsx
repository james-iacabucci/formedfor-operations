
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductLine } from "@/types/product-line";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface ProductLineButtonProps {
  sculptureId: string;
  productLineId: string | null;
  productLines: ProductLine[] | undefined;
  currentProductLine: ProductLine | null;
  variant?: "small" | "large";
}

export function ProductLineButton({ 
  sculptureId, 
  productLineId, 
  productLines,
  currentProductLine,
  variant = "large" 
}: ProductLineButtonProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleProductLineChange = async (productLineId: string) => {
    try {
      const { error } = await supabase
        .from('sculptures')
        .update({ product_line_id: productLineId })
        .eq('id', sculptureId);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["sculptures"] });
      await queryClient.invalidateQueries({ queryKey: ["sculpture", sculptureId] });
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

  return (
    <Select
      value={productLineId || undefined}
      onValueChange={handleProductLineChange}
    >
      <SelectTrigger className={cn(
        variant === "small" ? "w-[100px]" : "w-[180px]",
        "h-9"
      )}>
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
  );
}
