
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductLine } from "@/types/product-line";
import { toast } from "sonner";

export function useProductLines() {
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

  const handleDelete = async (productLine: ProductLine) => {
    try {
      // Delete both logo files if they exist
      if (productLine.white_logo_url) {
        const fileName = productLine.white_logo_url.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('product_line_logos')
            .remove([fileName]);
        }
      }
      if (productLine.black_logo_url) {
        const fileName = productLine.black_logo_url.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('product_line_logos')
            .remove([fileName]);
        }
      }

      const { error } = await supabase
        .from("product_lines")
        .delete()
        .eq("id", productLine.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["product_lines"] });
      toast.success("Product line deleted successfully");
    } catch (error) {
      console.error("Error deleting product line:", error);
      toast.error("Failed to delete product line");
    }
  };

  const handleSubmit = async (data: Partial<ProductLine>) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("No user found");

      if (!data.name) {
        toast.error("Name is required");
        return;
      }

      if (data.id) {
        // For existing records, update using the ID
        const { error } = await supabase
          .from("product_lines")
          .update({
            name: data.name,
            contact_email: data.contact_email,
            address: data.address,
            white_logo_url: data.white_logo_url,
            black_logo_url: data.black_logo_url,
            product_line_code: data.product_line_code,
          })
          .eq("id", data.id);

        if (error) throw error;
      } else {
        // For new records, insert with user_id
        const { error } = await supabase
          .from("product_lines")
          .insert({
            name: data.name,
            contact_email: data.contact_email,
            address: data.address,
            white_logo_url: data.white_logo_url,
            black_logo_url: data.black_logo_url,
            product_line_code: data.product_line_code,
            user_id: user.user.id
          });

        if (error) throw error;
      }

      await queryClient.invalidateQueries({ queryKey: ["product_lines"] });
      toast.success(
        data.id
          ? "Product line updated successfully"
          : "Product line created successfully"
      );
    } catch (error) {
      console.error("Error saving product line:", error);
      toast.error("Failed to save product line");
    }
  };

  return {
    productLines,
    handleDelete,
    handleSubmit,
  };
}
