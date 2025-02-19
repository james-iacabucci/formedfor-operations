
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
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

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
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");
      setUser(user);
    };
    getUser();
  }, []);

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

  if (!user) return null; // Wait for user data to be loaded

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
            userId={user.id}
            onRegenerate={handleRegenerate}
          />
          <SculpturePrompt sculpture={sculpture} />
          <SculptureMethod sculpture={sculpture} />
          <SculptureAttributes 
            sculpture={sculpture} 
            originalSculpture={originalSculpture}
            tags={tags}
          />
          <SculptureFiles 
            sculptureId={sculpture.id} 
            models={sculpture.models || []}
            renderings={sculpture.renderings || []}
            dimensions={sculpture.dimensions || []}
          />
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
