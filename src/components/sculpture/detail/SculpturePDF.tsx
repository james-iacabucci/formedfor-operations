
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { FileIcon } from "lucide-react";
import { Sculpture } from "@/types/sculpture";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
    padding: 40,
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  logo: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    marginBottom: 20,
    fontFamily: 'Helvetica',
  },
  material: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    fontFamily: 'Helvetica',
  },
  pricing: {
    fontSize: 16,
    marginBottom: 30,
    fontFamily: 'Helvetica',
  },
  dimensions: {
    fontSize: 16,
    marginBottom: 30,
    fontFamily: 'Helvetica',
  },
  description: {
    fontSize: 14,
    lineHeight: 1.5,
    marginBottom: 40,
    textAlign: 'center',
    fontFamily: 'Helvetica',
  },
  footer: {
    fontSize: 14,
    color: '#666',
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
}

const SculptureDocument = ({ sculpture, materialName, selectedQuote }: SculptureDocumentProps) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.leftSection}>
        {sculpture.image_url && (
          <Image src={sculpture.image_url} style={styles.image} />
        )}
      </View>
      <View style={styles.rightSection}>
        <Image src="/lovable-uploads/b3dc8e74-9575-4573-9428-2a7b2fcd3c22.png" style={styles.logo} />
        
        <Text style={styles.title}>
          {sculpture.ai_generated_name || "Untitled Sculpture"}
        </Text>
        
        <Text style={styles.material}>
          {materialName || "Material not specified"}
        </Text>

        <Text style={styles.pricing}>
          {selectedQuote 
            ? `Trade $${selectedQuote.tradePrice.toLocaleString()}   /   Retail $${selectedQuote.retailPrice.toLocaleString()}`
            : "Pricing Upon Request"}
        </Text>

        <Text style={styles.dimensions}>
          {sculpture.height_in && sculpture.width_in && sculpture.depth_in
            ? `${sculpture.height_in} - ${sculpture.width_in} - ${sculpture.depth_in} (in) | ${
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

export function SculpturePDF({ sculpture, materialName }: SculpturePDFProps) {
  // Fetch selected quote for the sculpture
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

  return (
    <PDFDownloadLink
      document={
        <SculptureDocument 
          sculpture={sculpture} 
          materialName={materialName} 
          selectedQuote={selectedQuote}
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
