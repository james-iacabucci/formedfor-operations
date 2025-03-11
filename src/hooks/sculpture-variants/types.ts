
import { SculptureVariantDetails } from "@/components/sculpture/detail/SculptureVariant";
import { FabricationQuote } from "@/types/fabrication-quote";

export interface SculptureVariantRow {
  id: string;
  sculpture_id: string;
  material_id: string | null;
  method_id: string | null;
  height_in: number | null;
  width_in: number | null;
  depth_in: number | null;
  weight_kg: number | null;
  weight_lbs: number | null;
  base_material_id: string | null;
  base_method_id: string | null;
  base_height_in: number | null;
  base_width_in: number | null;
  base_depth_in: number | null;
  base_weight_kg: number | null;
  base_weight_lbs: number | null;
  order_index: number;
  is_archived: boolean;
  created_at: string;
}

export interface UseSculptureVariantsReturn {
  variants: SculptureVariantDetails[] | undefined;
  isLoading: boolean;
  refetch: () => Promise<any>; // Updated type to accept any Promise return
  getQuotesForVariant: (variantId: string) => Promise<FabricationQuote[]>;
  createVariant: (currentVariantId: string) => Promise<string>; // Updated to return Promise<string>
  archiveVariant: (variantId: string) => Promise<any>; // Updated to return Promise<any>
  deleteVariant: (variantId: string) => Promise<any>; // Updated to return Promise<any>
  isCreatingVariant: boolean;
  isArchivingVariant: boolean;
  isDeletingVariant: boolean;
}
