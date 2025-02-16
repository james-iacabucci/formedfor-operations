
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface ValueList {
  id: string;
  type: 'finish' | 'material' | 'fabricator' | 'texture';
  code: string | null;
  name: string;
  created_at: string;
}

interface ValueListTableProps {
  items: ValueList[];
  showCode: boolean;
  onEdit: (item: ValueList) => void;
  onDelete: (item: ValueList) => void;
}

export function ValueListTable({
  items,
  showCode,
  onEdit,
  onDelete,
}: ValueListTableProps) {
  return (
    <div className="border rounded-md">
      <ScrollArea className="h-[400px]">
        <Table>
          <TableHeader>
            <TableRow>
              {showCode && (
                <TableHead className="w-[100px]">Code</TableHead>
              )}
              <TableHead>Name</TableHead>
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                {showCode && (
                  <TableCell className="font-mono">{item.code}</TableCell>
                )}
                <TableCell>{item.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(item)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
