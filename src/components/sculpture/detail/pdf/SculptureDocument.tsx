import { Document, Page, Text, View } from "@react-pdf/renderer";
import { SculptureDocumentProps } from "./types";
import { styles } from "./styles";

export const SculptureDocument = ({ 
  sculpture,
}: SculptureDocumentProps) => {
  console.log('SculptureDocument: Starting render with minimal content');
  
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.leftSection}>
          {/* Temporarily removed image */}
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
