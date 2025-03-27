
import { useSculptureWeight } from "./hooks/useSculptureWeight";
import { WeightDisplay } from "./components/WeightDisplay";
import { WeightEditForm } from "./components/WeightEditForm";
import { useUserRoles } from "@/hooks/use-user-roles";

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
  const { hasPermission } = useUserRoles();
  const canEdit = isQuoteForm || hasPermission("sculpture.edit");
  
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

  // If we're in a variant form and not a quote form, don't render the weight
  if (isVariantForm && !isQuoteForm) {
    return null;
  }

  return (
    <div className="relative">
      {isEditingWeight && canEdit ? (
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
          onEditClick={() => canEdit && setIsEditingWeight(true)}
          isLoading={isSaving}
          weightKg={weightKg}
          weightLbs={weightLbs}
          requiredPermission="sculpture.edit"
        />
      )}
    </div>
  );
}
