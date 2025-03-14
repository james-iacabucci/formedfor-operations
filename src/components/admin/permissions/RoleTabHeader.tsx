
import { Button } from "@/components/ui/button";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppRole } from "@/types/roles";
import { Save, Undo } from "lucide-react";

interface RoleTabHeaderProps {
  activeTab: AppRole;
  setActiveTab: (tab: AppRole) => void;
  resetToDefaults: () => void;
  saveChanges: () => void;
  hasChanges: boolean;
}

export function RoleTabHeader({
  activeTab,
  setActiveTab,
  resetToDefaults,
  saveChanges,
  hasChanges,
}: RoleTabHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <TabsList>
        <TabsTrigger value="admin" onClick={() => setActiveTab("admin")}>
          Admin
        </TabsTrigger>
        <TabsTrigger value="sales" onClick={() => setActiveTab("sales")}>
          Sales
        </TabsTrigger>
        <TabsTrigger value="fabrication" onClick={() => setActiveTab("fabrication")}>
          Fabrication
        </TabsTrigger>
        <TabsTrigger value="orders" onClick={() => setActiveTab("orders")}>
          Orders
        </TabsTrigger>
      </TabsList>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={resetToDefaults}
          className="gap-1"
        >
          <Undo className="h-4 w-4" />
          Reset
        </Button>
        <Button
          size="sm"
          onClick={saveChanges}
          disabled={!hasChanges}
          className="gap-1"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
