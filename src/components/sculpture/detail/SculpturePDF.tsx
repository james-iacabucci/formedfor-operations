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

interface SculpturePDFProps {
  sculpture: Sculpture;
  materialName?: string;
}

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
}: SculptureDocumentProps) => {
  console.log('SculptureDocument: Starting render');
  
  if (!logoBase64?.startsWith('data:image') && !logoBase64?.match(/^[A-Za-z0-9+/]+={0,2}$/)) {
    console.error('SculptureDocument: Invalid logo base64 format');
    throw new Error('Invalid logo format');
  }
  
  if (!sculptureImageBase64?.startsWith('data:image') && !sculptureImageBase64?.match(/^[A-Za-z0-9+/]+={0,2}$/)) {
    console.error('SculptureDocument: Invalid sculpture image base64 format');
    throw new Error('Invalid sculpture image format');
  }

  console.log('SculptureDocument: Images validated, proceeding with render');

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.leftSection}>
          <Image src={`data:image/jpeg;base64,${sculptureImageBase64}`} style={styles.image} />
        </View>
        <View style={styles.rightSection}>
          <Image src={`data:image/png;base64,${logoBase64}`} style={styles.logo} />
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
              ? `${sculpture.height_in}" × ${sculpture.width_in}" × ${sculpture.depth_in}"`
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
};

async function convertImageUrlToBase64(url: string): Promise<string> {
  console.log('convertImageUrlToBase64: Starting fetch for:', url);
  
  try {
    const response = await fetch(url, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error('Fetch failed:', {
        status: response.status,
        statusText: response.statusText,
        url: url
      });
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type');
    console.log('Image content type:', contentType);
    
    const blob = await response.blob();
    console.log('Blob received:', {
      size: blob.size,
      type: blob.type
    });
    
    if (blob.size === 0) {
      console.error('Empty blob received');
      throw new Error('Retrieved empty image blob');
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          const base64Data = reader.result as string;
          const base64Match = base64Data.match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/);
          
          if (!base64Match) {
            console.error('Invalid base64 image data format');
            reject(new Error('Invalid base64 image data format'));
            return;
          }
          
          const base64Content = base64Match[2];
          console.log('Base64 conversion successful:', {
            contentLength: base64Content.length,
            startsWidth: base64Content.substring(0, 20) + '...',
            endsWidth: '...' + base64Content.substring(base64Content.length - 20)
          });
          
          resolve(base64Content);
        } catch (error) {
          console.error('Error processing base64 data:', error);
          reject(error);
        }
      };
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        reject(error);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error in convertImageUrlToBase64:', error);
    throw error;
  }
}

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
