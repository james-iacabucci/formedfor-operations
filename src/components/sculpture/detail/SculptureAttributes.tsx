
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { LinkIcon, TagIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Sculpture } from "@/types/sculpture";
import { SculptureHeader } from "./SculptureHeader";
import { SculpturePrompt } from "./SculpturePrompt";
import { SculptureStatus } from "./SculptureStatus";
import { SculptureDimensions } from "./SculptureDimensions";
import { SculptureFiles } from "./SculptureFiles";
import { SculptureMaterialFinish } from "./SculptureMaterialFinish";

interface SculptureAttributesProps {
  sculpture: Sculpture;
  originalSculpture: Sculpture | null;
  tags: Array<{ id: string; name: string }>;
}

export function SculptureAttributes({ sculpture, originalSculpture, tags }: SculptureAttributesProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <SculptureHeader sculpture={sculpture} />

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Sculpture Details</h2>
          <div className="space-y-6 pl-4">
            <div>
              <SculptureMaterialFinish
                sculptureId={sculpture.id}
                materialId={sculpture.material_id}
              />
            </div>

            <SculptureDimensions
              sculptureId={sculpture.id}
              height={sculpture.height_in}
              width={sculpture.width_in}
              depth={sculpture.depth_in}
            />

            <div>
              <h3 className="text-sm font-medium mb-2">Weight</h3>
              <p className="text-sm text-muted-foreground">Not specified</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Base Details</h2>
          <div className="space-y-6 pl-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Material</h3>
              <p className="text-sm text-muted-foreground">Not specified</p>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Dimensions</h3>
              <p className="text-sm text-muted-foreground">Not specified</p>
            </div>
          </div>
        </div>

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

        {tags && tags.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  <TagIcon className="w-3 h-3" />
                  <span>{tag.name}</span>
                </Badge>
              ))}
            </div>
          </div>
        )}

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
