
import { Sculpture } from "@/types/sculpture";
import { SculptureHeader } from "./SculptureHeader";
import { SculptureAttributes } from "./SculptureAttributes";
import { SculptureMethod } from "./SculptureMethod";
import { SculptureVariations } from "./SculptureVariations";
import { SculptureFiles } from "./SculptureFiles";
import { SculpturePDF } from "./SculpturePDF";
import { SculpturePrompt } from "./SculpturePrompt";
import { SculptureDetailImage } from "./SculptureDetailImage";
import { SculptureFabricationQuotes } from "./SculptureFabricationQuotes";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SculptureDetailContentProps {
  sculpture: Sculpture;
  originalSculpture?: Sculpture | null;
  tags: { id: string; name: string }[];
}

export function SculptureDetailContent({ 
  sculpture, 
  originalSculpture,
  tags
}: SculptureDetailContentProps) {
  const queryClient = useQueryClient();
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const { error } = await supabase.functions.invoke('regenerate-image', {
        body: { sculptureId: sculpture.id }
      });
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["sculpture", sculpture.id] });
    } catch (error) {
      console.error('Error regenerating:', error);
    } finally {
      setIsRegenerating(false);
    }
  };

  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("No user found");

  return (
    <div className="grid gap-6">
      <SculptureHeader 
        sculpture={sculpture}
        onRegenerate={handleRegenerate}
        isRegenerating={isRegenerating}
      />
      
      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <SculptureDetailImage
            imageUrl={sculpture.image_url}
            prompt={sculpture.prompt}
            isRegenerating={isRegenerating}
            sculptureId={sculpture.id}
            userId={user.user.id}
            onRegenerate={handleRegenerate}
          />
          <SculpturePrompt sculpture={sculpture} />
          <SculptureMethod sculpture={sculpture} />
          <SculptureAttributes sculpture={sculpture} />
          <SculptureFiles sculpture={sculpture} />
          <SculpturePDF sculpture={sculpture} />
          <SculptureVariations 
            sculpture={sculpture} 
            originalSculpture={originalSculpture}
          />
          <SculptureFabricationQuotes sculpture={sculpture} />
        </div>
      </div>
    </div>
  );
}
