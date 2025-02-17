
import { Badge } from "@/components/ui/badge";

interface ViewSettings {
  sortBy: 'created_at' | 'ai_generated_name' | 'updated_at';
  sortOrder: 'asc' | 'desc';
  productLineId: string | null;
  materialIds: string[];
  status: string | null;
  heightOperator: 'eq' | 'gt' | 'lt' | null;
  heightValue: number | null;
  selectedTagIds: string[];
}

interface SelectedFiltersProps {
  viewSettings: ViewSettings;
  productLines?: Array<{ id: string; name: string }>;
  materials?: Array<{ id: string; name: string }>;
  tags?: Array<{ id: string; name: string }>;
}

export function SelectedFilters({ 
  viewSettings,
  productLines = [],
  materials = [],
  tags = []
}: SelectedFiltersProps) {
  const filters: { id: string; label: string }[] = [];

  // Add selected product line
  if (viewSettings.productLineId) {
    const productLine = productLines.find(pl => pl.id === viewSettings.productLineId);
    if (productLine) {
      filters.push({ id: `pl-${productLine.id}`, label: productLine.name });
    }
  }

  // Add selected materials
  viewSettings.materialIds.forEach(materialId => {
    const material = materials.find(m => m.id === materialId);
    if (material) {
      filters.push({ id: `mat-${material.id}`, label: material.name });
    }
  });

  // Add status if selected
  if (viewSettings.status) {
    filters.push({ 
      id: `status-${viewSettings.status}`, 
      label: viewSettings.status.toUpperCase() 
    });
  }

  // Add height filter if set
  if (viewSettings.heightOperator && viewSettings.heightValue !== null) {
    const operatorMap = {
      eq: '=',
      gt: '>',
      lt: '<'
    };
    filters.push({ 
      id: 'height', 
      label: `Height ${operatorMap[viewSettings.heightOperator]} ${viewSettings.heightValue}"`
    });
  }

  // Add selected tags
  if (!viewSettings.selectedTagIds.includes('all')) {
    viewSettings.selectedTagIds.forEach(tagId => {
      const tag = tags.find(t => t.id === tagId);
      if (tag) {
        filters.push({ id: `tag-${tag.id}`, label: tag.name });
      }
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {filters.length === 0 ? (
        <Badge
          variant="outline"
          className="bg-background text-foreground border-border"
        >
          All Sculptures
        </Badge>
      ) : (
        filters.map(filter => (
          <Badge
            key={filter.id}
            variant="outline"
            className="bg-background text-foreground border-border"
          >
            {filter.label}
          </Badge>
        ))
      )}
    </div>
  );
}
