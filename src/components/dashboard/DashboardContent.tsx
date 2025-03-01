
import { Card, CardContent } from "@/components/ui/card";
import { SculpturesList } from "@/components/SculpturesList";
import { ViewSettings } from "@/hooks/use-user-preferences";

interface DashboardContentProps {
  viewSettings: ViewSettings;
}

export function DashboardContent({ viewSettings }: DashboardContentProps) {
  return (
    <Card className="border-0 shadow-none">
      <CardContent className="p-0">
        <SculpturesList 
          viewSettings={viewSettings} 
          isGridView={viewSettings.isGridView}
          selectedProductLines={viewSettings.selectedProductLines}
          searchQuery={viewSettings.searchValue}
        />
      </CardContent>
    </Card>
  );
}
