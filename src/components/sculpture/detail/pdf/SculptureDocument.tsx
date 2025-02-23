
import { Document, Page, Text, View } from "@react-pdf/renderer";
import { SculptureDocumentProps } from "./types";
import { styles } from "./styles";

export const SculptureDocument = ({ sculpture }: SculptureDocumentProps) => {
  console.log('SculptureDocument: Starting PDF generation', {
    hasName: !!sculpture.ai_generated_name,
    sculptureId: sculpture.id
  });
  
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.leftSection} />
        <View style={styles.rightSection}>
          <Text style={styles.title}>
            {sculpture.ai_generated_name || "Untitled Sculpture"}
          </Text>
          <Text style={styles.subtitle}>
            ID: {sculpture.id}
          </Text>
        </View>
      </Page>
    </Document>
  );
};
