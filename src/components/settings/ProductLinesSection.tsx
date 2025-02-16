
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductLine } from "@/types/product-line";
import { ProductLineForm } from "./ProductLineForm";
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ProductLinesSection() {
  const [selectedProductLine, setSelectedProductLine] = useState<ProductLine | null>(null);
  const [showForm, setShowForm] = useState(false);
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

  const handleSubmit = async (data: Partial<ProductLine>) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("No user found");

      if (!data.name) {
        toast.error("Name is required");
        return;
      }

      if (selectedProductLine) {
        const { error } = await supabase
          .from("product_lines")
          .update(data)
          .eq("id", selectedProductLine.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("product_lines")
          .insert({
            name: data.name,
            contact_email: data.contact_email,
            address: data.address,
            logo_url: data.logo_url,
            user_id: user.user.id
          });

        if (error) throw error;
      }

      await queryClient.invalidateQueries({ queryKey: ["product_lines"] });
      toast.success(
        selectedProductLine
          ? "Product line updated successfully"
          : "Product line created successfully"
      );
    } catch (error) {
      console.error("Error saving product line:", error);
      toast.error("Failed to save product line");
    }
  };

  const handleDelete = async (productLine: ProductLine) => {
    try {
      // Delete the logo file if it exists
      if (productLine.logo_url) {
        const fileName = productLine.logo_url.split('/').pop();
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Product Lines</h3>
        <Button
          onClick={() => {
            setSelectedProductLine(null);
            setShowForm(true);
          }}
          size="sm"
          className="gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Add Product Line
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Logo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Contact Email</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productLines?.map((productLine) => (
              <TableRow key={productLine.id}>
                <TableCell>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={productLine.logo_url || ''} alt={productLine.name} />
                    <AvatarFallback>{productLine.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell>{productLine.name}</TableCell>
                <TableCell>{productLine.contact_email}</TableCell>
                <TableCell>{productLine.address}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8"
                      onClick={() => {
                        setSelectedProductLine(productLine);
                        setShowForm(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(productLine)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ProductLineForm
        open={showForm}
        onOpenChange={setShowForm}
        onSubmit={handleSubmit}
        initialData={selectedProductLine || undefined}
        title={selectedProductLine ? "Edit Product Line" : "Add Product Line"}
      />
    </div>
  );
}
