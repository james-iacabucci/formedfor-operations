
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TaskRelatedType } from "@/types/task";
import { EntityOption } from "@/hooks/tasks/useTaskRelatedEntity";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductLine } from "@/types/product-line";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  // Determine the current tab value based on relatedType
  const getCurrentTabValue = () => {
    if (!relatedType) return "none";
    if (relatedType === "sculpture") return "sculpture";
    if (relatedType === "client") return "client";
    if (relatedType === "lead") return "lead";
    if (relatedType === "order") return "order";
    
    // For product lines, extract the ID
    if (relatedType.startsWith("product_line_")) {
      return relatedType;
    }
    
    return "none";
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="related-type">Relates To</Label>
      
      <Tabs
        value={getCurrentTabValue()}
        onValueChange={onRelatedTypeChange}
        className="w-full"
      >
        <TabsList className="inline-flex h-auto bg-transparent p-1 rounded-full border border-[#333333] w-full flex-wrap">
          <TabsTrigger 
            value="none" 
            className="h-9 px-5 py-2 text-sm font-medium rounded-full text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
          >
            None
          </TabsTrigger>
          
          {productLines.map((productLine) => (
            <TabsTrigger 
              key={`product_line_${productLine.id}`} 
              value={`product_line_${productLine.id}`}
              className="h-9 px-5 py-2 text-sm font-medium rounded-full text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
            >
              {productLine.name}
            </TabsTrigger>
          ))}
          
          <TabsTrigger 
            value="sculpture" 
            className="h-9 px-5 py-2 text-sm font-medium rounded-full text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
          >
            Sculpture
          </TabsTrigger>
          
          <TabsTrigger 
            value="client" 
            className="h-9 px-5 py-2 text-sm font-medium rounded-full text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
          >
            Client
          </TabsTrigger>
          
          <TabsTrigger 
            value="lead" 
            className="h-9 px-5 py-2 text-sm font-medium rounded-full text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
          >
            Lead
          </TabsTrigger>
          
          <TabsTrigger 
            value="order" 
            className="h-9 px-5 py-2 text-sm font-medium rounded-full text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
          >
            Order
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Conditional dropdown for sculpture selection */}
      {relatedType === "sculpture" && (
        <div className="mt-4">
          <Label htmlFor="sculpture">Select Sculpture</Label>
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
      
      {/* For product lines - don't show an additional dropdown since the selection is made via tabs */}
      
      {/* Placeholder for client selection */}
      {relatedType === "client" && (
        <div className="mt-4">
          <Label htmlFor="client">Select Client</Label>
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
      
      {/* Placeholder for order selection */}
      {relatedType === "order" && (
        <div className="mt-4">
          <Label htmlFor="order">Select Order</Label>
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
      
      {/* Placeholder for lead selection */}
      {relatedType === "lead" && (
        <div className="mt-4">
          <Label htmlFor="lead">Select Lead</Label>
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
