
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { ProductLine } from "@/types/product-line";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";

interface ProductLineTableRowProps {
  productLine: ProductLine;
  onEdit: (productLine: ProductLine) => void;
  onDelete: (productLine: ProductLine) => void;
}

export function ProductLineTableRow({
  productLine,
  onEdit,
  onDelete,
}: ProductLineTableRowProps) {
  const { theme } = useTheme();
  const logoUrl = theme === 'dark' 
    ? productLine.black_logo_url 
    : productLine.white_logo_url;
  const bgColor = theme === 'dark' ? 'bg-white' : 'bg-black';

  return (
    <TableRow className="group">
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
      <TableCell>
        <div className="flex flex-col">
          <span>{productLine.name}</span>
          {productLine.product_line_code && (
            <span className="text-sm text-muted-foreground">
              Code: {productLine.product_line_code}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell>{productLine.contact_email}</TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(productLine)}
            className="h-7 w-7 p-0 hover:bg-muted/50"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(productLine)}
            className="h-7 w-7 p-0 hover:bg-muted/50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
