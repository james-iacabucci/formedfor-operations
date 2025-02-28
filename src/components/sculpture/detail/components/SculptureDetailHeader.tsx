
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, RefreshCw } from "lucide-react";
import { SculptureHeader } from "../SculptureHeader";
import { Sculpture } from "@/types/sculpture";
import { useState, useRef } from "react";
import { EditableField, EditableFieldRef } from "../EditableField";
import { useAIGeneration } from "@/hooks/use-ai-generation";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SculptureDetailHeaderProps {
  sculpture: Sculpture;
  onNameChanged?: (newName: string) => void;
}

export function SculptureDetailHeader({ sculpture, onNameChanged }: SculptureDetailHeaderProps) {
  const { generateAIContent, isGeneratingName } = useAIGeneration();
  const [isNameEditing, setIsNameEditing] = useState(false);
  const editableFieldRef = useRef<EditableFieldRef>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleRegenerateName = async () => {
    if (!sculpture.image_url) return;
    
    try {
      const response = await fetch(sculpture.image_url);
      const blob = await response.blob();
      const file = new File([blob], "sculpture.png", { type: "image/png" });
      
      generateAIContent(
        "name",
        file,
        sculpture.ai_generated_name || "",
        async (newName: string) => {
          // Check if the name is already used
          const { data: existingNames } = await supabase
            .from("sculptures")
            .select("ai_generated_name")
            .eq("ai_generated_name", newName)
            .neq("id", sculpture.id);
          
          if (existingNames && existingNames.length > 0) {
            // Name is already taken, add a unique identifier
            newName = `${newName} ${Math.floor(Math.random() * 999) + 1}`;
          }
          
          const { error } = await supabase
            .from("sculptures")
            .update({ ai_generated_name: newName })
            .eq("id", sculpture.id);
          
          if (error) throw error;
          
          await queryClient.invalidateQueries({ queryKey: ["sculpture", sculpture.id] });
          
          toast({
            title: "Success",
            description: "Name regenerated successfully.",
          });
          
          // Call the onNameChanged callback to trigger description update
          if (onNameChanged) {
            onNameChanged(newName);
          }
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
    if (savedValue && onNameChanged) {
      onNameChanged(savedValue);
    }
  };

  return (
    <div className="sticky top-0 bg-background z-10 pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button
              variant="outline"
              size="icon"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="relative group">
            {isNameEditing ? (
              <div className="flex items-center gap-2">
                <EditableField
                  ref={editableFieldRef}
                  value={sculpture.ai_generated_name || "Untitled Sculpture"}
                  type="input"
                  sculptureId={sculpture.id}
                  field="ai_generated_name"
                  className="text-2xl font-bold min-w-[200px]"
                  hideControls
                  isEditing={isNameEditing}
                  onEditingChange={setIsNameEditing}
                  onSaved={onNameChanged}
                />
                <Button 
                  onClick={handleSaveName}
                  size="sm"
                  variant="outline"
                  className="ml-2"
                >
                  Save
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setIsNameEditing(false)}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">
                  {sculpture.ai_generated_name || "Untitled Sculpture"}
                </div>
                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRegenerateName}
                    disabled={isGeneratingName}
                    className="h-8 w-8"
                  >
                    <RefreshCw className={`h-4 w-4 ${isGeneratingName ? "animate-spin" : ""}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsNameEditing(true)}
                    className="h-8 w-8"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        <SculptureHeader sculpture={sculpture} />
      </div>
    </div>
  );
}
