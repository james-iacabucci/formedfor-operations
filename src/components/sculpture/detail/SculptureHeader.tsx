
import { ProductLineButton } from "./ProductLineButton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductLine } from "@/types/product-line";

interface SculptureHeaderProps {
  sculpture: {
    id: string;
    product_line_id: string | null;
    status: string;
  };
}

export function SculptureHeader({ sculpture }: SculptureHeaderProps) {
  const { data: productLines } = useQuery({
    queryKey: ["product_lines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_lines")
        .select("*")
        .order("name");

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

  return (
    <div className="flex items-center gap-4">
      <ProductLineButton
        sculptureId={sculpture.id}
        productLineId={sculpture.product_line_id}
        productLines={productLines}
        currentProductLine={currentProductLine}
        variant="large"
      />
    </div>
  );
}
