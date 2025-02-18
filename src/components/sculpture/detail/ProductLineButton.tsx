
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline"
          className={cn(
            variant === "small" ? "h-8 w-8 px-0 text-xs" : "h-9 w-9 px-0",
            "font-mono uppercase"
          )}
        >
          {currentProductLine?.product_line_code?.slice(0, 2) || "--"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {productLines?.map((productLine) => (
          <DropdownMenuItem
            key={productLine.id}
            onClick={() => handleProductLineChange(productLine.id)}
          >
            {productLine.product_line_code || productLine.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
