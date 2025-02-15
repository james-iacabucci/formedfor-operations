
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ValueListForm } from "./ValueListForm";

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
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState<ValueList['type']>('material');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<ValueList | null>(null);
  const [deleteItem, setDeleteItem] = useState<ValueList | null>(null);
  
  const currentTypeConfig = VALUE_LIST_TYPES.find(t => t.value === selectedType)!;

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

  const addMutation = useMutation({
    mutationFn: async (values: { code?: string; name: string }) => {
      const { error } = await supabase
        .from('value_lists')
        .insert([{ ...values, type: selectedType }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['value-lists'] });
      toast.success("Item added successfully");
    },
    onError: (error) => {
      console.error("Error adding item:", error);
      toast.error("Failed to add item");
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: { code?: string; name: string } }) => {
      const { error } = await supabase
        .from('value_lists')
        .update(values)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['value-lists'] });
      toast.success("Item updated successfully");
    },
    onError: (error) => {
      console.error("Error updating item:", error);
      toast.error("Failed to update item");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('value_lists')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['value-lists'] });
      toast.success("Item deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    }
  });

  const filteredItems = valueLists?.filter(item => item.type === selectedType) || [];

  const handleAdd = async (values: { code?: string; name: string }) => {
    await addMutation.mutateAsync(values);
  };

  const handleEdit = async (values: { code?: string; name: string }) => {
    if (!editItem) return;
    await updateMutation.mutateAsync({ id: editItem.id, values });
    setEditItem(null);
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    await deleteMutation.mutateAsync(deleteItem.id);
    setDeleteItem(null);
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

        <Button onClick={() => setIsAddDialogOpen(true)} size="sm" className="gap-2">
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
                        onClick={() => setEditItem(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteItem(item)}
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

      <ValueListForm
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAdd}
        showCode={currentTypeConfig.showCode}
        title={`Add ${currentTypeConfig.label.slice(0, -1)}`}
      />

      {editItem && (
        <ValueListForm
          open={!!editItem}
          onOpenChange={(open) => !open && setEditItem(null)}
          onSubmit={handleEdit}
          initialData={editItem}
          showCode={currentTypeConfig.showCode}
          title={`Edit ${currentTypeConfig.label.slice(0, -1)}`}
        />
      )}

      <AlertDialog open={!!deleteItem} onOpenChange={(open) => !open && setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
