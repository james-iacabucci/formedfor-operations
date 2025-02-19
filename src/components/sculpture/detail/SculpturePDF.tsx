
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { FileIcon } from "lucide-react";
import { Sculpture } from "@/types/sculpture";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 0,
  },
  leftSection: {
    width: '50%',
  },
  rightSection: {
    width: '50%',
    padding: 60,
    display: 'flex',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  logo: {
    width: 120,
    marginBottom: 40,
  },
  title: {
    fontSize: 48,
    marginBottom: 20,
    fontFamily: 'Helvetica',
    textAlign: 'center',
  },
  material: {
    fontSize: 20,
    color: '#333',
    marginBottom: 30,
    fontFamily: 'Helvetica',
    textAlign: 'center',
  },
  pricing: {
    fontSize: 18,
    marginBottom: 30,
    fontFamily: 'Helvetica',
    textAlign: 'center',
  },
  dimensions: {
    fontSize: 18,
    marginBottom: 40,
    fontFamily: 'Helvetica',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 1.6,
    marginBottom: 40,
    textAlign: 'center',
    fontFamily: 'Helvetica',
    paddingLeft: 40,
    paddingRight: 40,
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    fontFamily: 'Helvetica',
  },
});

interface SculptureDocumentProps {
  sculpture: Sculpture;
  materialName?: string;
  selectedQuote?: {
    tradePrice: number;
    retailPrice: number;
  } | null;
  logoBase64?: string;
  sculptureImageBase64?: string;
}

const SculptureDocument = ({ 
  sculpture, 
  materialName, 
  selectedQuote,
  logoBase64,
  sculptureImageBase64 
}: SculptureDocumentProps) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.leftSection}>
        {sculptureImageBase64 && (
          <Image src={sculptureImageBase64} style={styles.image} />
        )}
      </View>
      <View style={styles.rightSection}>
        {logoBase64 && (
          <Image 
            src={logoBase64}
            style={styles.logo} 
          />
        )}
        
        <Text style={styles.title}>
          {sculpture.ai_generated_name || "Untitled Sculpture"}
        </Text>
        
        <Text style={styles.material}>
          {materialName || "Material not specified"}
        </Text>

        {selectedQuote ? (
          <Text style={styles.pricing}>
            Trade ${selectedQuote.tradePrice.toLocaleString()} / Retail ${selectedQuote.retailPrice.toLocaleString()}
          </Text>
        ) : (
          <Text style={styles.pricing}>
            Pricing Upon Request
          </Text>
        )}

        <Text style={styles.dimensions}>
          {sculpture.height_in && sculpture.width_in && sculpture.depth_in
            ? `Height: ${sculpture.height_in} - ${sculpture.width_in} - ${sculpture.depth_in} (in) | ${
                Math.round(sculpture.height_in * 2.54)
              } - ${Math.round(sculpture.width_in * 2.54)} - ${
                Math.round(sculpture.depth_in * 2.54)
              } (cm)`
            : "Dimensions not specified"}
        </Text>

        <Text style={styles.description}>
          {sculpture.ai_description || sculpture.prompt || "No description available"}
        </Text>

        <Text style={styles.footer}>
          LIMITED EDITION OF 33{"\n"}
          (available in multiple finishes and sizes)
        </Text>
      </View>
    </Page>
  </Document>
);

interface SculpturePDFProps {
  sculpture: Sculpture;
  materialName?: string;
}

async function convertImageUrlToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
}

export function SculpturePDF({ sculpture, materialName }: SculpturePDFProps) {
  const [logoBase64, setLogoBase64] = useState<string>();
  const [sculptureImageBase64, setSculptureImageBase64] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadImages = async () => {
      try {
        setIsLoading(true);
        
        // Convert logo
        const logoUrl = new URL(
          '/lovable-uploads/96d92d6a-1130-494a-9059-caa66e10cdd8.png',
          window.location.origin
        ).href;
        const logoBase64Data = await convertImageUrlToBase64(logoUrl);
        setLogoBase64(logoBase64Data);

        // Convert sculpture image if available
        if (sculpture.image_url) {
          const sculptureBase64Data = await convertImageUrlToBase64(sculpture.image_url);
          setSculptureImageBase64(sculptureBase64Data);
        }
      } catch (error) {
        console.error('Error loading images:', error);
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

      if (error) {
        console.error("Error fetching selected quote:", error);
        return null;
      }

      if (!quotes) return null;

      const total = quotes.fabrication_cost + 
                   quotes.shipping_cost + 
                   quotes.customs_cost + 
                   quotes.other_cost;
      
      const tradePrice = total * quotes.markup;
      const retailPrice = tradePrice * 1.5; // 50% markup for retail

      return {
        tradePrice,
        retailPrice
      };
    }
  });

  if (isLoading) {
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
      {({ loading }) => (
        <Button disabled={loading} variant="outline" size="sm" className="gap-2">
          <FileIcon className="h-4 w-4" />
          {loading ? "Generating PDF..." : "Download PDF"}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
