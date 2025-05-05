
import { Sculpture } from "@/types/sculpture";
import { SculptureVariant, SculptureVariantDetails } from "./SculptureVariant";
import { TagsList } from "@/components/tags/TagsList";
import { useUserRoles } from "@/hooks/use-user-roles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SculptureFabricationQuotes } from "./SculptureFabricationQuotes";
import { useSculptureVariants } from "@/hooks/sculpture-variants";

interface SculptureAttributesProps {
  sculpture: Sculpture;
  originalSculpture: Sculpture | null;
  tags: Array<{ id: string; name: string }>;
  variants?: SculptureVariantDetails[];
  selectedVariantId?: string | null;
  onVariantChange?: (variantId: string) => void;
  onCreateVariant?: (currentVariantId: string) => Promise<string>;
  onArchiveVariant?: (variantId: string) => Promise<void>;
  onDeleteVariant?: (variantId: string) => Promise<void>;
  isCreatingVariant?: boolean;
  isDeletingVariant?: boolean;
}

export function SculptureAttributes({
  sculpture,
  originalSculpture,
  tags,
  variants: propVariants,
  selectedVariantId: propSelectedVariantId,
  onVariantChange,
  onCreateVariant,
  onArchiveVariant,
  onDeleteVariant,
  isCreatingVariant = false,
  isDeletingVariant = false
}: SculptureAttributesProps) {
  const { hasPermission } = useUserRoles();
  const showVariantSection = hasPermission('sculpture.variant.view');
  const showQuotesSection = hasPermission('fabrication_quote.view');
  const showTagsSection = hasPermission('sculpture.tags.view');
  
  // Only use the hook if no props are provided
  const {
    variants: hookVariants,
    isLoading,
    createVariant,
    archiveVariant,
    deleteVariant,
    isCreatingVariant: isHookCreatingVariant,
    isDeletingVariant: isHookDeletingVariant
  } = useSculptureVariants(sculpture.id);
  
  // Use props if provided, otherwise use hook
  const variants = propVariants || hookVariants;
  const isVariantsLoading = isLoading && !propVariants;
  const actualCreateVariant = onCreateVariant || createVariant;
  const actualArchiveVariant = onArchiveVariant || archiveVariant;
  const actualDeleteVariant = onDeleteVariant || deleteVariant;
  const actualCreatingVariant = isCreatingVariant || isHookCreatingVariant;
  const actualDeletingVariant = isDeletingVariant || isHookDeletingVariant;
  
  return (
    <div className="space-y-6">
      {showVariantSection && (
        <SculptureVariant
          variants={variants || []}
          onVariantChange={onVariantChange || (() => {})}
          selectedVariantId={propSelectedVariantId || null}
          onCreateVariant={actualCreateVariant}
          onArchiveVariant={actualArchiveVariant}
          onDeleteVariant={actualDeleteVariant}
          isCreatingVariant={actualCreatingVariant}
          isDeletingVariant={actualDeletingVariant}
          hideNavigation={true} // Hide the navigation since it's now in the header
        />
      )}

      {showTagsSection && (
        <Card className="overflow-hidden">
          <CardHeader className="px-6 py-4">
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent className="px-6 py-4 pt-0">
            <TagsList
              initialTags={tags}
              readOnly={!hasPermission('sculpture.tags.manage')}
            />
          </CardContent>
        </Card>
      )}
      
      {showQuotesSection && (
        <SculptureFabricationQuotes 
          sculptureId={sculpture.id} 
        />
      )}
    </div>
  );
}
