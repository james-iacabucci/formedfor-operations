
import { StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
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
    padding: 60,
    display: 'flex',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  logo: {
    width: 120,
    marginBottom: 40,
  },
  title: {
    fontSize: 48,
    marginBottom: 20,
    fontFamily: 'Helvetica',
    textAlign: 'center',
  },
  material: {
    fontSize: 20,
    color: '#333',
    marginBottom: 30,
    fontFamily: 'Helvetica',
    textAlign: 'center',
  },
  pricing: {
    fontSize: 18,
    marginBottom: 30,
    fontFamily: 'Helvetica',
    textAlign: 'center',
  },
  dimensions: {
    fontSize: 18,
    marginBottom: 40,
    fontFamily: 'Helvetica',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 1.6,
    marginBottom: 40,
    textAlign: 'center',
    fontFamily: 'Helvetica',
    paddingLeft: 40,
    paddingRight: 40,
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    fontFamily: 'Helvetica',
  },
});
