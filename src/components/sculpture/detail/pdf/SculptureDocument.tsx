
import { Document, Page, Text, View, pdf } from "@react-pdf/renderer";
import { SculptureDocumentProps } from "./types";
import { styles } from "./styles";

// Force pdf worker initialization
pdf.initWorker();

export const SculptureDocument = ({ sculpture }: SculptureDocumentProps) => {
  console.log('SculptureDocument: Attempting to render PDF');
  
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.leftSection} />
        <View style={styles.rightSection}>
          <Text style={styles.title}>
            {sculpture.ai_generated_name || "Untitled Sculpture"}
          </Text>
        </View>
      </Page>
    </Document>
  );
};
