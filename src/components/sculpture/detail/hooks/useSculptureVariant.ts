
import { useState, useEffect, useCallback } from "react";
import { SculptureVariantDetails } from "../SculptureVariant";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface UseSculptureVariantProps {
  variants: SculptureVariantDetails[];
  onVariantChange: (variantId: string) => void;
  selectedVariantId: string | null;
  onCreateVariant?: (currentVariantId: string) => Promise<string>;
  onArchiveVariant?: (variantId: string) => Promise<void>;
  onDeleteVariant?: (variantId: string) => Promise<void>;
  isCreatingVariant?: boolean;
  isDeletingVariant?: boolean;
}

export function useSculptureVariant({
  variants,
  onVariantChange,
  selectedVariantId,
  onCreateVariant,
  onArchiveVariant,
  onDeleteVariant,
  isCreatingVariant = false,
  isDeletingVariant = false
}: UseSculptureVariantProps) {
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
  
  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      onVariantChange(localVariants[newIndex].id);
    }
  }, [currentIndex, localVariants, onVariantChange]);

  const handleNext = useCallback(() => {
    if (currentIndex < localVariants.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      onVariantChange(localVariants[newIndex].id);
    }
  }, [currentIndex, localVariants, onVariantChange]);

  const handleAddVariant = useCallback(async () => {
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
  }, [onCreateVariant, currentVariant, toast, queryClient, onVariantChange]);

  const handleDeleteClick = useCallback(() => {
    if (localVariants.length <= 1) {
      toast({
        title: "Cannot Delete",
        description: "You must have at least one variant. Create another variant before deleting this one.",
        variant: "destructive",
      });
      return;
    }
    
    setShowDeleteDialog(true);
  }, [localVariants.length, toast]);

  const handleDeleteConfirm = useCallback(async () => {
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
  }, [currentVariant, deleteAction, onArchiveVariant, onDeleteVariant, localVariants, currentIndex, onVariantChange, queryClient, toast]);

  const handleArchive = useCallback(() => {
    setDeleteAction("archive");
    handleDeleteConfirm();
  }, [handleDeleteConfirm]);

  const handleDelete = useCallback(() => {
    setDeleteAction("delete");
    handleDeleteConfirm();
  }, [handleDeleteConfirm]);

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

  return {
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
  };
}
