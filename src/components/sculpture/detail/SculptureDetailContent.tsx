
import { SculptureAttributes } from "./SculptureAttributes";
import { Sculpture } from "@/types/sculpture";
import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useSculptureRegeneration } from "@/hooks/use-sculpture-regeneration";
import { RegenerationSheet } from "../RegenerationSheet";
import { SculptureDetailHeader } from "./components/SculptureDetailHeader";
import { SculptureMainContent } from "./components/SculptureMainContent";
import { useUserRoles } from "@/hooks/use-user-roles";
import { PermissionGuard } from "@/components/permissions/PermissionGuard";
import { useSculptureVariants } from "@/hooks/sculpture-variants";
import { SculptureVariantDetails } from "./SculptureVariant";

interface SculptureDetailContentProps {
  sculpture: Sculpture;
  onUpdate: () => void;
  originalSculpture: Sculpture | null;
  tags: Array<{ id: string; name: string }>;
}

export function SculptureDetailContent({
  sculpture,
  onUpdate,
  originalSculpture,
  tags,
}: SculptureDetailContentProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { regenerateImage, isRegenerating, generateVariant } = useSculptureRegeneration();
  const [isRegenerationSheetOpen, setIsRegenerationSheetOpen] = useState(false);
  const { hasPermission } = useUserRoles();
  
  // Get variant data using the hook
  const {
    variants,
    isLoading: isLoadingVariants,
    createVariant,
    archiveVariant,
    deleteVariant,
    isCreatingVariant,
    isDeletingVariant
  } = useSculptureVariants(sculpture.id);
  
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  
  // Find the current variant index
  const currentVariantIndex = variants?.findIndex(v => v.id === selectedVariantId) ?? 0;
  const totalVariants = variants?.length ?? 0;

  // Variant navigation handlers
  const handlePrevious = () => {
    if (currentVariantIndex > 0 && variants) {
      setSelectedVariantId(variants[currentVariantIndex - 1].id);
    }
  };
  
  const handleNext = () => {
    if (variants && currentVariantIndex < variants.length - 1) {
      setSelectedVariantId(variants[currentVariantIndex + 1].id);
    }
  };
  
  const handleVariantChange = (variantId: string) => {
    setSelectedVariantId(variantId);
  };
  
  const handleAddVariant = async () => {
    if (!createVariant || !selectedVariantId) return;
    
    try {
      const newVariantId = await createVariant(selectedVariantId);
      setSelectedVariantId(newVariantId);
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
    if (variants && variants.length <= 1) {
      toast({
        title: "Cannot Delete",
        description: "You must have at least one variant. Create another variant before deleting this one.",
        variant: "destructive",
      });
      return;
    }
    
    // Show delete dialog - we'll need to add this later
    // for now just calling archiveVariant directly
    if (selectedVariantId && archiveVariant) {
      archiveVariant(selectedVariantId)
        .then(() => {
          if (variants && variants.length > 0) {
            // Select another variant
            const newIndex = Math.max(0, currentVariantIndex - 1);
            setSelectedVariantId(variants[newIndex].id);
          }
        })
        .catch(error => {
          console.error("Error archiving variant:", error);
        });
    }
  };

  // Original regenerate handler
  const handleRegenerate = useCallback(async () => {
    if (isRegenerating(sculpture.id) || !hasPermission('sculpture.regenerate')) return;
    
    try {
      await regenerateImage(sculpture.id);
      await queryClient.invalidateQueries({ queryKey: ["sculpture", sculpture.id] });
      
      toast({
        title: "Success",
        description: "Image regenerated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to regenerate. Please try again.",
        variant: "destructive",
      });
    }
  }, [sculpture.id, regenerateImage, queryClient, toast, isRegenerating, hasPermission]);

  const handleGenerateVariant = async (options: {
    creativity: "none" | "small" | "medium" | "large";
    changes?: string;
    updateExisting: boolean;
    regenerateImage: boolean;
    regenerateMetadata: boolean;
  }) => {
    // Check permissions based on whether we're creating or updating
    const permissionRequired = options.updateExisting 
      ? 'sculpture.edit'
      : 'variant.create';
      
    if (!hasPermission(permissionRequired)) {
      toast({
        title: "Permission Denied",
        description: options.updateExisting 
          ? "You don't have permission to update sculptures." 
          : "You don't have permission to create variants.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await generateVariant(sculpture.id, sculpture.created_by, sculpture.prompt, options);
      await queryClient.invalidateQueries({ queryKey: ["sculptures"] });
      
      toast({
        title: "Success",
        description: options.updateExisting 
          ? "Updates generated successfully." 
          : "Variation created successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate variant. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Initialize selectedVariantId if it's null and we have variants
  if (selectedVariantId === null && variants && variants.length > 0) {
    setSelectedVariantId(variants[0].id);
  }

  return (
    <div className="flex flex-col h-full">
      <SculptureDetailHeader 
        sculpture={sculpture}
        // Pass variant navigation props
        currentVariantIndex={currentVariantIndex}
        totalVariants={totalVariants}
        handlePrevious={handlePrevious}
        handleNext={handleNext}
        handleAddVariant={handleAddVariant}
        handleDeleteClick={handleDeleteClick}
        isCreatingVariant={isCreatingVariant}
        isDeletingVariant={isDeletingVariant}
        disableDelete={variants?.length <= 1}
      />

      <div className="overflow-y-auto flex-1 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SculptureMainContent
            sculpture={sculpture}
            isRegenerating={isRegenerating(sculpture.id)}
            onRegenerate={handleRegenerate}
          />
          <div>
            <SculptureAttributes
              sculpture={sculpture}
              originalSculpture={originalSculpture}
              tags={tags}
              variants={variants}
              selectedVariantId={selectedVariantId}
              onVariantChange={handleVariantChange}
              onCreateVariant={createVariant}
              onArchiveVariant={archiveVariant}
              onDeleteVariant={deleteVariant}
              isCreatingVariant={isCreatingVariant}
              isDeletingVariant={isDeletingVariant}
            />
          </div>
        </div>
      </div>

      <PermissionGuard
        requiredPermission={isRegenerationSheetOpen ? "variant.create" : "sculpture.regenerate"}
        fallback={null}
      >
        <RegenerationSheet
          open={isRegenerationSheetOpen}
          onOpenChange={setIsRegenerationSheetOpen}
          onRegenerate={handleGenerateVariant}
          isRegenerating={isRegenerating(sculpture.id)}
          defaultPrompt={sculpture.prompt}
        />
      </PermissionGuard>
    </div>
  );
}
