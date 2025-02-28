
import { UserMenu } from "@/components/UserMenu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useLocation } from "react-router-dom";

export function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // Determine active tab based on current path
  const getActiveTab = () => {
    if (currentPath.includes("/showroom")) return "showroom";
    if (currentPath.includes("/orders")) return "orders";
    if (currentPath.includes("/chat")) return "chat";
    return "studio"; // Default tab
  };

  return (
    <div className="sticky top-0 z-10 bg-background border-b">
      <div className="mx-auto max-w-7xl p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold">Formed For</h1>
          
          <div className="flex flex-1 justify-center max-w-md mx-auto sm:mx-0">
            <Tabs defaultValue={getActiveTab()} className="w-full" 
                  onValueChange={(value) => {
                    if (value === "studio") navigate("/");
                    else navigate(`/${value}`);
                  }}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="studio">Studio</TabsTrigger>
                <TabsTrigger value="showroom">Showroom</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="chat">Chat</TabsTrigger>
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
