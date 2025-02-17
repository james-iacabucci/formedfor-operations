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
import { useTheme } from "next-themes";

export function ProductLinesSection() {
  const [selectedProductLine, setSelectedProductLine] = useState<ProductLine | null>(null);
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();
  const { theme } = useTheme();

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
            white_logo_url: data.white_logo_url,
            black_logo_url: data.black_logo_url,
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
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productLines?.map((productLine) => {
              const logoUrl = theme === 'dark' 
                ? productLine.black_logo_url 
                : productLine.white_logo_url;
              const bgColor = theme === 'dark' ? 'bg-white' : 'bg-black';
              
              return (
                <TableRow key={productLine.id} className="group">
                  <TableCell>
                    <Avatar className={`h-12 w-12 rounded-lg ${bgColor}`}>
                      <AvatarImage 
                        src={logoUrl || ''} 
                        alt={productLine.name}
                        className="object-contain p-1"
                      />
                      <AvatarFallback className="rounded-lg">
                        {productLine.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>{productLine.name}</TableCell>
                  <TableCell>{productLine.contact_email}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedProductLine(productLine);
                          setShowForm(true);
                        }}
                        className="h-7 w-7 p-0"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(productLine)}
                        className="h-7 w-7 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
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
