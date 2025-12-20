
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppRole } from "@/types/roles";

interface RoleTabHeaderProps {
  activeTab: AppRole;
  setActiveTab: (tab: AppRole) => void;
  isSaving?: boolean;
}

export function RoleTabHeader({
  activeTab,
  setActiveTab,
  isSaving = false,
}: RoleTabHeaderProps) {
  return (
    <div className="mb-4">
      <TabsList className="w-full inline-flex h-auto bg-transparent p-1 rounded-md border border-border">
        <TabsTrigger 
          value="admin" 
          onClick={() => setActiveTab("admin")}
          className="flex-1 h-9 px-5 py-2 text-sm font-medium rounded-md text-foreground dark:text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
          disabled={isSaving}
        >
          Admin
        </TabsTrigger>
        <TabsTrigger 
          value="sales" 
          onClick={() => setActiveTab("sales")}
          className="flex-1 h-9 px-5 py-2 text-sm font-medium rounded-md text-foreground dark:text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
          disabled={isSaving}
        >
          Sales
        </TabsTrigger>
        <TabsTrigger 
          value="fabrication" 
          onClick={() => setActiveTab("fabrication")}
          className="flex-1 h-9 px-5 py-2 text-sm font-medium rounded-md text-foreground dark:text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
          disabled={isSaving}
        >
          Fabrication
        </TabsTrigger>
        <TabsTrigger 
          value="orders" 
          onClick={() => setActiveTab("orders")}
          className="flex-1 h-9 px-5 py-2 text-sm font-medium rounded-md text-foreground dark:text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
          disabled={isSaving}
        >
          Orders
        </TabsTrigger>
      </TabsList>
    </div>
  );
}
