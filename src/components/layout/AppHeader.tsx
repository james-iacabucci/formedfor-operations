
import { UserMenu } from "@/components/UserMenu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductLine } from "@/types/product-line";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/AuthProvider";

export function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const { user } = useAuth();

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

  // Log user state to debug
  console.log('App header rendered, user state:', user ? 'logged in' : 'not logged in');

  // Determine active tab based on current path
  const getActiveTab = () => {
    if (currentPath.includes("/clients")) return "clients";
    if (currentPath.includes("/leads")) return "leads";
    if (currentPath.includes("/orders")) return "orders";
    if (currentPath.includes("/chats")) return "chats";
    if (currentPath.includes("/tasks")) return "tasks";
    
    // Check if the path contains a product line id
    const productLineId = currentPath.split('/').pop();
    if (productLineId && productLines?.some(pl => pl.id === productLineId)) {
      return productLineId;
    }
    
    // Default to first product line if available, otherwise fallback to clients
    return productLines && productLines.length > 0 ? productLines[0].id : "clients";
  };

  const handleTabChange = (value: string) => {
    // Check if the value is a special tab
    if (value === "clients" || value === "leads" || value === "orders" || 
        value === "chats" || value === "tasks") {
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
              className="w-auto" 
              onValueChange={handleTabChange}
              value={getActiveTab()}
            >
              <TabsList className="inline-flex h-auto bg-transparent p-1 rounded-md border border-[#333333]">
                {productLines?.map(pl => (
                  <TabsTrigger 
                    key={pl.id} 
                    value={pl.id}
                    className="h-9 px-5 py-2 text-sm font-medium rounded-md text-foreground dark:text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
                  >
                    {pl.name}
                  </TabsTrigger>
                ))}
                <TabsTrigger 
                  value="clients" 
                  className="h-9 px-5 py-2 text-sm font-medium rounded-md text-foreground dark:text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
                >
                  Clients
                </TabsTrigger>
                <TabsTrigger 
                  value="leads" 
                  className="h-9 px-5 py-2 text-sm font-medium rounded-md text-foreground dark:text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
                >
                  Leads
                </TabsTrigger>
                <TabsTrigger 
                  value="orders" 
                  className="h-9 px-5 py-2 text-sm font-medium rounded-md text-foreground dark:text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
                >
                  Orders
                </TabsTrigger>
                <TabsTrigger 
                  value="chats" 
                  className="h-9 px-5 py-2 text-sm font-medium rounded-md text-foreground dark:text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
                >
                  Chats
                </TabsTrigger>
                <TabsTrigger 
                  value="tasks" 
                  className="h-9 px-5 py-2 text-sm font-medium rounded-md text-foreground dark:text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
                >
                  Tasks
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="flex items-center gap-4">
            {user && <UserMenu />}
          </div>
        </div>
      </div>
    </div>
  );
}
