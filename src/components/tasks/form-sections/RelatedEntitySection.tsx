
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskRelatedType } from "@/types/task";
import { Sculpture } from "@/types/sculpture";

interface RelatedEntitySectionProps {
  relatedType: TaskRelatedType | string | null;
  entityId: string | null;
  sculptures: Sculpture[] | null;
  sculpturesLoading: boolean;
  onRelatedTypeChange: (value: string) => void;
  onEntitySelection: (entityId: string) => void;
}

export function RelatedEntitySection({
  relatedType,
  entityId,
  sculptures,
  sculpturesLoading,
  onRelatedTypeChange,
  onEntitySelection,
}: RelatedEntitySectionProps) {
  return (
    <div className="space-y-4">
      <Tabs 
        value={relatedType || "general"} 
        onValueChange={onRelatedTypeChange}
        className="w-full"
      >
        <TabsList className="w-full rounded-md h-auto p-0.5 grid grid-cols-5">
          <TabsTrigger 
            value="general" 
            className="h-7 px-3 py-1 text-xs"
          >
            General
          </TabsTrigger>
          <TabsTrigger 
            value="sculpture" 
            className="h-7 px-3 py-1 text-xs"
          >
            Sculpture
          </TabsTrigger>
          <TabsTrigger 
            value="client" 
            className="h-7 px-3 py-1 text-xs"
          >
            Client
          </TabsTrigger>
          <TabsTrigger 
            value="lead" 
            className="h-7 px-3 py-1 text-xs"
          >
            Lead
          </TabsTrigger>
          <TabsTrigger 
            value="order" 
            className="h-7 px-3 py-1 text-xs"
          >
            Order
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="pt-4">
          <div className="text-sm text-muted-foreground">
            This task is not associated with any specific entity.
          </div>
        </TabsContent>
        
        <TabsContent value="sculpture" className="pt-4">
          <div className="space-y-2">
            <div className="border rounded-md py-0 px-3">
              <Select 
                value={entityId || ""} 
                onValueChange={onEntitySelection}
              >
                <SelectTrigger className="border-0 px-0 h-10 focus:ring-0">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Sculpture:</span>
                    <SelectValue placeholder="Select a sculpture" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {sculpturesLoading ? (
                    <div className="p-2">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-5 w-full mt-2" />
                      <Skeleton className="h-5 w-full mt-2" />
                    </div>
                  ) : sculptures && sculptures.length > 0 ? (
                    sculptures.map((sculpture) => (
                      <SelectItem key={sculpture.id} value={sculpture.id}>
                        {sculpture.ai_generated_name || `Sculpture ${sculpture.id.substring(0, 8)}`}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-muted-foreground text-sm">No sculptures found</div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="client" className="pt-4">
          <div className="text-sm text-muted-foreground">
            Client selection will be implemented soon.
          </div>
        </TabsContent>
        
        <TabsContent value="lead" className="pt-4">
          <div className="text-sm text-muted-foreground">
            Lead selection will be implemented soon.
          </div>
        </TabsContent>
        
        <TabsContent value="order" className="pt-4">
          <div className="text-sm text-muted-foreground">
            Order selection will be implemented soon.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
