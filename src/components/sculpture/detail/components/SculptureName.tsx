
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckIcon, Pencil, RefreshCw, XIcon } from "lucide-react";
import { EditableField, EditableFieldRef } from "../EditableField";
import { useAIGeneration } from "@/hooks/use-ai-generation";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SculptureNameProps {
  sculptureId: string;
  imageUrl: string | null;
  name: string | null;
  onNameUpdate?: (newName: string) => void;
}

export function SculptureName({ sculptureId, imageUrl, name, onNameUpdate }: SculptureNameProps) {
  const { generateAIContent, isGeneratingName } = useAIGeneration();
  const [isNameEditing, setIsNameEditing] = useState(false);
  const editableFieldRef = useRef<EditableFieldRef>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleRegenerateName = async () => {
    if (!imageUrl) return;
    
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], "sculpture.png", { type: "image/png" });
      
      generateAIContent(
        "name",
        file,
        "",
        async (newName: string) => {
          const { error } = await supabase
            .from("sculptures")
            .update({ ai_generated_name: newName })
            .eq("id", sculptureId);
          
          if (error) throw error;
          
          await queryClient.invalidateQueries({ queryKey: ["sculpture", sculptureId] });
          
          // Call onNameUpdate to trigger description regeneration
          if (onNameUpdate) {
            onNameUpdate(newName);
          }

          toast({
            title: "Success",
            description: "Name regenerated successfully.",
          });
        }
      );
    } catch (error) {
      console.error("Error regenerating name:", error);
      toast({
        title: "Error",
        description: "Failed to regenerate name. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveName = async () => {
    const savedValue = await editableFieldRef.current?.save();
    if (savedValue && onNameUpdate) {
      onNameUpdate(savedValue);
    }
  };

  return (
    <div className="group space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Name</h3>
        {isNameEditing ? (
          <div className="flex gap-2">
            <Button 
              onClick={handleSaveName}
              size="sm"
              variant="secondary"
            >
              <CheckIcon className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setIsNameEditing(false)}
              size="sm"
            >
              <XIcon className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRegenerateName}
              disabled={isGeneratingName}
              className={isGeneratingName ? "opacity-100" : "opacity-0 group-hover:opacity-100 transition-opacity"}
            >
              <RefreshCw className={`h-4 w-4 ${isGeneratingName ? "animate-spin" : ""}`} />
            </Button>
            {!isGeneratingName && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsNameEditing(true)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
      <EditableField
        ref={editableFieldRef}
        value={name || "Untitled"}
        type="input"
        sculptureId={sculptureId}
        field="ai_generated_name"
        className="text-2xl font-bold"
        hideControls
        isEditing={isNameEditing}
        onEditingChange={setIsNameEditing}
      />
    </div>
  );
}
