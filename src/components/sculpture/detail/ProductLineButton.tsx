
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
import { useRef } from "react";

interface ProductLineButtonProps {
  sculptureId: string;
  productLineId: string;  // Changed from string | null to string (required)
  productLines: ProductLine[] | undefined;
  currentProductLine: ProductLine | null;
  variant?: "small" | "large";
  className?: string;
}

export function ProductLineButton({ 
  sculptureId, 
  productLineId, 
  productLines,
  currentProductLine,
  variant = "large",
  className
}: ProductLineButtonProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleProductLineChange = async (productLineId: string, e: React.MouseEvent) => {
    // Stop event propagation to prevent card click
    e.stopPropagation();
    
    try {
      const { error } = await supabase
        .from('sculptures')
        .update({ product_line_id: productLineId })
        .eq('id', sculptureId);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["sculptures"] });
      await queryClient.invalidateQueries({ queryKey: ["sculpture", sculptureId] });
      await queryClient.invalidateQueries({ queryKey: ["product_line", productLineId] });

      buttonRef.current?.blur();

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

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={handleTriggerClick}>
        <Button 
          ref={buttonRef}
          variant="outline"
          className={cn(
            variant === "small" ? "h-5 w-8 px-1.5 text-[10px]" : "h-9 w-9 px-0",
            "font-mono uppercase focus:bg-background focus:text-foreground",
            className
          )}
        >
          {currentProductLine?.product_line_code?.slice(0, 2) || "--"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="bg-popover border border-border shadow-md"
      >
        {productLines?.map((productLine) => (
          <DropdownMenuItem
            key={productLine.id}
            onClick={(e) => handleProductLineChange(productLine.id, e)}
            className="cursor-pointer"
          >
            {productLine.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
