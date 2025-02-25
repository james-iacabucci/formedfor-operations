
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckIcon, Pencil, RefreshCw, XIcon } from "lucide-react";
import { EditableField, EditableFieldRef } from "../EditableField";
import { useAIGeneration } from "@/hooks/use-ai-generation";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SculptureDescriptionProps {
  sculptureId: string;
  imageUrl: string | null;
  description: string | null;
  name: string | null;
}

export function SculptureDescription({ sculptureId, imageUrl, description, name }: SculptureDescriptionProps) {
  const { generateAIContent, isGeneratingDescription } = useAIGeneration();
  const [isDescriptionEditing, setIsDescriptionEditing] = useState(false);
  const editableFieldRef = useRef<EditableFieldRef>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleRegenerateDescription = async () => {
    if (!imageUrl) return;
    
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], "sculpture.png", { type: "image/png" });
      
      generateAIContent(
        "description",
        file,
        name || "",
        async (newDescription: string) => {
          const { error } = await supabase
            .from("sculptures")
            .update({ ai_description: newDescription })
            .eq("id", sculptureId);
          
          if (error) throw error;
          
          await queryClient.invalidateQueries({ queryKey: ["sculpture", sculptureId] });
          toast({
            title: "Success",
            description: "Description regenerated successfully.",
          });
        }
      );
    } catch (error) {
      console.error("Error regenerating description:", error);
      toast({
        title: "Error",
        description: "Failed to regenerate description. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveDescription = async () => {
    await editableFieldRef.current?.save();
  };

  return (
    <div className="group space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Description</h3>
        {isDescriptionEditing ? (
          <div className="flex gap-2">
            <Button 
              onClick={handleSaveDescription}
              size="sm"
              variant="secondary"
            >
              <CheckIcon className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setIsDescriptionEditing(false)}
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
              onClick={handleRegenerateDescription}
              disabled={isGeneratingDescription}
              className={isGeneratingDescription ? "opacity-100" : "opacity-0 group-hover:opacity-100 transition-opacity"}
            >
              <RefreshCw className={`h-4 w-4 ${isGeneratingDescription ? "animate-spin" : ""}`} />
            </Button>
            {!isGeneratingDescription && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDescriptionEditing(true)}
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
        value={description || "No description available"}
        type="textarea"
        sculptureId={sculptureId}
        field="ai_description"
        className="text-muted-foreground"
        hideControls
        isEditing={isDescriptionEditing}
        onEditingChange={setIsDescriptionEditing}
      />
    </div>
  );
}
