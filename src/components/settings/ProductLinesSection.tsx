
import { useState } from "react";
import { ProductLine } from "@/types/product-line";
import { ProductLineForm } from "./ProductLineForm";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useProductLines } from "./product-lines/useProductLines";
import { ProductLinesTable } from "./product-lines/ProductLinesTable";

export function ProductLinesSection() {
  const [selectedProductLine, setSelectedProductLine] = useState<ProductLine | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { productLines, handleDelete, handleSubmit } = useProductLines();

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
          variant="primary"
        >
          <PlusCircle className="h-4 w-4" />
          Add Product Line
        </Button>
      </div>

      <ProductLinesTable
        productLines={productLines || []}
        onEdit={(productLine) => {
          setSelectedProductLine(productLine);
          setShowForm(true);
        }}
        onDelete={handleDelete}
      />

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
