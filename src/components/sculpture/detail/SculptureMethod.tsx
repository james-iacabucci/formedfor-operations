
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import { useUserRoles } from "@/hooks/use-user-roles";

interface SculptureMethodProps {
  sculptureId: string;
  methodId: string | null;
  isBase?: boolean;
  isQuoteForm?: boolean;
  isVariantForm?: boolean;
  variantId?: string;
  onMethodChange?: (methodId: string) => void;
}

export function SculptureMethod({ 
  sculptureId, 
  methodId,
  isBase = false,
  isQuoteForm = false,
  isVariantForm = false,
  variantId,
  onMethodChange
}: SculptureMethodProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { hasPermission } = useUserRoles();
  const canEdit = isQuoteForm || hasPermission("sculpture.edit");
  
  const { data: methods } = useQuery({
    queryKey: ['value-lists', 'method'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('value_lists')
        .select('*')
        .eq('type', 'method')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const handleMethodChange = async (newMethodId: string) => {
    if (!canEdit) return;
    
    try {
      if ((isQuoteForm || isVariantForm) && onMethodChange) {
        // In form mode, just update the form state
        onMethodChange(newMethodId);
        
        if (!isVariantForm) return;
      }

      let error;
      const fieldName = isBase ? 'base_method_id' : 'method_id';
      
      if (isVariantForm && variantId) {
        // Update the sculpture_variants table for variants
        const { error: variantError } = await supabase
          .from('sculpture_variants')
          .update({ [fieldName]: newMethodId })
          .eq('id', variantId);
        error = variantError;
        
        // Invalidate variant queries
        await queryClient.invalidateQueries({ queryKey: ["sculpture-variants", sculptureId] });
      } else {
        // Update the sculptures table
        const { error: sculptureError } = await supabase
          .from("sculptures")
          .update({ [fieldName]: newMethodId })
          .eq("id", sculptureId);
        error = sculptureError;
      }

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update method",
          variant: "destructive",
        });
        return;
      }

      // Invalidate sculpture query to refresh data
      queryClient.invalidateQueries({ queryKey: ["sculpture", sculptureId] });
      
      toast({
        title: "Success",
        description: "Method updated successfully",
      });
    } catch (err) {
      console.error('Exception updating method:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating method",
        variant: "destructive",
      });
    }
    
    // Blur the trigger element to remove focus after selection
    if (triggerRef.current) {
      triggerRef.current.blur();
    }
  };

  const selectedMethod = methods?.find(m => m.id === methodId)?.name || '';

  return (
    <Select
      value={methodId || ''}
      onValueChange={handleMethodChange}
      onOpenChange={(open) => {
        if (!open && triggerRef.current) {
          triggerRef.current.blur();
        }
      }}
      disabled={!canEdit}
    >
      <SelectTrigger className={`group ${!canEdit ? 'cursor-not-allowed opacity-70' : ''}`} ref={triggerRef}>
        <div className="flex gap-1 items-center">
          <span className="text-muted-foreground">Method:</span>
          <SelectValue placeholder="Select method">
            {selectedMethod}
          </SelectValue>
        </div>
      </SelectTrigger>
      {canEdit && (
        <SelectContent>
          {methods?.map((method) => (
            <SelectItem key={method.id} value={method.id}>
              {method.name}
            </SelectItem>
          ))}
        </SelectContent>
      )}
    </Select>
  );
}
