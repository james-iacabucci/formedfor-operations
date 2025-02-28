
import { UserMenu } from "@/components/UserMenu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useLocation } from "react-router-dom";

export function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // Determine active tab based on current path
  const getActiveTab = () => {
    if (currentPath.includes("/brodin")) return "brodin";
    if (currentPath.includes("/leads")) return "leads";
    if (currentPath.includes("/orders")) return "orders";
    if (currentPath.includes("/chat")) return "chat";
    return "formedfor"; // Default tab
  };

  return (
    <div className="sticky top-0 z-10 bg-background border-b">
      <div className="mx-auto max-w-7xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Tabs defaultValue={getActiveTab()} className="w-full" 
                  onValueChange={(value) => {
                    if (value === "formedfor") navigate("/");
                    else navigate(`/${value}`);
                  }}>
              <TabsList className="inline-flex">
                <TabsTrigger value="formedfor" className="data-[state=active]:bg-transparent border border-input data-[state=active]:border-primary data-[state=active]:text-primary">Formed For</TabsTrigger>
                <TabsTrigger value="brodin" className="data-[state=active]:bg-transparent border border-input data-[state=active]:border-primary data-[state=active]:text-primary">Brodin</TabsTrigger>
                <TabsTrigger value="leads" className="data-[state=active]:bg-transparent border border-input data-[state=active]:border-primary data-[state=active]:text-primary">Leads</TabsTrigger>
                <TabsTrigger value="orders" className="data-[state=active]:bg-transparent border border-input data-[state=active]:border-primary data-[state=active]:text-primary">Orders</TabsTrigger>
                <TabsTrigger value="chat" className="data-[state=active]:bg-transparent border border-input data-[state=active]:border-primary data-[state=active]:text-primary">Chat</TabsTrigger>
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
