import { useState } from "react";
import { CheckIcon, PenIcon, XIcon, RefreshCwIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface EditableFieldProps {
  value: string;
  type: "input" | "textarea";
  sculptureId: string;
  field: "ai_generated_name" | "ai_description";
  className?: string;
}

export function EditableField({ value, type, sculptureId, field, className }: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(value);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleUpdate = async () => {
    if (editedValue === value) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('sculptures')
        .update({ [field]: editedValue })
        .eq('id', sculptureId);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["sculpture", sculptureId] });
      await queryClient.invalidateQueries({ queryKey: ["sculptures"] });

      toast({
        title: "Success",
        description: "Updated successfully",
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating sculpture:', error);
      toast({
        title: "Error",
        description: "Failed to update. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRegenerate = async () => {
    if (isRegenerating) return;

    setIsRegenerating(true);
    try {
      console.log("Regenerating metadata for field:", field);
      const { error: metadataError } = await supabase.functions.invoke("generate-metadata", {
        body: {
          sculptureId,
          field,
        },
      });

      if (metadataError) throw metadataError;

      await queryClient.invalidateQueries({ queryKey: ["sculpture", sculptureId] });
      await queryClient.invalidateQueries({ queryKey: ["sculptures"] });

      toast({
        title: "Success",
        description: `${field === 'ai_generated_name' ? 'Name' : 'Description'} regenerated successfully.`,
      });
    } catch (error) {
      console.error('Error regenerating:', error);
      toast({
        title: "Error",
        description: "Failed to regenerate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        {type === "input" ? (
          <Input
            value={editedValue}
            onChange={(e) => setEditedValue(e.target.value)}
            className="flex-1"
            placeholder="Enter a name"
            autoFocus
          />
        ) : (
          <Textarea
            value={editedValue}
            onChange={(e) => setEditedValue(e.target.value)}
            className="flex-1"
            placeholder="Enter a description"
            autoFocus
          />
        )}
        <Button 
          onClick={handleUpdate} 
          disabled={isUpdating}
          size="icon"
          variant="ghost"
          className="h-9 w-9"
        >
          <CheckIcon className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          onClick={() => {
            setEditedValue(value);
            setIsEditing(false);
          }}
          size="icon"
          className="h-9 w-9"
        >
          <XIcon className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="group relative">
      <div className={className}>{value}</div>
      <div className="absolute -right-16 top-1 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setIsEditing(true)}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Edit"
        >
          <PenIcon className="w-4 h-4" />
        </button>
        <button
          onClick={handleRegenerate}
          className="text-muted-foreground hover:text-foreground"
          disabled={isRegenerating}
          aria-label="Regenerate"
        >
          <RefreshCwIcon className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
}