
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sculpture } from "@/types/sculpture";
import { SculptureCard } from "../SculptureCard";
import { useState } from "react";
import { DeleteSculptureDialog } from "../DeleteSculptureDialog";
import { ManageTagsDialog } from "@/components/tags/ManageTagsDialog";

interface SculptureVariationsProps {
  sculpture: Sculpture;
}

export function SculptureVariations({ sculpture }: SculptureVariationsProps) {
  const originalId = sculpture.original_sculpture_id || sculpture.id;
  const [selectedSculpture, setSelectedSculpture] = useState<Sculpture | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTagsDialogOpen, setIsTagsDialogOpen] = useState(false);
  const hasVariants = !!sculpture.original_sculpture_id;

  // This query fetches variants of the current sculpture or variants of its original
  const { data: variations } = useQuery({
    queryKey: ["sculpture_variations", originalId],
    queryFn: async () => {
      if (!originalId) return [];

      const { data, error } = await supabase
        .from("sculptures")
        .select("*")
        .or(`id.eq.${originalId},original_sculpture_id.eq.${originalId}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform to match Sculpture type
      return data.map((item: any): Sculpture => ({
        ...item,
        models: Array.isArray(item.models) ? item.models : [],
        renderings: Array.isArray(item.renderings) ? item.renderings : [],
        dimensions: Array.isArray(item.dimensions) ? item.dimensions : [],
      }));
    },
    enabled: !!originalId,
  });

  // Query to fetch tags for all these sculptures
  const { data: sculptureTagRelations } = useQuery({
    queryKey: ["sculpture_variations_tags", originalId],
    queryFn: async () => {
      if (!originalId) return [];

      const { data, error } = await supabase
        .from("sculpture_tags")
        .select("sculpture_id, tag_id")
        .or(`sculpture_id.eq.${originalId},sculpture_id.in.(${variations?.filter(v => v.id !== originalId).map(v => v.id).join(",")})`)

      if (error) throw error;
      return data;
    },
    enabled: !!variations?.length,
  });

  // Query to fetch all tags
  const { data: tags } = useQuery({
    queryKey: ["tags_for_variations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tags")
        .select("*");

      if (error) throw error;
      return data;
    },
  });

  const handleDelete = (variation: Sculpture) => {
    setSelectedSculpture(variation);
    setIsDeleteDialogOpen(true);
  };

  const handleManageTags = (variation: Sculpture) => {
    setSelectedSculpture(variation);
    setIsTagsDialogOpen(true);
  };

  if (!variations || !tags) return null;

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          {hasVariants ? "Other Variants" : "Variants"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {variations
            ?.filter(
              (variation) => variation.id !== sculpture.id
            )
            .map((variation) => {
              const variationTags = tags.filter(
                (tag) =>
                  sculptureTagRelations?.some(
                    (relation) =>
                      relation.sculpture_id === variation.id &&
                      relation.tag_id === tag.id
                  )
              );

              return (
                <SculptureCard
                  key={variation.id}
                  sculpture={variation}
                  tags={variationTags}
                  onDelete={() => handleDelete(variation)}
                  onManageTags={() => handleManageTags(variation)}
                />
              );
            })}
        </div>
      </div>

      {selectedSculpture && (
        <DeleteSculptureDialog
          sculpture={selectedSculpture}
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        />
      )}

      {selectedSculpture && (
        <ManageTagsDialog
          sculpture={selectedSculpture}
          open={isTagsDialogOpen}
          onOpenChange={setIsTagsDialogOpen}
        />
      )}
    </div>
  );
}
