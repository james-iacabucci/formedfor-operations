
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TaskRelatedType } from "@/types/task";
import { EntityOption } from "@/hooks/tasks/useTaskRelatedEntity";
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
  // Determine the current tab value based on relatedType
  const getCurrentTabValue = () => {
    if (!relatedType) return "general";
    if (relatedType === "sculpture") return "sculpture";
    if (relatedType === "client") return "client";
    if (relatedType === "lead") return "lead";
    if (relatedType === "order") return "order";
    
    return "general";
  };

  // Debug log to verify the value
  console.log("RelatedEntitySection - current relatedType:", relatedType);
  console.log("RelatedEntitySection - calculated tab value:", getCurrentTabValue());

  return (
    <div className="space-y-2">
      <Label htmlFor="related-type">Relates To</Label>
      
      <Tabs
        value={getCurrentTabValue()}
        onValueChange={onRelatedTypeChange}
        className="w-full"
      >
        <TabsList className="w-full grid grid-cols-5 bg-transparent rounded-md border border-input p-1">
          <TabsTrigger 
            value="general" 
            className="h-7 text-xs font-medium rounded-md data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
          >
            General
          </TabsTrigger>
          
          <TabsTrigger 
            value="sculpture" 
            className="h-7 text-xs font-medium rounded-md data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
          >
            Sculpture
          </TabsTrigger>
          
          <TabsTrigger 
            value="client" 
            className="h-7 text-xs font-medium rounded-md data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
          >
            Client
          </TabsTrigger>
          
          <TabsTrigger 
            value="lead" 
            className="h-7 text-xs font-medium rounded-md data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
          >
            Lead
          </TabsTrigger>
          
          <TabsTrigger 
            value="order" 
            className="h-7 text-xs font-medium rounded-md data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
          >
            Order
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Only show sculpture selection when on sculpture tab */}
      {relatedType === "sculpture" && (
        <div className="mt-4">
          <Label htmlFor="sculpture">Select Sculpture</Label>
          <Select
            value={entityId || "none"}
            onValueChange={onEntitySelection}
          >
            <SelectTrigger id="sculpture" className="bg-transparent text-base border border-input rounded-md">
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
      
      {/* Placeholder for client selection */}
      {relatedType === "client" && (
        <div className="mt-4">
          <Label htmlFor="client">Select Client</Label>
          <Select defaultValue="coming-soon">
            <SelectTrigger id="client" className="bg-transparent text-base border border-input rounded-md">
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
            <SelectTrigger id="order" className="bg-transparent text-base border border-input rounded-md">
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
            <SelectTrigger id="lead" className="bg-transparent text-base border border-input rounded-md">
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
