
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
  },
  rightSection: {
    width: '50%',
    padding: 40,
    display: 'flex',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontFamily: 'Helvetica',
    textAlign: 'center',
  },
});
