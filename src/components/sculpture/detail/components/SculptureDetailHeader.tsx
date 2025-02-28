
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, RefreshCw, CheckIcon, XIcon } from "lucide-react";
import { SculptureHeader } from "../SculptureHeader";
import { Sculpture } from "@/types/sculpture";
import { useState, useRef } from "react";
import { useAIGeneration } from "@/hooks/use-ai-generation";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SculptureDetailHeaderProps {
  sculpture: Sculpture;
}

export function SculptureDetailHeader({ sculpture }: SculptureDetailHeaderProps) {
  const { generateAIContent, isGeneratingName } = useAIGeneration();
  const [isNameEditing, setIsNameEditing] = useState(false);
  const [editedName, setEditedName] = useState(sculpture.ai_generated_name || "Untitled Sculpture");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleRegenerateName = async () => {
    if (!sculpture.image_url) {
      toast({
        title: "Error",
        description: "No image available for AI name generation",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const response = await fetch(sculpture.image_url);
      const blob = await response.blob();
      const file = new File([blob], "sculpture.png", { type: "image/png" });
      
      generateAIContent(
        "name",
        file,
        "",
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
          
          // Limit to two words maximum
          const words = newName.split(" ");
          if (words.length > 2) {
            newName = `${words[0]} ${words[1]}`;
          }
          
          const { error } = await supabase
            .from("sculptures")
            .update({ ai_generated_name: newName })
            .eq("id", sculpture.id);
          
          if (error) throw error;
          
          // Update description to use new name
          await regenerateDescription(newName);
          
          await queryClient.invalidateQueries({ queryKey: ["sculpture", sculpture.id] });
          
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

  const regenerateDescription = async (name: string) => {
    if (!sculpture.image_url) return;
    
    try {
      // Make AI request to generate description
      const { data, error } = await supabase.functions.invoke('generate-sculpture-metadata', {
        body: { 
          imageUrl: sculpture.image_url, 
          type: "description",
          existingName: name
        }
      });
      
      if (error) throw error;
      
      // Clean and format description
      const description = `${name.toUpperCase()} ${data.description}`;
      
      // Update sculpture description
      const { error: updateError } = await supabase
        .from("sculptures")
        .update({ ai_description: description })
        .eq("id", sculpture.id);
      
      if (updateError) throw updateError;
      
      await queryClient.invalidateQueries({ queryKey: ["sculpture", sculpture.id] });
      
      toast({
        title: "Success",
        description: "Description updated to match new name.",
      });
    } catch (error) {
      console.error("Error regenerating description:", error);
      toast({
        title: "Error",
        description: "Failed to update description. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveName = async () => {
    try {
      if (!editedName.trim()) {
        toast({
          title: "Error",
          description: "Name cannot be empty",
          variant: "destructive",
        });
        return;
      }
      
      // Check if name is already used
      const { data: existingNames } = await supabase
        .from("sculptures")
        .select("ai_generated_name")
        .eq("ai_generated_name", editedName)
        .neq("id", sculpture.id);
      
      if (existingNames && existingNames.length > 0) {
        toast({
          title: "Error",
          description: "This name is already being used by another sculpture",
          variant: "destructive",
        });
        return;
      }
      
      // Limit to two words maximum
      const words = editedName.split(" ");
      const finalName = words.length > 2 ? `${words[0]} ${words[1]}` : editedName;
      
      const { error } = await supabase
        .from('sculptures')
        .update({ ai_generated_name: finalName })
        .eq('id', sculpture.id);

      if (error) throw error;
      
      // Update description to use new name
      await regenerateDescription(finalName);
      
      await queryClient.invalidateQueries({ queryKey: ["sculpture", sculpture.id] });
      
      toast({
        title: "Success",
        description: "Name updated successfully",
      });
      
      setIsNameEditing(false);
    } catch (error) {
      console.error('Error updating name:', error);
      toast({
        title: "Error",
        description: "Failed to update name. Please try again.",
        variant: "destructive",
      });
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
          <div className="group relative">
            {isNameEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="text-2xl font-bold px-3 py-2 h-auto"
                  autoFocus
                />
                <Button 
                  onClick={handleSaveName}
                  size="sm"
                  variant="ghost"
                >
                  <CheckIcon className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setIsNameEditing(false);
                    setEditedName(sculpture.ai_generated_name || "Untitled Sculpture");
                  }}
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center">
                <div className="text-2xl font-bold mr-2">
                  {sculpture.ai_generated_name || "Untitled Sculpture"}
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={handleRegenerateName}
                          disabled={isGeneratingName}
                        >
                          <RefreshCw className={`h-4 w-4 ${isGeneratingName ? "animate-spin" : ""}`} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Regenerate name</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setIsNameEditing(true)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit name</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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
