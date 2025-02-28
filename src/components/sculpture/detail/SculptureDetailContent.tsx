
import { SculptureDetailHeader } from "./components/SculptureDetailHeader";
import { SculptureMainContent } from "./components/SculptureMainContent";
import { SculptureDetailSidebar } from "./SculptureDetailSidebar";
import { SculptureFabricationQuotes } from "./SculptureFabricationQuotes";
import { useSculptureRegeneration } from "@/hooks/use-sculpture-regeneration";
import { Separator } from "@/components/ui/separator";
import { Sculpture } from "@/types/sculpture";
import { Tag } from "@/components/settings/useTagsState";
import { useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface SculptureDetailContentProps {
  sculpture: Sculpture;
  originalSculpture?: Sculpture;
  tags: Tag[];
  onUpdate: () => void;
}

export function SculptureDetailContent({ 
  sculpture, 
  originalSculpture, 
  tags,
  onUpdate
}: SculptureDetailContentProps) {
  const { handleRegenerate, isRegenerating } = useSculptureRegeneration(sculpture);
  const descriptionComponentRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const handleNameChanged = async (newName: string) => {
    console.log("Name changed to:", newName);
    
    // Trigger description regeneration
    if (sculpture.image_url) {
      try {
        const response = await fetch(sculpture.image_url);
        const blob = await response.blob();
        const file = new File([blob], "sculpture.png", { type: "image/png" });
        
        // Make AI request to generate description
        const { data, error } = await supabase.functions.invoke('generate-sculpture-metadata', {
          body: { 
            imageUrl: sculpture.image_url, 
            type: "description",
            existingName: newName
          }
        });
        
        if (error) throw error;
        
        // Clean and format description
        const description = `${newName.toUpperCase()} ${data.description}`;
        
        // Update sculpture description
        const { error: updateError } = await supabase
          .from("sculptures")
          .update({ ai_description: description })
          .eq("id", sculpture.id);
        
        if (updateError) throw updateError;
        
        // Invalidate queries to refresh data
        await queryClient.invalidateQueries({ queryKey: ["sculpture", sculpture.id] });
        
      } catch (error) {
        console.error("Error updating description after name change:", error);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="col-span-1 lg:col-span-2 space-y-8">
        <SculptureDetailHeader 
          sculpture={sculpture} 
          onNameChanged={handleNameChanged}
        />
        <SculptureMainContent
          sculpture={sculpture}
          isRegenerating={isRegenerating}
          onRegenerate={handleRegenerate}
          onNameChanged={handleNameChanged}
        />
      </div>
      <div className="col-span-1 space-y-8">
        <SculptureDetailSidebar
          sculpture={sculpture}
          originalSculpture={originalSculpture}
          tags={tags}
          onUpdate={onUpdate}
        />
        <Separator />
        <SculptureFabricationQuotes sculpture={sculpture} />
      </div>
    </div>
  );
}
