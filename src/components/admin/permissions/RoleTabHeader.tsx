
import { Button } from "@/components/ui/button";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppRole } from "@/types/roles";
import { Loader2, Save, Undo } from "lucide-react";

interface RoleTabHeaderProps {
  activeTab: AppRole;
  setActiveTab: (tab: AppRole) => void;
  resetToDefaults: () => void;
  saveChanges: () => void;
  hasChanges: boolean;
  isSaving?: boolean;
}

export function RoleTabHeader({
  activeTab,
  setActiveTab,
  resetToDefaults,
  saveChanges,
  hasChanges,
  isSaving = false,
}: RoleTabHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <TabsList className="inline-flex h-auto bg-transparent p-1 rounded-md border border-[#333333]">
        <TabsTrigger 
          value="admin" 
          onClick={() => setActiveTab("admin")}
          className="h-9 px-5 py-2 text-sm font-medium rounded-md text-foreground dark:text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
          disabled={isSaving}
        >
          Admin
        </TabsTrigger>
        <TabsTrigger 
          value="sales" 
          onClick={() => setActiveTab("sales")}
          className="h-9 px-5 py-2 text-sm font-medium rounded-md text-foreground dark:text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
          disabled={isSaving}
        >
          Sales
        </TabsTrigger>
        <TabsTrigger 
          value="fabrication" 
          onClick={() => setActiveTab("fabrication")}
          className="h-9 px-5 py-2 text-sm font-medium rounded-md text-foreground dark:text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
          disabled={isSaving}
        >
          Fabrication
        </TabsTrigger>
        <TabsTrigger 
          value="orders" 
          onClick={() => setActiveTab("orders")}
          className="h-9 px-5 py-2 text-sm font-medium rounded-md text-foreground dark:text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
          disabled={isSaving}
        >
          Orders
        </TabsTrigger>
      </TabsList>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={resetToDefaults}
          className="gap-1"
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Undo className="h-4 w-4" />
          )}
          Reset
        </Button>
        <Button
          size="sm"
          onClick={saveChanges}
          disabled={isSaving}
          className="gap-1"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
