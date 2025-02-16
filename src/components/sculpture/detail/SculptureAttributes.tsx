
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { LinkIcon, TagIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Sculpture } from "@/types/sculpture";
import { EditableField } from "./EditableField";
import { FileUploadField } from "../FileUploadField";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SculptureAttributesProps {
  sculpture: Sculpture;
  originalSculpture: Sculpture | null;
  tags: Array<{ id: string; name: string }>;
}

export function SculptureAttributes({ sculpture, originalSculpture, tags }: SculptureAttributesProps) {
  const navigate = useNavigate();

  const calculateCm = (inches: number): number => {
    return inches * 2.54;
  };

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

            <div className="flex justify-between py-2 border-b">
              <dt className="font-medium">Status</dt>
              <dd>
                <EditableField
                  value={sculpture.status}
                  type="select"
                  options={[
                    { value: "ideas", label: "Ideas" },
                    { value: "pending_additions", label: "Pending Additions" },
                    { value: "approved", label: "Approved" }
                  ]}
                  sculptureId={sculpture.id}
                  field="status"
                />
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

        {/* Dimensions Section */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Dimensions</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Inches</label>
              <div className="grid grid-cols-3 gap-2">
                <EditableField
                  value={sculpture.height_in?.toString() || ""}
                  type="number"
                  sculptureId={sculpture.id}
                  field="height_in"
                  label="Height"
                />
                <EditableField
                  value={sculpture.width_in?.toString() || ""}
                  type="number"
                  sculptureId={sculpture.id}
                  field="width_in"
                  label="Width"
                />
                <EditableField
                  value={sculpture.depth_in?.toString() || ""}
                  type="number"
                  sculptureId={sculpture.id}
                  field="depth_in"
                  label="Depth"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Centimeters</label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  value={sculpture.height_in ? calculateCm(sculpture.height_in).toFixed(2) : ""}
                  readOnly
                  disabled
                  placeholder="Height"
                />
                <Input
                  value={sculpture.width_in ? calculateCm(sculpture.width_in).toFixed(2) : ""}
                  readOnly
                  disabled
                  placeholder="Width"
                />
                <Input
                  value={sculpture.depth_in ? calculateCm(sculpture.depth_in).toFixed(2) : ""}
                  readOnly
                  disabled
                  placeholder="Depth"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Files Sections */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Files</h2>
          <div className="space-y-4">
            <FileUploadField
              label="Models"
              files={sculpture.models}
              onFilesChange={async (files) => {
                const { error } = await supabase
                  .from('sculptures')
                  .update({ models: files })
                  .eq('id', sculpture.id);
                
                if (error) {
                  console.error('Error updating models:', error);
                  return;
                }
              }}
            />

            <FileUploadField
              label="Renderings"
              files={sculpture.renderings}
              onFilesChange={async (files) => {
                const { error } = await supabase
                  .from('sculptures')
                  .update({ renderings: files })
                  .eq('id', sculpture.id);
                
                if (error) {
                  console.error('Error updating renderings:', error);
                  return;
                }
              }}
            />

            <FileUploadField
              label="Dimensions"
              files={sculpture.dimensions}
              onFilesChange={async (files) => {
                const { error } = await supabase
                  .from('sculptures')
                  .update({ dimensions: files })
                  .eq('id', sculpture.id);
                
                if (error) {
                  console.error('Error updating dimensions:', error);
                  return;
                }
              }}
            />
          </div>
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
