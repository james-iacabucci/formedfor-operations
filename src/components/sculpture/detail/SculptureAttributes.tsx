
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

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Details</h2>
          <dl className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex justify-between py-2 border-b">
              <dt className="font-medium">Created</dt>
              <dd className="text-muted-foreground">
                {format(new Date(sculpture.created_at), "PPP")}
              </dd>
            </div>

            {originalSculpture && (
              <div className="flex justify-between py-2 border-b">
                <dt className="font-medium">Original Sculpture</dt>
                <dd>
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

        <SculptureMaterialFinish
          sculptureId={sculpture.id}
          materialId={sculpture.material_id}
        />

        <SculptureDimensions
          sculptureId={sculpture.id}
          height={sculpture.height_in}
          width={sculpture.width_in}
          depth={sculpture.depth_in}
        />

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
      </div>
    </div>
  );
}
