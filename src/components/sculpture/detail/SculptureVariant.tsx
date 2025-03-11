import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, TrashIcon, ArchiveIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SculptureMaterialFinish } from "./SculptureMaterialFinish";
import { SculptureMethod } from "./SculptureMethod";
import { SculptureDimensions } from "./SculptureDimensions";
import { SculptureWeight } from "./SculptureWeight";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

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
}

export function SculptureVariant({ 
  variants, 
  onVariantChange,
  selectedVariantId,
  onCreateVariant,
  onArchiveVariant,
  onDeleteVariant,
  isCreatingVariant = false,
  isDeletingVariant = false
}: SculptureVariantProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteAction, setDeleteAction] = useState<"archive" | "delete" | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [localVariants, setLocalVariants] = useState<SculptureVariantDetails[]>([]);

  useEffect(() => {
    if (variants.length > 0) {
      setLocalVariants(variants);
    }
  }, [variants]);

  const currentVariant = localVariants.length > 0 && currentIndex < localVariants.length 
    ? localVariants[currentIndex] 
    : null;

  useEffect(() => {
    if (localVariants.length && selectedVariantId) {
      const newIndex = localVariants.findIndex(v => v.id === selectedVariantId);
      if (newIndex >= 0) {
        setCurrentIndex(newIndex);
      } else if (localVariants.length > 0) {
        setCurrentIndex(0);
        onVariantChange(localVariants[0].id);
      }
    } else if (localVariants.length > 0 && !selectedVariantId) {
      setCurrentIndex(0);
      onVariantChange(localVariants[0].id);
    }
  }, [localVariants, selectedVariantId, onVariantChange]);
  
  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      onVariantChange(localVariants[newIndex].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < localVariants.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      onVariantChange(localVariants[newIndex].id);
    }
  };

  const handleAddVariant = async () => {
    if (!onCreateVariant || !currentVariant) return;
    
    try {
      toast({
        title: "Creating Variant",
        description: "Please wait while we create a new variant.",
      });
      
      const newVariantId = await onCreateVariant(currentVariant.id);
      console.log("New variant created with ID:", newVariantId);
      
      queryClient.invalidateQueries({ queryKey: ["sculpture-variants", currentVariant.sculptureId] });
      
      setTimeout(() => {
        onVariantChange(newVariantId);
      }, 500);
    } catch (error) {
      console.error("Failed to create variant:", error);
      toast({
        title: "Error",
        description: "Failed to create new variant",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = () => {
    if (localVariants.length <= 1) {
      toast({
        title: "Cannot Delete",
        description: "You must have at least one variant. Create another variant before deleting this one.",
        variant: "destructive",
      });
      return;
    }
    
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!currentVariant) return;
    
    try {
      if (deleteAction === "archive" && onArchiveVariant) {
        await onArchiveVariant(currentVariant.id);
      } else if (deleteAction === "delete" && onDeleteVariant) {
        await onDeleteVariant(currentVariant.id);
      }
      
      const updatedVariants = localVariants.filter(v => v.id !== currentVariant.id);
      setLocalVariants(updatedVariants);
      
      const newIndex = currentIndex > 0 ? currentIndex - 1 : 0;
      
      if (updatedVariants.length > 0) {
        setCurrentIndex(newIndex);
        onVariantChange(updatedVariants[newIndex].id);
      }
      
      setShowDeleteDialog(false);
      setDeleteAction(null);
      
      queryClient.invalidateQueries({ 
        queryKey: ["sculpture-variants", currentVariant.sculptureId] 
      });
    } catch (error) {
      console.error("Failed to delete variant:", error);
      toast({
        title: "Error",
        description: `Failed to ${deleteAction} variant`,
        variant: "destructive",
      });
    }
  };

  const handleAttributeChange = useCallback((field: string, value: any) => {
    if (!currentVariant) return;
    
    setLocalVariants(prevVariants => {
      const updatedVariants = [...prevVariants];
      const variantIndex = updatedVariants.findIndex(v => v.id === currentVariant.id);
      
      if (variantIndex >= 0) {
        updatedVariants[variantIndex] = {
          ...updatedVariants[variantIndex],
          [field]: value
        };
      }
      
      return updatedVariants;
    });
  }, [currentVariant]);

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

  return (
    <>
      <Card className="mb-6">
        <CardContent className="pt-6 px-4 pb-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Variant {currentIndex + 1} of {localVariants.length}</h2>
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
                disabled={currentIndex === localVariants.length - 1}
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
                disabled={isDeletingVariant || localVariants.length <= 1 || (!onArchiveVariant && !onDeleteVariant)}
                title="Delete this variant"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-md font-semibold mb-2">Sculpture Details</h3>
            <div className="space-y-4">
              <SculptureMaterialFinish
                sculptureId={currentVariant.sculptureId}
                materialId={currentVariant.materialId}
                onMaterialChange={(materialId) => handleAttributeChange("materialId", materialId)}
                isVariantForm={true}
                variantId={currentVariant.id}
              />
              
              <SculptureMethod
                sculptureId={currentVariant.sculptureId}
                methodId={currentVariant.methodId}
                onMethodChange={(methodId) => handleAttributeChange("methodId", methodId)}
                isVariantForm={true}
                variantId={currentVariant.id}
              />
              
              <SculptureDimensions
                sculptureId={currentVariant.sculptureId}
                height={currentVariant.heightIn}
                width={currentVariant.widthIn}
                depth={currentVariant.depthIn}
                onDimensionsChange={(field, value) => handleAttributeChange(field, value)}
                isVariantForm={true}
                variantId={currentVariant.id}
              />
              
              <SculptureWeight
                sculptureId={currentVariant.sculptureId}
                weightKg={currentVariant.weightKg}
                weightLbs={currentVariant.weightLbs}
                onWeightChange={(field, value) => handleAttributeChange(field, value)}
                isVariantForm={true}
                variantId={currentVariant.id}
              />
            </div>
          </div>
          
          <div className="space-y-4 mt-6">
            <h3 className="text-md font-semibold mb-2">Base Details</h3>
            <div className="space-y-4">
              <SculptureMaterialFinish
                sculptureId={currentVariant.sculptureId}
                materialId={currentVariant.baseMaterialId}
                onMaterialChange={(materialId) => handleAttributeChange("baseMaterialId", materialId)}
                isBase={true}
                isVariantForm={true}
                variantId={currentVariant.id}
              />
              
              <SculptureMethod
                sculptureId={currentVariant.sculptureId}
                methodId={currentVariant.baseMethodId}
                onMethodChange={(methodId) => handleAttributeChange("baseMethodId", methodId)}
                isBase={true}
                isVariantForm={true}
                variantId={currentVariant.id}
              />
              
              <SculptureDimensions
                sculptureId={currentVariant.sculptureId}
                height={currentVariant.baseHeightIn}
                width={currentVariant.baseWidthIn}
                depth={currentVariant.baseDepthIn}
                onDimensionsChange={(field, value) => handleAttributeChange(field, value)}
                isBase={true}
                isVariantForm={true}
                variantId={currentVariant.id}
              />
              
              <SculptureWeight
                sculptureId={currentVariant.sculptureId}
                weightKg={currentVariant.baseWeightKg}
                weightLbs={currentVariant.baseWeightLbs}
                onWeightChange={(field, value) => handleAttributeChange(field, value)}
                isBase={true}
                isVariantForm={true}
                variantId={currentVariant.id}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Variant</AlertDialogTitle>
            <AlertDialogDescription>
              How would you like to remove this variant?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteAction(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                setDeleteAction("archive");
                handleDeleteConfirm();
              }}
              className="bg-amber-600 hover:bg-amber-700"
            >
              <ArchiveIcon className="h-4 w-4 mr-2" />
              Archive Variant
            </AlertDialogAction>
            <AlertDialogAction 
              onClick={() => {
                setDeleteAction("delete");
                handleDeleteConfirm();
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
