import { SculptureAttributes } from "./SculptureAttributes";
import { Sculpture } from "@/types/sculpture";
import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useSculptureRegeneration } from "@/hooks/use-sculpture-regeneration";
import { RegenerationSheet } from "../RegenerationSheet";
import { SculptureDetailHeader } from "./components/SculptureDetailHeader";
import { SculptureMainContent } from "./components/SculptureMainContent";
import { SculptureMainContent2 } from "./components/SculptureMainContent2";
import { useUserRoles } from "@/hooks/use-user-roles";
import { PermissionGuard } from "@/components/permissions/PermissionGuard";
import { Toggle } from "@/components/ui/toggle";
import { LayoutGrid, LayoutList } from "lucide-react";

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
  const [layoutType, setLayoutType] = useState<'layout1' | 'layout2'>('layout1');

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

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 bg-background z-10">
        <div className="flex items-center justify-between">
          <SculptureDetailHeader sculpture={sculpture} />
          <Toggle
            pressed={layoutType === 'layout2'}
            onPressedChange={(pressed) => setLayoutType(pressed ? 'layout2' : 'layout1')}
            aria-label="Toggle layout"
            className="ml-2"
          >
            {layoutType === 'layout1' ? (
              <LayoutGrid className="h-4 w-4" />
            ) : (
              <LayoutList className="h-4 w-4" />
            )}
          </Toggle>
        </div>
      </div>

      <div className="overflow-y-auto flex-1 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {layoutType === 'layout1' ? (
            <SculptureMainContent
              sculpture={sculpture}
              isRegenerating={isRegenerating(sculpture.id)}
              onRegenerate={handleRegenerate}
            />
          ) : (
            <SculptureMainContent2
              sculpture={sculpture}
              isRegenerating={isRegenerating(sculpture.id)}
              onRegenerate={handleRegenerate}
            />
          )}
          <div>
            <SculptureAttributes
              sculpture={sculpture}
              originalSculpture={originalSculpture}
              tags={tags}
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
