
import { Card, CardContent } from "@/components/ui/card";
import { VariantNavigation } from "./components/VariantNavigation";
import { VariantDeleteDialog } from "./components/VariantDeleteDialog";
import { VariantDetailsSection } from "./components/VariantDetailsSection";
import { useSculptureVariant } from "./hooks/useSculptureVariant";

export interface SculptureVariantDetails {
  id: string;
  sculptureId: string;
  materialId: string | null;
  methodId: string | null;
  heightIn: number | null;
  widthIn: number | null;
  depthIn: number | null;
  weightKg: number | null;
  weightLbs: number | null;
  baseMaterialId: string | null;
  baseMethodId: string | null;
  baseHeightIn: number | null;
  baseWidthIn: number | null;
  baseDepthIn: number | null;
  baseWeightKg: number | null;
  baseWeightLbs: number | null;
  orderIndex: number;
  isArchived?: boolean;
}

interface SculptureVariantProps {
  variants: SculptureVariantDetails[];
  onVariantChange: (variantId: string) => void;
  selectedVariantId: string | null;
  onCreateVariant?: (currentVariantId: string) => Promise<string>;
  onArchiveVariant?: (variantId: string) => Promise<void>;
  onDeleteVariant?: (variantId: string) => Promise<void>;
  isCreatingVariant?: boolean;
  isDeletingVariant?: boolean;
  hideNavigation?: boolean; // New prop to hide the navigation
}

export function SculptureVariant({ 
  variants, 
  onVariantChange,
  selectedVariantId,
  onCreateVariant,
  onArchiveVariant,
  onDeleteVariant,
  isCreatingVariant = false,
  isDeletingVariant = false,
  hideNavigation = false // Default to showing navigation
}: SculptureVariantProps) {
  const {
    currentIndex,
    currentVariant,
    localVariants,
    showDeleteDialog,
    setShowDeleteDialog,
    handlePrevious,
    handleNext,
    handleAddVariant,
    handleDeleteClick,
    handleArchive,
    handleDelete,
    handleAttributeChange
  } = useSculptureVariant({
    variants,
    onVariantChange,
    selectedVariantId,
    onCreateVariant,
    onArchiveVariant,
    onDeleteVariant,
    isCreatingVariant,
    isDeletingVariant
  });

  if (!currentVariant || localVariants.length === 0) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6 px-4 pb-4">
          <div className="text-center py-8 text-muted-foreground">
            No variant information available.
          </div>
        </CardContent>
      </Card>
    );
  }

  const isLastVariant = localVariants.length <= 1;

  return (
    <>
      <Card className="mb-6">
        <CardContent className="pt-6 px-4 pb-4">
          {/* Only show navigation if not hidden */}
          {!hideNavigation && (
            <VariantNavigation
              currentIndex={currentIndex}
              totalVariants={localVariants.length}
              handlePrevious={handlePrevious}
              handleNext={handleNext}
              handleAddVariant={handleAddVariant}
              handleDeleteClick={handleDeleteClick}
              isCreatingVariant={isCreatingVariant}
              isDeletingVariant={isDeletingVariant}
              disableDelete={isLastVariant}
              onCreateVariant={onCreateVariant}
              onDeleteVariant={onDeleteVariant}
              onArchiveVariant={onArchiveVariant}
            />
          )}
          
          <VariantDetailsSection
            sculptureId={currentVariant.sculptureId}
            variantId={currentVariant.id}
            details={{
              materialId: currentVariant.materialId,
              methodId: currentVariant.methodId,
              heightIn: currentVariant.heightIn,
              widthIn: currentVariant.widthIn,
              depthIn: currentVariant.depthIn,
              weightKg: currentVariant.weightKg,
              weightLbs: currentVariant.weightLbs
            }}
            onAttributeChange={handleAttributeChange}
          />
          
          <div className="mt-6">
            <VariantDetailsSection
              sculptureId={currentVariant.sculptureId}
              variantId={currentVariant.id}
              details={{
                materialId: currentVariant.baseMaterialId,
                methodId: currentVariant.baseMethodId,
                heightIn: currentVariant.baseHeightIn,
                widthIn: currentVariant.baseWidthIn,
                depthIn: currentVariant.baseDepthIn,
                weightKg: currentVariant.baseWeightKg,
                weightLbs: currentVariant.baseWeightLbs
              }}
              isBase={true}
              onAttributeChange={handleAttributeChange}
            />
          </div>
        </CardContent>
      </Card>

      <VariantDeleteDialog
        showDialog={showDeleteDialog}
        setShowDialog={setShowDeleteDialog}
        onArchive={handleArchive}
        onDelete={handleDelete}
        isLoading={isDeletingVariant}
        isLastVariant={isLastVariant}
      />
    </>
  );
}
