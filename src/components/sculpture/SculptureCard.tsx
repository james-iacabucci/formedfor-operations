
import { Card } from "@/components/ui/card";
import { Sculpture } from "@/types/sculpture";
import { useState } from "react";
import { RegenerationSheet } from "./RegenerationSheet";
import { SculptureCardContent } from "./SculptureCardContent";
import { useSculptureRegeneration } from "@/hooks/use-sculpture-regeneration";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SculptureCardProps {
  sculpture: Sculpture;
  tags: Array<{ id: string; name: string }>;
  onDelete: () => void;
  onManageTags: () => void;
  showAIContent?: boolean;
}

export function SculptureCard({
  sculpture,
  tags,
  onDelete,
  onManageTags,
  showAIContent,
}: SculptureCardProps) {
  const [isRegenerationSheetOpen, setIsRegenerationSheetOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { isRegenerating, regenerateImage, generateVariant } = useSculptureRegeneration();

  if (!sculpture?.id) {
    return null;
  }

  const handleDownload = () => {
    if (sculpture?.image_url) {
      const link = document.createElement("a");
      link.href = sculpture.image_url;
      link.download = `${sculpture.ai_generated_name || 'sculpture'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDownloadPDF = async () => {
    if (isGeneratingPDF) return;

    try {
      setIsGeneratingPDF(true);
      toast.loading("Generating PDF...");
      
      const { data: response, error } = await supabase.functions.invoke(
        'generate-sculpture-pdf',
        {
          body: { 
            sculptureId: sculpture.id,
            pricingMode: 'none'
          },
        }
      );

      if (error) throw error;
      if (!response?.data) throw new Error("No PDF data received");

      // Convert base64 to blob
      const byteCharacters = atob(response.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${sculpture.ai_generated_name || 'sculpture'}.pdf`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.dismiss();
      toast.success("PDF generated successfully");
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.dismiss();
      toast.error("Failed to generate PDF", {
        description: "Please try again later"
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <>
      <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer">
        <SculptureCardContent
          sculpture={sculpture}
          tags={tags}
          isRegenerating={isRegenerating}
          showAIContent={showAIContent}
          onDelete={onDelete}
          onManageTags={onManageTags}
          onRegenerate={() => regenerateImage(sculpture.id)}
          onGenerateVariant={() => setIsRegenerationSheetOpen(true)}
          onDownload={handleDownload}
          onDownloadPDF={handleDownloadPDF}
        />
      </Card>

      <RegenerationSheet
        open={isRegenerationSheetOpen}
        onOpenChange={setIsRegenerationSheetOpen}
        onRegenerate={(options) => generateVariant(sculpture.id, sculpture.created_by, sculpture.prompt, options)}
        isRegenerating={isRegenerating(sculpture.id)}
        defaultPrompt={sculpture.prompt}
      />
    </>
  );
}
