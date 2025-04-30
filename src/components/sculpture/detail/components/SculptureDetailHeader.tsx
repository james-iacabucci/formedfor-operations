
import { Sculpture } from "@/types/sculpture";
import { SculptureHeader } from "../SculptureHeader";

interface SculptureDetailHeaderProps {
  sculpture: Sculpture;
  currentVariantIndex?: number;
  totalVariants?: number;
  onPreviousVariant?: () => void;
  onNextVariant?: () => void;
  onAddVariant?: () => void;
  onDeleteVariant?: () => void;
  isCreatingVariant?: boolean;
  isDeletingVariant?: boolean;
  disableDeleteVariant?: boolean;
  selectedVariantId?: string | null;
}

export function SculptureDetailHeader({ 
  sculpture,
  currentVariantIndex,
  totalVariants,
  onPreviousVariant,
  onNextVariant,
  onAddVariant,
  onDeleteVariant,
  isCreatingVariant,
  isDeletingVariant,
  disableDeleteVariant,
  selectedVariantId
}: SculptureDetailHeaderProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold truncate">{sculpture.ai_generated_name}</h1>
      </div>
      <div className="mt-2">
        <SculptureHeader 
          sculpture={sculpture} 
          currentVariantIndex={currentVariantIndex}
          totalVariants={totalVariants}
          onPreviousVariant={onPreviousVariant}
          onNextVariant={onNextVariant}
          onAddVariant={onAddVariant}
          onDeleteVariant={onDeleteVariant}
          isCreatingVariant={isCreatingVariant}
          isDeletingVariant={isDeletingVariant}
          disableDeleteVariant={disableDeleteVariant}
          selectedVariantId={selectedVariantId}
        />
      </div>
    </div>
  );
}
