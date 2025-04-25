
import { Button } from "@/components/ui/button";
import { LinkIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Sculpture } from "@/types/sculpture";
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
        {/* Sculpture Variants and Fabrication Quotes */}
        <SculptureFabricationQuotes 
          sculptureId={sculpture.id} 
          sculpture={sculpture} 
        />
        
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
          </dl>
        </div>
      </div>
    </div>
  );
}
