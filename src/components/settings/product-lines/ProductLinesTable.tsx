
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductLine } from "@/types/product-line";
import { ProductLineTableRow } from "./ProductLineTableRow";

interface ProductLinesTableProps {
  productLines: ProductLine[];
  onEdit: (productLine: ProductLine) => void;
  onDelete: (productLine: ProductLine) => void;
}

export function ProductLinesTable({
  productLines,
  onEdit,
  onDelete,
}: ProductLinesTableProps) {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader className="sticky top-0 bg-background z-10">
          <TableRow>
            <TableHead>Logo</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Contact Email</TableHead>
            <TableHead className="w-[100px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {productLines?.map((productLine) => (
            <ProductLineTableRow
              key={productLine.id}
              productLine={productLine}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
