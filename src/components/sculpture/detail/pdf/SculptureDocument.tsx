
import { Document, Page, Text, View, Font } from "@react-pdf/renderer";
import { SculptureDocumentProps } from "./types";
import { styles } from "./styles";

// Register fonts
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlvAw.ttf', fontWeight: 700 },
  ],
});

export const SculptureDocument = ({ sculpture }: SculptureDocumentProps) => {
  console.log('SculptureDocument: Starting PDF generation', {
    hasName: !!sculpture.ai_generated_name,
    sculptureId: sculpture.id
  });
  
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.leftSection}>
          {sculpture.image_url && (
            <View style={styles.imageSection}>
              <Text style={styles.subtitle}>Preview Image</Text>
            </View>
          )}
        </View>
        <View style={styles.rightSection}>
          <Text style={styles.title}>
            {sculpture.ai_generated_name || "Untitled Sculpture"}
          </Text>
          <Text style={styles.subtitle}>
            ID: {sculpture.id}
          </Text>
          {sculpture.ai_description && (
            <Text style={styles.description}>
              {sculpture.ai_description}
            </Text>
          )}
          {sculpture.height_in && (
            <Text style={styles.specs}>
              Dimensions: {sculpture.height_in}" × {sculpture.width_in}" × {sculpture.depth_in}"
            </Text>
          )}
          {sculpture.weight_lbs && (
            <Text style={styles.specs}>
              Weight: {sculpture.weight_lbs} lbs
            </Text>
          )}
        </View>
      </Page>
    </Document>
  );
};
