
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
    if (currentPath.includes("/dashboard")) return "dashboard";
    if (currentPath.includes("/leads")) return "leads";
    if (currentPath.includes("/clients")) return "clients";
    if (currentPath.includes("/orders")) return "orders";
    if (currentPath.includes("/tasks")) return "tasks";
    if (currentPath.includes("/installs")) return "installs";
    if (currentPath.includes("/messages")) return "messages";
    
    // Check if the path contains a product line id
    const productLineId = currentPath.split('/').pop();
    if (productLineId && productLines?.some(pl => pl.id === productLineId)) {
      return productLineId;
    }
    
    // Default to first product line if available, otherwise fallback to dashboard
    return productLines && productLines.length > 0 ? productLines[0].id : "dashboard";
  };

  const handleTabChange = (value: string) => {
    // Check if the value is a special tab
    if (value === "dashboard") {
      navigate("/dashboard");
      return;
    }
    if (value === "leads" || value === "clients" || value === "orders" || 
        value === "tasks" || value === "installs" || value === "messages") {
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
              <TabsList className="inline-flex h-auto bg-transparent p-1 rounded-full border border-[#333333]">
                <TabsTrigger 
                  value="dashboard" 
                  className="h-9 px-5 py-2 text-sm font-medium rounded-full text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
                >
                  Dashboard
                </TabsTrigger>
                {productLines?.map(pl => (
                  <TabsTrigger 
                    key={pl.id} 
                    value={pl.id}
                    className="h-9 px-5 py-2 text-sm font-medium rounded-full text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
                  >
                    {pl.name}
                  </TabsTrigger>
                ))}
                <TabsTrigger 
                  value="leads" 
                  className="h-9 px-5 py-2 text-sm font-medium rounded-full text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
                >
                  Leads
                </TabsTrigger>
                <TabsTrigger 
                  value="clients" 
                  className="h-9 px-5 py-2 text-sm font-medium rounded-full text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
                >
                  Clients
                </TabsTrigger>
                <TabsTrigger 
                  value="orders" 
                  className="h-9 px-5 py-2 text-sm font-medium rounded-full text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
                >
                  Orders
                </TabsTrigger>
                <TabsTrigger 
                  value="tasks" 
                  className="h-9 px-5 py-2 text-sm font-medium rounded-full text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
                >
                  Tasks
                </TabsTrigger>
                <TabsTrigger 
                  value="installs" 
                  className="h-9 px-5 py-2 text-sm font-medium rounded-full text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
                >
                  Installs
                </TabsTrigger>
                <TabsTrigger 
                  value="messages" 
                  className="h-9 px-5 py-2 text-sm font-medium rounded-full text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
                >
                  Messages
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
