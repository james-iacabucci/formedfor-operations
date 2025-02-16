import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
import { ValueListsHeader } from "./ValueListsHeader";
import { ValueListTypeSelector } from "./ValueListTypeSelector";
import { ValueListTable } from "./ValueListTable";
import { MaterialFinishesDialog } from "./MaterialFinishesDialog";

interface ValueList {
  id: string;
  type: 'finish' | 'material' | 'fabricator' | 'texture';
  code: string | null;
  name: string;
  created_at: string;
}

interface MaterialFinish {
  material_id: string;
  finish_id: string;
}

const VALUE_LIST_TYPES = [
  { value: 'material' as const, label: 'Materials', showCode: true },
  { value: 'finish' as const, label: 'Finishes', showCode: false },
  { value: 'fabricator' as const, label: 'Fabricators', showCode: false },
  { value: 'texture' as const, label: 'Textures', showCode: false },
] as const;

export function ValueListsSection() {
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState<ValueList['type']>('material');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<ValueList | null>(null);
  const [deleteItem, setDeleteItem] = useState<ValueList | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<ValueList | null>(null);
  const [isFinishesDialogOpen, setIsFinishesDialogOpen] = useState(false);
  
  const currentTypeConfig = VALUE_LIST_TYPES.find(t => t.value === selectedType)!;

  const { data: valueLists, isLoading } = useQuery({
    queryKey: ['value-lists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('value_lists')
        .select('*')
        .order('type')
        .order('code', { nullsLast: true })
        .order('name');
      
      if (error) throw error;
      return data as ValueList[];
    }
  });

  const { data: materialFinishes } = useQuery({
    queryKey: ['material-finishes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('material_finishes')
        .select('*');
      
      if (error) throw error;
      return data as MaterialFinish[];
    }
  });

  const getCountForType = (type: ValueList['type']) => {
    return valueLists?.filter(item => item.type === type).length || 0;
  };

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

  const updateMaterialFinishes = useMutation({
    mutationFn: async ({ materialId, finishIds }: { materialId: string; finishIds: string[] }) => {
      const { error: deleteError } = await supabase
        .from('material_finishes')
        .delete()
        .eq('material_id', materialId);
      
      if (deleteError) throw deleteError;

      if (finishIds.length > 0) {
        const { error: insertError } = await supabase
          .from('material_finishes')
          .insert(
            finishIds.map(finishId => ({
              material_id: materialId,
              finish_id: finishId
            }))
          );
        
        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['material-finishes'] });
      toast.success("Material finishes updated successfully");
    },
    onError: (error) => {
      console.error("Error updating material finishes:", error);
      toast.error("Failed to update material finishes");
    }
  });

  const filteredItems = valueLists?.filter(item => item.type === selectedType) || [];
  const finishes = valueLists?.filter(item => item.type === 'finish') || [];
  const selectedMaterialFinishes = materialFinishes?.filter(
    mf => mf.material_id === selectedMaterial?.id
  ).map(mf => mf.finish_id) || [];

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

  const handleFinishesUpdate = async (selectedFinishIds: string[]) => {
    if (!selectedMaterial) return;
    await updateMaterialFinishes.mutateAsync({
      materialId: selectedMaterial.id,
      finishIds: selectedFinishIds
    });
    setIsFinishesDialogOpen(false);
  };

  if (isLoading) {
    return <div>Loading value lists...</div>;
  }

  return (
    <div className="space-y-4">
      <ValueListsHeader />
      
      <ValueListTypeSelector
        types={VALUE_LIST_TYPES}
        selectedType={selectedType}
        onTypeChange={(type) => setSelectedType(type)}
        onAddClick={() => setIsAddDialogOpen(true)}
        getCountForType={(type) => valueLists?.filter(item => item.type === type).length || 0}
      />

      <ValueListTable
        items={filteredItems}
        showCode={currentTypeConfig.showCode}
        onEdit={setEditItem}
        onDelete={setDeleteItem}
        onManageFinishes={(item) => {
          setSelectedMaterial(item);
          setIsFinishesDialogOpen(true);
        }}
      />

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

      <MaterialFinishesDialog
        open={isFinishesDialogOpen}
        onOpenChange={setIsFinishesDialogOpen}
        material={selectedMaterial}
        finishes={finishes}
        selectedFinishIds={selectedMaterialFinishes}
        onFinishesUpdate={handleFinishesUpdate}
      />
    </div>
  );
}
