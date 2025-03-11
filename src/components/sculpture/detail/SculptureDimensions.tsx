
import { useSculptureDimensions } from "./hooks/useSculptureDimensions";
import { DimensionsDisplay } from "./components/DimensionsDisplay";
import { DimensionsEditForm } from "./components/DimensionsEditForm";

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
  const {
    isEditingDimensions,
    dimensions,
    formatDimensionsString,
    handleDimensionsUpdate,
    setDimensions,
    handleCancel,
    setIsEditingDimensions,
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
    <div>
      {isEditingDimensions ? (
        <DimensionsEditForm
          dimensions={dimensions}
          onDimensionChange={handleDimensionChange}
          onSave={handleDimensionsUpdate}
          onCancel={handleCancel}
        />
      ) : (
        <DimensionsDisplay
          displayValue={formatDimensionsString(height, width, depth)}
          onEditClick={() => setIsEditingDimensions(true)}
        />
      )}
    </div>
  );
}
