
import { StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 0,
  },
  leftSection: {
    width: '50%',
    backgroundColor: '#F8F8F8',
    padding: 40,
  },
  rightSection: {
    width: '50%',
    padding: 40,
    display: 'flex',
    gap: 10,
  },
  imageSection: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontFamily: 'Helvetica',
    fontWeight: 700,
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 10,
    fontFamily: 'Helvetica',
    color: '#666666',
  },
  description: {
    fontSize: 12,
    marginBottom: 20,
    fontFamily: 'Helvetica',
    lineHeight: 1.5,
  },
  specs: {
    fontSize: 12,
    fontFamily: 'Helvetica',
    marginBottom: 8,
  }
});
