
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, PlusIcon, Trash2Icon } from "lucide-react";

interface VariantNavigationProps {
  currentIndex: number;
  totalVariants: number;
  handlePrevious: () => void;
  handleNext: () => void;
  handleAddVariant: () => void;
  handleDeleteClick: () => void;
  isCreatingVariant?: boolean;
  isDeletingVariant?: boolean;
  disableDelete?: boolean;
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
  isCreatingVariant = false,
  isDeletingVariant = false,
  disableDelete = false,
  onCreateVariant,
  onDeleteVariant,
  onArchiveVariant
}: VariantNavigationProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center">
        <h3 className="text-lg font-medium">
          Variant {currentIndex + 1} of {totalVariants}
        </h3>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          disabled={currentIndex === 0 || isCreatingVariant || isDeletingVariant}
          className="h-9 w-9"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          disabled={currentIndex === totalVariants - 1 || isCreatingVariant || isDeletingVariant}
          className="h-9 w-9"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={handleAddVariant}
          disabled={isCreatingVariant || isDeletingVariant || !onCreateVariant}
          className="h-9 w-9"
          title="Add Variant"
        >
          <PlusIcon className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={handleDeleteClick}
          disabled={
            isDeletingVariant || 
            isCreatingVariant || 
            disableDelete || 
            (!onDeleteVariant && !onArchiveVariant)
          }
          className="h-9 w-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
          title="Remove Variant"
        >
          <Trash2Icon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
