
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useQuery } from "@tanstack/react-query";

interface SculptureMethodProps {
  sculptureId: string;
  methodId: string | null;
}

export function SculptureMethod({ 
  sculptureId, 
  methodId
}: SculptureMethodProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
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
    const { error } = await supabase
      .from("sculptures")
      .update({ method_id: newMethodId })
      .eq("id", sculptureId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update method",
        variant: "destructive",
      });
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["sculpture", sculptureId] });
    toast({
      title: "Success",
      description: "Method updated successfully",
    });
  };

  const selectedMethod = methods?.find(m => m.id === methodId)?.name || '';

  return (
    <Select value={methodId || ''} onValueChange={handleMethodChange}>
      <SelectTrigger>
        <div className="flex gap-1 items-center">
          <span className="text-muted-foreground">Method:</span>
          <SelectValue placeholder="Select method">
            {selectedMethod}
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {methods?.map((method) => (
          <SelectItem key={method.id} value={method.id}>
            {method.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
