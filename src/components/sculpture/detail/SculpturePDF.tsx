
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { FileIcon } from "lucide-react";
import { useState } from "react";
import { SculptureDocument } from "./pdf/SculptureDocument";
import { SculpturePDFProps } from "./pdf/types";
import { toast } from "sonner";

export function SculpturePDF({ sculpture }: SculpturePDFProps) {
  return (
    <PDFDownloadLink
      document={<SculptureDocument sculpture={sculpture} />}
      fileName={`${sculpture.ai_generated_name || "sculpture"}.pdf`}
    >
      {({ blob, url, loading, error }) => {
        if (error) {
          console.error('PDF generation error:', error);
          toast.error("Failed to generate PDF");
          return (
            <Button disabled variant="outline" size="sm" className="gap-2">
              <FileIcon className="h-4 w-4" />
              PDF Error
            </Button>
          );
        }

        return (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={loading || !url}
          >
            <FileIcon className="h-4 w-4" />
            {loading ? "Generating PDF..." : "Download Spec Sheet"}
          </Button>
        );
      }}
    </PDFDownloadLink>
  );
}
