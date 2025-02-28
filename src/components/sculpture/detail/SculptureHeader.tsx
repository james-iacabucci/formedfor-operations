
import { Sculpture } from "@/types/sculpture";
import { SculptureStatus } from "./SculptureStatus";
import { Button } from "@/components/ui/button";
import { MessageCircleIcon, Wand2Icon } from "lucide-react";
import { useState } from "react";
import { useSculptureRegeneration } from "@/hooks/use-sculpture-regeneration";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RegenerationSheet } from "../RegenerationSheet";
import { ChatSheet } from "@/components/chat/ChatSheet";
import { PDFGeneratorButton } from "./components/PDFGeneratorButton";
import { ActionsDropdown } from "./components/ActionsDropdown";
import { RegenerateButton } from "./components/RegenerateButton";
import { useToast } from "@/hooks/use-toast";
import { ProductLineButton } from "./ProductLineButton";
import { supabase } from "@/integrations/supabase/client";
import { ProductLine } from "@/types/product-line";

interface SculptureHeaderProps {
  sculpture: Sculpture;
}

export function SculptureHeader({ sculpture }: SculptureHeaderProps) {
  const { toast } = useToast();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isRegenerationSheetOpen, setIsRegenerationSheetOpen] = useState(false);
  const [isChatSheetOpen, setIsChatSheetOpen] = useState(false);
  const queryClient = useQueryClient();
  const { regenerateImage, generateVariant } = useSculptureRegeneration();

  // Fetch all product lines (global)
  const { data: productLines } = useQuery({
    queryKey: ["product_lines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_lines")
        .select("*");

      if (error) throw error;
      return data as ProductLine[];
    },
  });

  // Fetch current product line if product_line_id exists
  const { data: currentProductLine } = useQuery({
    queryKey: ["product_line", sculpture.product_line_id],
    queryFn: async () => {
      if (!sculpture.product_line_id) return null;

      const { data, error } = await supabase
        .from("product_lines")
        .select("*")
        .eq("id", sculpture.product_line_id)
        .single();

      if (error) throw error;
      return data as ProductLine;
    },
    enabled: !!sculpture.product_line_id,
  });

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      await regenerateImage(sculpture.id);
      await queryClient.invalidateQueries({ queryKey: ["sculpture", sculpture.id] });
      toast({
        title: "Success",
        description: "Image regenerated successfully.",
      });
    } catch (error) {
      console.error("Error regenerating:", error);
      toast({
        title: "Error",
        description: "Failed to regenerate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleDelete = () => {
    if (sculpture) {
      const deleteDialog = document.getElementById(`delete-sculpture-${sculpture.id}`);
      if (deleteDialog instanceof HTMLDialogElement) {
        deleteDialog.showModal();
      }
    }
  };

  const showRegenerateButton = !sculpture.status || sculpture.status === "idea";

  return (
    <div className="flex items-center gap-2">
      <ProductLineButton
        sculptureId={sculpture.id}
        productLineId={sculpture.product_line_id}
        productLines={productLines}
        currentProductLine={currentProductLine}
        variant="large"
      />
      <SculptureStatus
        sculptureId={sculpture.id}
        status={sculpture.status}
      />
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsRegenerationSheetOpen(true)}
      >
        <Wand2Icon className="h-4 w-4" />
      </Button>
      {showRegenerateButton && (
        <RegenerateButton
          onClick={handleRegenerate}
          isRegenerating={isRegenerating}
        />
      )}
      <PDFGeneratorButton
        sculptureId={sculpture.id}
        sculptureName={sculpture.ai_generated_name}
      />
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsChatSheetOpen(true)}
      >
        <MessageCircleIcon className="h-4 w-4" />
      </Button>
      <ActionsDropdown
        imageUrl={sculpture.image_url}
        sculptureName={sculpture.ai_generated_name}
        onDelete={handleDelete}
      />

      <RegenerationSheet
        open={isRegenerationSheetOpen}
        onOpenChange={setIsRegenerationSheetOpen}
        onRegenerate={(options) => generateVariant(sculpture.id, sculpture.user_id, sculpture.prompt, options)}
        isRegenerating={isRegenerating}
        defaultPrompt={sculpture.prompt}
      />

      <ChatSheet
        open={isChatSheetOpen}
        onOpenChange={setIsChatSheetOpen}
        threadId={sculpture.id}
      />
    </div>
  );
}
