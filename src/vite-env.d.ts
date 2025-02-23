
/// <reference types="vite/client" />

declare module '@react-pdf/renderer' {
  import { ComponentType, ReactElement, ReactNode } from 'react';

  export interface DocumentProps {
    children?: ReactNode;
  }

  export interface PageProps {
    size?: string;
    orientation?: string;
    style?: any;
    children?: ReactNode;
  }

  export interface ViewProps {
    style?: any;
    children?: ReactNode;
  }

  export interface TextProps {
    style?: any;
    children?: ReactNode;
  }

  export interface ImageProps {
    src: string;
    style?: any;
  }

  export interface PDFViewerProps {
    width?: number | string;
    height?: number | string;
    style?: any;
    children?: ReactNode;
  }

  export interface PDFDownloadLinkProps {
    document: ReactElement;
    fileName?: string;
    children?: (props: { loading: boolean; error?: Error }) => ReactNode;
  }

  export interface FontRegisterOptions {
    family: string;
    fonts: Array<{
      src: string;
      fontWeight?: number;
      fontStyle?: string;
    }>;
  }

  export const Document: ComponentType<DocumentProps>;
  export const Page: ComponentType<PageProps>;
  export const View: ComponentType<ViewProps>;
  export const Text: ComponentType<TextProps>;
  export const Image: ComponentType<ImageProps>;
  export const PDFViewer: ComponentType<PDFViewerProps>;
  export const PDFDownloadLink: ComponentType<PDFDownloadLinkProps>;
  export const StyleSheet: {
    create: <T extends { [key: string]: any }>(styles: T) => T;
  };
  export const Font: {
    register: (options: FontRegisterOptions) => void;
  };
}
