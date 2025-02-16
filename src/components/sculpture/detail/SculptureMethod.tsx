
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

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Method</label>
      <Select value={methodId || ''} onValueChange={handleMethodChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select method" />
        </SelectTrigger>
        <SelectContent>
          {methods?.map((method) => (
            <SelectItem key={method.id} value={method.id}>
              {method.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
