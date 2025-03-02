import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TaskRelatedType } from "@/types/task";
import { EntityOption } from "@/hooks/tasks/useTaskRelatedEntity";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductLine } from "@/types/product-line";

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
  const { data: productLines = [] } = useQuery({
    queryKey: ["product_lines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_lines")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as ProductLine[];
    },
  });

  return (
    <div className="space-y-2">
      <Label htmlFor="related-type">Relates To</Label>
      <Select
        value={relatedType || "none"}
        onValueChange={onRelatedTypeChange}
      >
        <SelectTrigger id="related-type">
          <SelectValue placeholder="Not associated with anything" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Not associated</SelectItem>
          
          {productLines.map((productLine) => (
            <SelectItem 
              key={`product_line_${productLine.id}`} 
              value={`product_line_${productLine.id}`}
            >
              {productLine.name} (Product Line)
            </SelectItem>
          ))}
          
          <SelectItem value="sculpture">Sculpture</SelectItem>
          <SelectItem value="client">Client</SelectItem>
          <SelectItem value="lead">Lead</SelectItem>
          <SelectItem value="order">Order</SelectItem>
        </SelectContent>
      </Select>
      
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
                <SelectItem value="loading-sculptures">Loading sculptures...</SelectItem>
              ) : sculptures.length === 0 ? (
                <SelectItem value="no-sculptures-available">No sculptures available</SelectItem>
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
      
      {relatedType?.startsWith("product_line_") && (
        <div className="space-y-2">
          <Label htmlFor="product-line">Product Line</Label>
          <Select defaultValue="selected">
            <SelectTrigger id="product-line">
              <SelectValue placeholder="Product Line selected" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="selected">
                {productLines.find(pl => `product_line_${pl.id}` === relatedType)?.name || "Selected Product Line"}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      {relatedType === "client" && (
        <div className="space-y-2">
          <Label htmlFor="client">Client</Label>
          <Select defaultValue="coming-soon">
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
          <Select defaultValue="coming-soon">
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
          <Select defaultValue="coming-soon">
            <SelectTrigger id="lead">
              <SelectValue placeholder="Lead functionality coming soon" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="coming-soon">Lead functionality coming soon</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
