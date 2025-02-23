
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
        Error: {error}
      </Button>
    );
  }

  return (
    <PDFDownloadLink
      document={
        <SculptureDocument 
          sculpture={sculpture}
        />
      }
      fileName={`${sculpture.ai_generated_name || "sculpture"}.pdf`}
    >
      {({ loading, error }) => {
        if (error) {
          console.error('PDFDownloadLink error:', {
            message: error.message,
            stack: error.stack
          });
          return (
            <Button disabled variant="outline" size="sm" className="gap-2">
              <FileIcon className="h-4 w-4" />
              PDF Error: {error.message}
            </Button>
          );
        }
        return (
          <Button disabled={loading} variant="outline" size="sm" className="gap-2">
            <FileIcon className="h-4 w-4" />
            {loading ? "Generating PDF..." : "Download PDF"}
          </Button>
        );
      }}
    </PDFDownloadLink>
  );
}
