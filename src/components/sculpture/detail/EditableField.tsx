import { useState } from "react";
import { CheckIcon, PenIcon, XIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  const { toast } = useToast();

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
      <button
        onClick={() => setIsEditing(true)}
        className="absolute -right-6 top-1 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Edit"
      >
        <PenIcon className="w-4 h-4 text-muted-foreground hover:text-foreground" />
      </button>
    </div>
  );
}