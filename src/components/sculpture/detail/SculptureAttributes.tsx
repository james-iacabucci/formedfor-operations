
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { LinkIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Sculpture } from "@/types/sculpture";
import { SculptureHeader } from "./SculptureHeader";
import { SculpturePrompt } from "./SculpturePrompt";
import { SculptureStatus } from "./SculptureStatus";
import { SculptureDimensions } from "./SculptureDimensions";
import { SculptureFiles } from "./SculptureFiles";
import { SculptureMaterialFinish } from "./SculptureMaterialFinish";
import { SculptureMethod } from "./SculptureMethod";
import { SculptureWeight } from "./SculptureWeight";
import { SculpturePDF } from "./SculpturePDF";
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
      <div className="flex justify-between items-start">
        <SculptureHeader sculpture={sculpture} />
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Sculpture Details</h2>
          <div className="space-y-6">
            <div>
              <SculptureMaterialFinish
                sculptureId={sculpture.id}
                materialId={sculpture.material_id}
              />
            </div>

            <SculptureMethod
              sculptureId={sculpture.id}
              methodId={sculpture.method_id}
            />

            <SculptureDimensions
              sculptureId={sculpture.id}
              height={sculpture.height_in}
              width={sculpture.width_in}
              depth={sculpture.depth_in}
            />

            <SculptureWeight
              sculptureId={sculpture.id}
              weightKg={sculpture.weight_kg}
              weightLbs={sculpture.weight_lbs}
            />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Base Details</h2>
          <div className="space-y-6">
            <div>
              <SculptureMaterialFinish
                sculptureId={sculpture.id}
                materialId={sculpture.base_material_id}
                isBase={true}
              />
            </div>

            <SculptureMethod
              sculptureId={sculpture.id}
              methodId={sculpture.base_method_id}
              isBase={true}
            />

            <SculptureDimensions
              sculptureId={sculpture.id}
              height={sculpture.base_height_in}
              width={sculpture.base_width_in}
              depth={sculpture.base_depth_in}
              isBase={true}
            />

            <SculptureWeight
              sculptureId={sculpture.id}
              weightKg={sculpture.base_weight_kg}
              weightLbs={sculpture.base_weight_lbs}
              isBase={true}
            />
          </div>
        </div>

        <SculptureFabricationQuotes sculptureId={sculpture.id} />

        <div>
          <h2 className="text-lg font-semibold mb-2">AI Generation</h2>
          <SculpturePrompt prompt={sculpture.prompt} />
          <dl className="grid grid-cols-1 gap-2 text-sm mt-4">
            {sculpture.creativity_level && (
              <div className="flex justify-between py-2 border-b">
                <dt className="font-medium">Variation Type</dt>
                <dd className="text-muted-foreground capitalize">
                  {sculpture.creativity_level}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <SculptureFiles
          sculptureId={sculpture.id}
          models={sculpture.models}
          renderings={sculpture.renderings}
          dimensions={sculpture.dimensions}
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
