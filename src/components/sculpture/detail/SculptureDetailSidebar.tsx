
import { Sculpture } from "@/types/sculpture";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag } from "@/components/settings/useTagsState";

interface SculptureDetailSidebarProps {
  sculpture: Sculpture;
  originalSculpture?: Sculpture;
  tags: any[];
  onUpdate: () => void;
}

export function SculptureDetailSidebar({ sculpture, originalSculpture, tags, onUpdate }: SculptureDetailSidebarProps) {
  // This is a temporary component to fix the TypeScript error
  // The actual implementation will be added later
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium text-muted-foreground">Status:</span> {sculpture.status}
            </div>
            <div className="text-sm">
              <span className="font-medium text-muted-foreground">Created:</span>{" "}
              {new Date(sculpture.created_at).toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
