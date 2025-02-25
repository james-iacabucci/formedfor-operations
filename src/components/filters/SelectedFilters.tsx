
import { Badge } from "@/components/ui/badge";

interface ViewSettings {
  sortBy: 'created_at' | 'ai_generated_name' | 'updated_at';
  sortOrder: 'asc' | 'desc';
  productLineId: string | null;
  materialIds: string[];
  selectedStatusIds: string[]; // Changed from status: string | null
  heightOperator: 'eq' | 'gt' | 'lt' | null;
  heightValue: number | null;
  heightUnit: 'in' | 'cm';
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

  // Add selected materials
  viewSettings.materialIds.forEach(materialId => {
    const material = materials.find(m => m.id === materialId);
    if (material) {
      filters.push({ id: `mat-${material.id}`, label: material.name });
    }
  });

  // Add selected statuses if not "all"
  if (!viewSettings.selectedStatusIds.includes('all')) {
    viewSettings.selectedStatusIds.forEach(statusId => {
      const statusMap: Record<string, string> = {
        'idea': 'Idea',
        'pending': 'Pending',
        'approved': 'Approved',
        'archived': 'Archived'
      };
      const statusLabel = statusMap[statusId] || statusId;
      filters.push({ id: `status-${statusId}`, label: statusLabel });
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
      label: `Height ${operatorMap[viewSettings.heightOperator]} ${viewSettings.heightValue}${viewSettings.heightUnit}`
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
        <Badge variant="default">
          All Sculptures
        </Badge>
      ) : (
        filters.map(filter => (
          <Badge
            key={filter.id}
            variant="default"
          >
            {filter.label}
          </Badge>
        ))
      )}
    </div>
  );
}
