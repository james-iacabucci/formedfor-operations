
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { FileIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { SculptureDocument } from "./pdf/SculptureDocument";
import { convertImageUrlToBase64 } from "./pdf/imageUtils";
import { SculpturePDFProps } from "./pdf/types";

export function SculpturePDF({ sculpture, materialName }: SculpturePDFProps) {
  const [logoBase64, setLogoBase64] = useState<string>();
  const [sculptureImageBase64, setSculptureImageBase64] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadImages = async () => {
      try {
        console.log('loadImages: Starting image loading process');
        setIsLoading(true);
        setError(null);
        
        const logoUrl = `${window.location.origin}/lovable-uploads/96d92d6a-1130-494a-9059-caa66e10cdd8.png`;
        console.log('Loading logo from:', logoUrl);
        const logoBase64Data = await convertImageUrlToBase64(logoUrl);
        setLogoBase64(logoBase64Data);
        console.log('Logo loaded successfully');

        if (!sculpture.image_url) {
          throw new Error('No sculpture image URL provided');
        }
        console.log('Loading sculpture image from:', sculpture.image_url);
        const sculptureBase64Data = await convertImageUrlToBase64(sculpture.image_url);
        setSculptureImageBase64(sculptureBase64Data);
        console.log('Sculpture image loaded successfully');

      } catch (error) {
        console.error('Error in loadImages:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    loadImages();
  }, [sculpture.image_url]);

  const { data: selectedQuote } = useQuery({
    queryKey: ["selected_quote", sculpture.id],
    queryFn: async () => {
      const { data: quotes, error } = await supabase
        .from("fabrication_quotes")
        .select("*")
        .eq("sculpture_id", sculpture.id)
        .eq("is_selected", true)
        .single();

      if (error) return null;
      if (!quotes) return null;

      const total = quotes.fabrication_cost + 
                   quotes.shipping_cost + 
                   quotes.customs_cost + 
                   quotes.other_cost;
      
      const tradePrice = total * quotes.markup;
      const retailPrice = tradePrice * 1.5;

      return {
        tradePrice,
        retailPrice
      };
    }
  });

  if (error) {
    return (
      <Button disabled variant="outline" size="sm" className="gap-2">
        <FileIcon className="h-4 w-4" />
        Error: {error}
      </Button>
    );
  }

  if (isLoading || !logoBase64 || !sculptureImageBase64) {
    return (
      <Button disabled variant="outline" size="sm" className="gap-2">
        <FileIcon className="h-4 w-4" />
        Loading images...
      </Button>
    );
  }

  return (
    <PDFDownloadLink
      document={
        <SculptureDocument 
          sculpture={sculpture} 
          materialName={materialName} 
          selectedQuote={selectedQuote}
          logoBase64={logoBase64}
          sculptureImageBase64={sculptureImageBase64}
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
