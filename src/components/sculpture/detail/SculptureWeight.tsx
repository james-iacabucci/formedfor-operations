
import { useSculptureWeight } from "./hooks/useSculptureWeight";
import { WeightDisplay } from "./components/WeightDisplay";
import { WeightEditForm } from "./components/WeightEditForm";

interface SculptureWeightProps {
  sculptureId: string;
  weightKg: number | null;
  weightLbs: number | null;
  isBase?: boolean;
  isQuoteForm?: boolean;
  isVariantForm?: boolean;
  variantId?: string;
  onWeightChange?: (field: string, value: number | null) => void;
}

export function SculptureWeight({
  sculptureId,
  weightKg,
  weightLbs,
  isBase = false,
  isQuoteForm = false,
  isVariantForm = false,
  variantId,
  onWeightChange,
}: SculptureWeightProps) {
  const {
    isEditingWeight,
    weight,
    formatWeightString,
    formatMetricString,
    handleWeightUpdate,
    handleLbsChange,
    handleKgChange,
    handleCancel,
    setIsEditingWeight,
    isSaving,
  } = useSculptureWeight({
    sculptureId,
    weightKg,
    weightLbs,
    isBase,
    isQuoteForm,
    isVariantForm,
    variantId,
    onWeightChange,
  });

  return (
    <div>
      {isEditingWeight ? (
        <WeightEditForm
          weight={weight}
          onLbsChange={handleLbsChange}
          onKgChange={handleKgChange}
          onSave={handleWeightUpdate}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      ) : (
        <WeightDisplay
          displayValue={formatWeightString(weightKg, weightLbs)}
          metricValue={formatMetricString(weightKg)}
          onEditClick={() => setIsEditingWeight(true)}
        />
      )}
    </div>
  );
}
