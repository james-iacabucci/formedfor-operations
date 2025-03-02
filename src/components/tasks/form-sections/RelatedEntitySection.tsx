
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TaskRelatedType } from "@/types/task";
import { EntityOption } from "@/hooks/tasks/useTaskRelatedEntity";

interface RelatedEntitySectionProps {
  relatedType: TaskRelatedType | null;
  entityId: string | null;
  onEntitySelection: (id: string) => void;
  onRelatedTypeChange: (type: string) => void;
  sculptures: EntityOption[];
  sculpturesLoading: boolean;
}

export function RelatedEntitySection({
  relatedType,
  entityId,
  onEntitySelection,
  onRelatedTypeChange,
  sculptures,
  sculpturesLoading
}: RelatedEntitySectionProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="related-type">Task Related To</Label>
        <Select
          value={relatedType || "none"}
          onValueChange={onRelatedTypeChange}
        >
          <SelectTrigger id="related-type">
            <SelectValue placeholder="Not associated with anything" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Not associated</SelectItem>
            <SelectItem value="sculpture">Sculpture</SelectItem>
            <SelectItem value="client">Client</SelectItem>
            <SelectItem value="order">Order</SelectItem>
            <SelectItem value="lead">Lead</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {relatedType === "sculpture" && (
        <div className="space-y-2">
          <Label htmlFor="sculpture">Sculpture</Label>
          <Select
            value={entityId || "none"}
            onValueChange={onEntitySelection}
          >
            <SelectTrigger id="sculpture">
              <SelectValue placeholder="Select a sculpture" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {sculpturesLoading ? (
                <SelectItem value="loading">Loading sculptures...</SelectItem>
              ) : sculptures.length === 0 ? (
                <SelectItem value="no-sculptures">No sculptures available</SelectItem>
              ) : (
                sculptures.map((sculpture) => (
                  <SelectItem key={sculpture.id} value={sculpture.id}>
                    {sculpture.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {relatedType === "client" && (
        <div className="space-y-2">
          <Label htmlFor="client">Client</Label>
          <Select disabled value="coming-soon">
            <SelectTrigger id="client">
              <SelectValue placeholder="Client functionality coming soon" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="coming-soon">Client functionality coming soon</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      {relatedType === "order" && (
        <div className="space-y-2">
          <Label htmlFor="order">Order</Label>
          <Select disabled value="coming-soon">
            <SelectTrigger id="order">
              <SelectValue placeholder="Order functionality coming soon" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="coming-soon">Order functionality coming soon</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      {relatedType === "lead" && (
        <div className="space-y-2">
          <Label htmlFor="lead">Lead</Label>
          <Select disabled value="coming-soon">
            <SelectTrigger id="lead">
              <SelectValue placeholder="Lead functionality coming soon" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="coming-soon">Lead functionality coming soon</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </>
  );
}
