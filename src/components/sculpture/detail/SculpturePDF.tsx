
import { Button } from "@/components/ui/button";
import { FileIcon } from "lucide-react";
import { SculpturePDFProps } from "./pdf/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

export function SculpturePDF({ sculpture }: SculpturePDFProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-sculpture-pdf', {
        body: { sculptureId: sculpture.id }
      });

      if (error) {
        console.error('PDF generation error:', error);
        throw error;
      }

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
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("PDF generated successfully");
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2"
      onClick={handleDownload}
      disabled={isGenerating}
    >
      <FileIcon className="h-4 w-4" />
      {isGenerating ? "Generating PDF..." : "Download Spec Sheet"}
    </Button>
  );
}
