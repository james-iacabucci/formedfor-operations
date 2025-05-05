
import { Sculpture } from "@/types/sculpture";
import { SculptureVariantDetails } from "./SculptureVariant";
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
  const showQuotesSection = hasPermission('quote.create');
  
  // Only use the hook if no props are provided
  const {
    variants: hookVariants,
    isLoading,
    refetch,
    getQuotesForVariant
  } = useSculptureVariants(sculpture.id);
  
  return (
    <div className="space-y-6">      
      {showQuotesSection && (
        <SculptureFabricationQuotes 
          sculptureId={sculpture.id} 
        />
      )}
    </div>
  );
}
