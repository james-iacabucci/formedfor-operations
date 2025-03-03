
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TaskRelatedType } from "@/types/task";
import { EntityOption } from "@/hooks/tasks/useTaskRelatedEntity";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface RelatedEntitySectionProps {
  relatedType: TaskRelatedType | string | null;
  entityId: string | null;
  categoryName?: string | null;
  onEntitySelection: (id: string) => void;
  onRelatedTypeChange: (type: string) => void;
  onCategoryChange?: (category: string) => void;
  sculptures: EntityOption[];
  sculpturesLoading: boolean;
  clients?: EntityOption[];
  clientsLoading?: boolean;
  leads?: EntityOption[];
  leadsLoading?: boolean;
  orders?: EntityOption[];
  ordersLoading?: boolean;
  categories?: string[];
}

export function RelatedEntitySection({
  relatedType,
  entityId,
  categoryName,
  onEntitySelection,
  onRelatedTypeChange,
  onCategoryChange,
  sculptures,
  sculpturesLoading,
  clients = [],
  clientsLoading = false,
  leads = [],
  leadsLoading = false,
  orders = [],
  ordersLoading = false,
  categories = []
}: RelatedEntitySectionProps) {
  const [newCategory, setNewCategory] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);

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

  const handleAddCategory = () => {
    if (newCategory.trim() && onCategoryChange) {
      onCategoryChange(newCategory.trim());
      setNewCategory("");
      setIsAddingCategory(false);
    }
  };

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
      
      {/* Category management for general type */}
      {relatedType === "general" && onCategoryChange && (
        <div className="mt-4">
          <Label htmlFor="category">Category</Label>
          {isAddingCategory ? (
            <div className="flex gap-2 mt-1">
              <Input 
                id="new-category" 
                placeholder="Enter new category..." 
                value={newCategory} 
                onChange={(e) => setNewCategory(e.target.value)}
                className="flex-1" 
              />
              <Button size="sm" onClick={handleAddCategory}>Add</Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setIsAddingCategory(false);
                  setNewCategory("");
                }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex gap-2 mt-1">
              <Select
                value={categoryName || ""}
                onValueChange={onCategoryChange}
              >
                <SelectTrigger id="category" className="bg-transparent text-base border border-input rounded-md flex-1">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.length === 0 ? (
                    <SelectItem value="">No categories available</SelectItem>
                  ) : (
                    categories.map((category, index) => (
                      <SelectItem key={index} value={category}>
                        {category}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Button 
                variant="outline"
                size="icon"
                onClick={() => setIsAddingCategory(true)}
                title="Add new category"
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
      
      {/* Sculpture selection when on sculpture tab */}
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
      
      {/* Client selection */}
      {relatedType === "client" && (
        <div className="mt-4">
          <Label htmlFor="client">Select Client</Label>
          <Select 
            value={entityId || "none"}
            onValueChange={onEntitySelection}
          >
            <SelectTrigger id="client" className="bg-transparent text-base border border-input rounded-md">
              <SelectValue placeholder="Select a client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {clientsLoading ? (
                <SelectItem value="loading-clients">Loading clients...</SelectItem>
              ) : clients.length === 0 ? (
                <SelectItem value="no-clients-available">No clients available</SelectItem>
              ) : (
                clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {/* Order selection */}
      {relatedType === "order" && (
        <div className="mt-4">
          <Label htmlFor="order">Select Order</Label>
          <Select 
            value={entityId || "none"}
            onValueChange={onEntitySelection}
          >
            <SelectTrigger id="order" className="bg-transparent text-base border border-input rounded-md">
              <SelectValue placeholder="Select an order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {ordersLoading ? (
                <SelectItem value="loading-orders">Loading orders...</SelectItem>
              ) : orders.length === 0 ? (
                <SelectItem value="no-orders-available">No orders available</SelectItem>
              ) : (
                orders.map((order) => (
                  <SelectItem key={order.id} value={order.id}>
                    {order.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {/* Lead selection */}
      {relatedType === "lead" && (
        <div className="mt-4">
          <Label htmlFor="lead">Select Lead</Label>
          <Select 
            value={entityId || "none"}
            onValueChange={onEntitySelection}
          >
            <SelectTrigger id="lead" className="bg-transparent text-base border border-input rounded-md">
              <SelectValue placeholder="Select a lead" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {leadsLoading ? (
                <SelectItem value="loading-leads">Loading leads...</SelectItem>
              ) : leads.length === 0 ? (
                <SelectItem value="no-leads-available">No leads available</SelectItem>
              ) : (
                leads.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id}>
                    {lead.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
