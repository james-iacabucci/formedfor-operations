
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { LinkIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Sculpture } from "@/types/sculpture";
import { SculpturePrompt } from "./SculpturePrompt";
import { SculptureFiles } from "./SculptureFiles";
import { SculptureFabricationQuotes } from "./SculptureFabricationQuotes";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SculptureAttributesProps {
  sculpture: Sculpture;
  originalSculpture: Sculpture | null;
  tags: Array<{ id: string; name: string }>;
}

export function SculptureAttributes({ sculpture, originalSculpture, tags }: SculptureAttributesProps) {
  const navigate = useNavigate();

  const { data: material } = useQuery({
    queryKey: ["material", sculpture.material_id],
    enabled: !!sculpture.material_id,
    queryFn: async () => {
      const { data } = await supabase
        .from("value_lists")
        .select("name")
        .eq("id", sculpture.material_id)
        .single();
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {/* Fabrication Quotes section now includes sculpture and base details */}
        <SculptureFabricationQuotes 
          sculptureId={sculpture.id} 
          sculpture={sculpture} 
        />
        
        <div>
          <h2 className="text-lg font-semibold mb-2">AI Settings</h2>
          <SculpturePrompt prompt={sculpture.prompt} />
          <dl className="grid grid-cols-1 gap-2 text-sm mt-4">
            {sculpture.creativity_level && (
              <div className="flex justify-between py-2 border-b">
                <dt className="font-medium">Variation Creativity</dt>
                <dd className="text-muted-foreground capitalize">
                  {sculpture.creativity_level}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <div className="space-y-4">
          <dl className="grid grid-cols-1 gap-2 text-sm">
            {originalSculpture && (
              <div className="flex py-2 border-b">
                <dt className="font-medium">Original Sculpture</dt>
                <dd className="ml-4">
                  <Button
                    variant="link"
                    className="h-auto p-0"
                    onClick={() => navigate(`/sculpture/${originalSculpture.id}`)}
                  >
                    <LinkIcon className="w-4 h-4 mr-1" />
                    View Original
                  </Button>
                </dd>
              </div>
            )}
            
            <div className="flex py-2 border-b">
              <dt className="font-medium">Created</dt>
              <dd className="ml-4 text-muted-foreground">
                {format(new Date(sculpture.created_at), "PPP")}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
