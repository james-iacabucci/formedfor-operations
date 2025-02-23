
import { usePDF } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { FileIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { SculptureDocument } from "./pdf/SculptureDocument";
import { SculpturePDFProps } from "./pdf/types";
import { toast } from "sonner";

export function SculpturePDF({ sculpture }: SculpturePDFProps) {
  const [instance, updateInstance] = usePDF({ document: <SculptureDocument sculpture={sculpture} /> });

  useEffect(() => {
    if (instance.error) {
      console.error('PDF generation error:', instance.error);
      toast.error("Failed to generate PDF");
    }
  }, [instance.error]);

  const handleDownload = () => {
    if (!instance.url) return;
    
    const link = document.createElement('a');
    link.href = instance.url;
    link.download = `${sculpture.ai_generated_name || "sculpture"}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2"
      disabled={instance.loading || !instance.url}
      onClick={handleDownload}
    >
      <FileIcon className="h-4 w-4" />
      {instance.loading ? "Generating PDF..." : "Download Spec Sheet"}
    </Button>
  );
}
