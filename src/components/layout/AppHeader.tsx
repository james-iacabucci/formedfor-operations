
import { UserMenu } from "@/components/UserMenu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductLine } from "@/types/product-line";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // Fetch product lines
  const { data: productLines } = useQuery({
    queryKey: ["product_lines_for_header"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_lines")
        .select("*")
        .order('name', { ascending: true });

      if (error) throw error;
      return data as ProductLine[];
    },
  });

  // Determine active tab based on current path
  const getActiveTab = () => {
    if (currentPath.includes("/leads")) return "leads";
    if (currentPath.includes("/orders")) return "orders";
    if (currentPath.includes("/messages")) return "messages";
    
    // Check if the path contains a product line id
    const productLineId = currentPath.split('/').pop();
    if (productLineId && productLines?.some(pl => pl.id === productLineId)) {
      return productLineId;
    }
    
    // Default to first product line if available, otherwise fallback to home
    return productLines && productLines.length > 0 ? productLines[0].id : "home";
  };

  const handleTabChange = (value: string) => {
    // Check if the value is a special tab
    if (value === "leads" || value === "orders" || value === "messages") {
      navigate(`/${value}`);
      return;
    }
    
    // Otherwise, it's a product line ID - navigate to dashboard with product line filter
    navigate(`/productline/${value}`);
  };

  return (
    <div className="sticky top-0 z-10 bg-background border-b">
      <div className="mx-auto max-w-7xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Tabs 
              defaultValue={getActiveTab()} 
              className="w-full" 
              onValueChange={handleTabChange}
              value={getActiveTab()}
            >
              <TabsList className="inline-flex h-auto bg-muted p-0.5 rounded-md">
                {productLines?.map(pl => (
                  <TabsTrigger 
                    key={pl.id} 
                    value={pl.id}
                    className={cn(
                      "h-7 px-2 py-0.5 text-xs uppercase font-medium rounded-sm",
                      "data-[state=active]:bg-white data-[state=active]:text-black dark:data-[state=active]:bg-black dark:data-[state=active]:text-white"
                    )}
                  >
                    {pl.name.toUpperCase()}
                  </TabsTrigger>
                ))}
                <TabsTrigger 
                  value="leads" 
                  className={cn(
                    "h-7 px-2 py-0.5 text-xs uppercase font-medium rounded-sm",
                    "data-[state=active]:bg-white data-[state=active]:text-black dark:data-[state=active]:bg-black dark:data-[state=active]:text-white"
                  )}
                >
                  LEADS
                </TabsTrigger>
                <TabsTrigger 
                  value="orders" 
                  className={cn(
                    "h-7 px-2 py-0.5 text-xs uppercase font-medium rounded-sm",
                    "data-[state=active]:bg-white data-[state=active]:text-black dark:data-[state=active]:bg-black dark:data-[state=active]:text-white"
                  )}
                >
                  ORDERS
                </TabsTrigger>
                <TabsTrigger 
                  value="messages" 
                  className={cn(
                    "h-7 px-2 py-0.5 text-xs uppercase font-medium rounded-sm",
                    "data-[state=active]:bg-white data-[state=active]:text-black dark:data-[state=active]:bg-black dark:data-[state=active]:text-white"
                  )}
                >
                  MESSAGES
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="flex items-center gap-4">
            <UserMenu />
          </div>
        </div>
      </div>
    </div>
  );
}
