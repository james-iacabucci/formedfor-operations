
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
      <div className="flex items-center gap-4">
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevious}
            disabled={currentIndex === 0 || isCreatingVariant || isDeletingVariant}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm font-medium">
            Variant {currentIndex + 1} of {totalVariants}
          </span>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            disabled={currentIndex === totalVariants - 1 || isCreatingVariant || isDeletingVariant}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddVariant}
          disabled={isCreatingVariant || isDeletingVariant || !onCreateVariant}
          className="h-8"
        >
          {isCreatingVariant ? (
            <span className="flex items-center">
              <span className="animate-spin mr-1">⏳</span> Adding...
            </span>
          ) : (
            <>
              <PlusIcon className="h-3.5 w-3.5 mr-1" />
              Add Variant
            </>
          )}
        </Button>
        
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDeleteClick}
          disabled={
            isDeletingVariant || 
            isCreatingVariant || 
            disableDelete || 
            (!onDeleteVariant && !onArchiveVariant)
          }
          className="h-8"
        >
          {isDeletingVariant ? (
            <span className="flex items-center">
              <span className="animate-spin mr-1">⏳</span> Deleting...
            </span>
          ) : (
            <>
              <Trash2Icon className="h-3.5 w-3.5 mr-1" />
              Remove
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
