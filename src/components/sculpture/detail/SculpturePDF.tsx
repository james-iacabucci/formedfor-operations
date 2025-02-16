
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { FileIcon } from "lucide-react";
import { Sculpture } from "@/types/sculpture";

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
}

const SculptureDocument = ({ sculpture, materialName }: SculptureDocumentProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
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
          Trade ${(79800).toLocaleString()}   /   Retail ${(123000).toLocaleString()}
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
  return (
    <PDFDownloadLink
      document={<SculptureDocument sculpture={sculpture} materialName={materialName} />}
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
