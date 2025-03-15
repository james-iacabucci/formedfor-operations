
import { useSculptureDimensions } from "./hooks/useSculptureDimensions";
import { DimensionsDisplay } from "./components/DimensionsDisplay";
import { DimensionsEditForm } from "./components/DimensionsEditForm";
import { useUserRoles } from "@/hooks/use-user-roles";

interface SculptureDimensionsProps {
  sculptureId: string;
  height: number | null;
  width: number | null;
  depth: number | null;
  isBase?: boolean;
  isQuoteForm?: boolean;
  isVariantForm?: boolean;
  variantId?: string;
  onDimensionsChange?: (field: string, value: number | null) => void;
}

export function SculptureDimensions({
  sculptureId,
  height,
  width,
  depth,
  isBase = false,
  isQuoteForm = false,
  isVariantForm = false,
  variantId,
  onDimensionsChange,
}: SculptureDimensionsProps) {
  const { hasPermission } = useUserRoles();
  const canEdit = isQuoteForm || hasPermission("sculpture.edit");
  
  const {
    isEditingDimensions,
    dimensions,
    formatDimensionsString,
    handleDimensionsUpdate,
    setDimensions,
    handleCancel,
    setIsEditingDimensions,
    isSaving,
  } = useSculptureDimensions({
    sculptureId,
    height,
    width,
    depth,
    isBase,
    isQuoteForm,
    isVariantForm,
    variantId,
    onDimensionsChange,
  });

  const handleDimensionChange = (field: keyof typeof dimensions, value: string) => {
    setDimensions(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="relative">
      {isEditingDimensions && canEdit ? (
        <DimensionsEditForm
          dimensions={dimensions}
          onDimensionChange={handleDimensionChange}
          onSave={handleDimensionsUpdate}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      ) : (
        <DimensionsDisplay
          displayValue={formatDimensionsString(height, width, depth)}
          onEditClick={() => canEdit && setIsEditingDimensions(true)}
          isLoading={isSaving}
          height={height}
          width={width}
          depth={depth}
          requiredPermission="sculpture.edit"
        />
      )}
    </div>
  );
}
