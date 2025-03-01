
import { useParams } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { SculpturesList } from "@/components/SculpturesList";
import { ViewSettings } from "@/hooks/use-user-preferences";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import { useEffect } from "react";

const ProductLinePage = () => {
  const { productLineId } = useParams();
  const { viewSettings, isLoading, savePreferences } = useUserPreferences();
  
  // When the component mounts or the productLineId changes, update the selected product line
  useEffect(() => {
    if (!isLoading && productLineId) {
      savePreferences({
        selectedProductLines: [productLineId],
        productLineId: productLineId
      });
    }
  }, [productLineId, isLoading, savePreferences]);
  
  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="mx-auto max-w-7xl p-6">
        <SculpturesList 
          viewSettings={viewSettings} 
          isGridView={viewSettings.isGridView}
          selectedProductLines={[productLineId || '']}
          searchQuery={viewSettings.searchValue}
        />
      </div>
    </div>
  );
};

export default ProductLinePage;
