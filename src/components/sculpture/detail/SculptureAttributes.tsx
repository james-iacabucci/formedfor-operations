import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { LinkIcon, TagIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Sculpture } from "@/types/sculpture";
import { EditableField } from "./EditableField";

interface SculptureAttributesProps {
  sculpture: Sculpture;
  originalSculpture: Sculpture | null;
  tags: Array<{ id: string; name: string }>;
}

export function SculptureAttributes({ sculpture, originalSculpture, tags }: SculptureAttributesProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Title Section */}
      <div>
        <EditableField
          value={sculpture.ai_generated_name || "Untitled Sculpture"}
          type="input"
          sculptureId={sculpture.id}
          field="ai_generated_name"
          className="text-4xl font-bold tracking-tight"
        />
      </div>

      {/* Description Section */}
      <div>
        <EditableField
          value={sculpture.ai_description || "Sculpture description not defined"}
          type="textarea"
          sculptureId={sculpture.id}
          field="ai_description"
          className="text-muted-foreground italic"
        />
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">AI Prompt</h2>
          <p className="text-muted-foreground">{sculpture.prompt}</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Details</h2>
          <dl className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex justify-between py-2 border-b">
              <dt className="font-medium">Created</dt>
              <dd className="text-muted-foreground">
                {format(new Date(sculpture.created_at), "PPP")}
              </dd>
            </div>

            {sculpture.creativity_level && (
              <div className="flex justify-between py-2 border-b">
                <dt className="font-medium">Variation Type</dt>
                <dd className="text-muted-foreground capitalize">
                  {sculpture.creativity_level}
                </dd>
              </div>
            )}

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
