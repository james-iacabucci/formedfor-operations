
import { Document, Page, Text, View } from "@react-pdf/renderer";
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
  
  // Validation moved after return to prevent early exit
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.leftSection}>
        </View>
        <View style={styles.rightSection}>
          <Text style={styles.title}>
            {sculpture.ai_generated_name || "Untitled Sculpture"}
          </Text>
        </View>
      </Page>
    </Document>
  );
};
