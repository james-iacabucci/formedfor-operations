
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ValueList {
  id: string;
  type: 'finish' | 'material' | 'fabricator' | 'texture';
  code: string | null;
  name: string;
  created_at: string;
}

type ValueListType = {
  value: ValueList['type'];
  label: string;
  showCode: boolean;
};

const VALUE_LIST_TYPES: ValueListType[] = [
  { value: 'material', label: 'Materials', showCode: true },
  { value: 'finish', label: 'Finishes', showCode: false },
  { value: 'fabricator', label: 'Fabricators', showCode: false },
  { value: 'texture', label: 'Textures', showCode: false },
];

export function ValueListsSection() {
  const { data: valueLists, isLoading } = useQuery({
    queryKey: ['value-lists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('value_lists')
        .select('*')
        .order('type')
        .order('code', { nullsFirst: false })
        .order('name');
      
      if (error) throw error;
      return data as ValueList[];
    }
  });

  const [selectedType, setSelectedType] = useState<ValueList['type']>('material');
  
  const currentTypeConfig = VALUE_LIST_TYPES.find(t => t.value === selectedType)!;
  const filteredItems = valueLists?.filter(item => item.type === selectedType) || [];

  const handleAddItem = () => {
    // TODO: Implement add functionality
    toast.info("Add functionality coming soon");
  };

  const handleEditItem = (item: ValueList) => {
    // TODO: Implement edit functionality
    toast.info("Edit functionality coming soon");
  };

  const handleDeleteItem = (item: ValueList) => {
    // TODO: Implement delete functionality
    toast.info("Delete functionality coming soon");
  };

  if (isLoading) {
    return <div>Loading value lists...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Value Lists</h3>
        <p className="text-sm text-muted-foreground">
          Manage materials, finishes, fabricators, and textures for sculptures
        </p>
      </div>
      <Separator />

      <div className="flex items-center justify-between">
        <Select
          value={selectedType}
          onValueChange={(value: ValueList['type']) => setSelectedType(value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select list type" />
          </SelectTrigger>
          <SelectContent>
            {VALUE_LIST_TYPES.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.label} ({filteredItems.length})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={handleAddItem} size="sm" className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add {currentTypeConfig.label.slice(0, -1)}
        </Button>
      </div>

      <div className="border rounded-md">
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                {currentTypeConfig.showCode && (
                  <TableHead className="w-[100px]">Code</TableHead>
                )}
                <TableHead>Name</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  {currentTypeConfig.showCode && (
                    <TableCell className="font-mono">{item.code}</TableCell>
                  )}
                  <TableCell>{item.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditItem(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteItem(item)}
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
    </div>
  );
}
