
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductLine } from "@/types/product-line";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProductLineSelectorProps {
  sculptureId: string;
  productLineId: string | null;
  productLines: ProductLine[] | undefined;
}

export function ProductLineSelector({ sculptureId, productLineId, productLines }: ProductLineSelectorProps) {
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
      required
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
  );
}
