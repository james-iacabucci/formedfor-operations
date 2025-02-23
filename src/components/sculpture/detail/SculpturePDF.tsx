
import { BlobProvider } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { FileIcon } from "lucide-react";
import { SculptureDocument } from "./pdf/SculptureDocument";
import { SculpturePDFProps } from "./pdf/types";

export function SculpturePDF({ sculpture }: SculpturePDFProps) {
  return (
    <BlobProvider document={<SculptureDocument sculpture={sculpture} />}>
      {({ blob, url, loading, error }) => {
        if (error) {
          console.error('PDF generation error:', error);
          return (
            <Button disabled variant="outline" size="sm" className="gap-2">
              <FileIcon className="h-4 w-4" />
              PDF Error
            </Button>
          );
        }

        if (loading || !url) {
          return (
            <Button disabled variant="outline" size="sm" className="gap-2">
              <FileIcon className="h-4 w-4" />
              Generating PDF...
            </Button>
          );
        }

        return (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            asChild
          >
            <a
              href={url}
              download={`${sculpture.ai_generated_name || "sculpture"}.pdf`}
            >
              <FileIcon className="h-4 w-4" />
              Download Spec Sheet
            </a>
          </Button>
        );
      }}
    </BlobProvider>
  );
}
