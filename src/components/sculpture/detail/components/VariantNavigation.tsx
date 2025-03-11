
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, TrashIcon } from "lucide-react";

interface VariantNavigationProps {
  currentIndex: number;
  totalVariants: number;
  handlePrevious: () => void;
  handleNext: () => void;
  handleAddVariant: () => void;
  handleDeleteClick: () => void;
  isCreatingVariant: boolean;
  isDeletingVariant: boolean;
  disableDelete: boolean;
  onCreateVariant?: (currentVariantId: string) => Promise<string>;
  onDeleteVariant?: (variantId: string) => Promise<void>;
  onArchiveVariant?: (variantId: string) => Promise<void>;
}

export function VariantNavigation({
  currentIndex,
  totalVariants,
  handlePrevious,
  handleNext,
  handleAddVariant,
  handleDeleteClick,
  isCreatingVariant,
  isDeletingVariant,
  disableDelete,
  onCreateVariant,
  onDeleteVariant,
  onArchiveVariant
}: VariantNavigationProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-semibold">Variant {currentIndex + 1} of {totalVariants}</h2>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          disabled={currentIndex === totalVariants - 1}
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={handleAddVariant}
          disabled={isCreatingVariant || !onCreateVariant}
          title="Add new variant based on current"
        >
          <PlusIcon className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={handleDeleteClick}
          disabled={isDeletingVariant || disableDelete || (!onArchiveVariant && !onDeleteVariant)}
          title="Delete this variant"
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
