
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { FileIcon } from "lucide-react";
import { useState } from "react";
import { SculptureDocument } from "./pdf/SculptureDocument";
import { SculpturePDFProps } from "./pdf/types";

export function SculpturePDF({ sculpture }: SculpturePDFProps) {
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return (
      <Button disabled variant="outline" size="sm" className="gap-2">
        <FileIcon className="h-4 w-4" />
        PDF Error
      </Button>
    );
  }

  return (
    <PDFDownloadLink
      document={<SculptureDocument sculpture={sculpture} />}
      fileName={`${sculpture.ai_generated_name || "sculpture"}.pdf`}
    >
      {({ loading, error }) => {
        if (error) {
          console.error('PDF generation error:', error);
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
            disabled={loading}
          >
            <FileIcon className="h-4 w-4" />
            {loading ? "Generating PDF..." : "Download Spec Sheet"}
          </Button>
        );
      }}
    </PDFDownloadLink>
  );
}
