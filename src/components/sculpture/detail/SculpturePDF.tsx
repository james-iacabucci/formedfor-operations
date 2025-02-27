
import { Button } from "@/components/ui/button";
import { FileIcon } from "lucide-react";
import { SculpturePDFProps } from "./pdf/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useState, useCallback } from "react";

export function SculpturePDF({ sculpture }: SculpturePDFProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  // Add immediate console log to verify component mounting
  console.log("SculpturePDF component mounted with sculpture:", sculpture);

  const generatePDF = useCallback(async () => {
    try {
      if (isGenerating) return;
      
      setIsGenerating(true);
      toast.loading("Generating PDF...");
      
      console.log("Starting PDF generation for sculpture:", sculpture.id);
      
      const { data, error } = await supabase.functions.invoke(
        'generate-sculpture-pdf',
        {
          body: { sculptureId: sculpture.id },
        }
      );

      console.log("Edge function response:", { data, error });

      if (error) {
        throw error;
      }

      toast.dismiss();
      
      // Convert base64 to blob
      const byteCharacters = atob(data as string);
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
      
      console.log("Created download link:", url);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("PDF generated successfully");
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.dismiss();
      toast.error("Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  }, [sculpture, isGenerating]);

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("PDF button clicked");
    generatePDF();
  };

  return (
    <div className="relative z-50 bg-transparent p-1">
      <Button
        variant="outline"
        size="default"
        className="flex items-center gap-2"
        onClick={handleButtonClick}
        disabled={isGenerating}
      >
        <FileIcon className="h-4 w-4" />
        <span>{isGenerating ? "Generating PDF..." : "Download Spec Sheet"}</span>
      </Button>
    </div>
  );
}
