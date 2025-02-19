
import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import { SculptureDocumentProps } from "./types";
import { styles } from "./styles";

export const SculptureDocument = ({ 
  sculpture, 
  materialName, 
  selectedQuote,
  logoBase64,
  sculptureImageBase64 
}: SculptureDocumentProps) => {
  console.log('SculptureDocument: Starting render');
  
  if (!logoBase64?.startsWith('data:image/')) {
    console.error('SculptureDocument: Invalid logo format');
    throw new Error('Invalid logo format');
  }
  
  if (!sculptureImageBase64?.startsWith('data:image/')) {
    console.error('SculptureDocument: Invalid sculpture image format');
    throw new Error('Invalid sculpture image format');
  }

  console.log('SculptureDocument: Images validated, proceeding with render');

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.leftSection}>
          <Image src={sculptureImageBase64} style={styles.image} />
        </View>
        <View style={styles.rightSection}>
          <Image src={logoBase64} style={styles.logo} />
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
