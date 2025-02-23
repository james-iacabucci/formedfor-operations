
import { Sculpture } from "@/types/sculpture";

export interface SculpturePDFProps {
  sculpture: Sculpture;
  materialName?: string;
}

export interface SculptureDocumentProps {
  sculpture: Sculpture;
  materialName?: string;
  selectedQuote?: {
    tradePrice: number;
    retailPrice: number;
  } | null;
  logoBase64?: string;
  sculptureImageBase64?: string;
}
