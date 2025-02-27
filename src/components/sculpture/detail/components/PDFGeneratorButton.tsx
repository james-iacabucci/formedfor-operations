
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileIcon, Loader2Icon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

interface PDFGeneratorButtonProps {
  sculptureId: string;
  sculptureName?: string;
}

export function PDFGeneratorButton({ sculptureId, sculptureName }: PDFGeneratorButtonProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const generatePDF = async (pricingMode: 'none' | 'trade' | 'retail') => {
    if (isGeneratingPDF) return;

    try {
      setIsGeneratingPDF(true);
      toast.loading("Generating PDF...");
      console.log("Starting PDF generation for sculpture:", sculptureId, "with pricing mode:", pricingMode);
      
      const { data: response, error } = await supabase.functions.invoke(
        'generate-sculpture-pdf',
        {
          body: { 
            sculptureId,
            pricingMode
          },
        }
      );

      console.log("Edge function response:", { data: response, error });

      if (error) throw error;
      if (!response?.data) throw new Error("No PDF data received");

      toast.dismiss();
      
      // Convert base64 to blob
      const byteCharacters = atob(response.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${sculptureName || 'sculpture'}.pdf`);
      
      console.log("Created download link:", url);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("PDF generated successfully");
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.dismiss();
      toast.error("Failed to generate PDF", {
        description: "Please try again later"
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          disabled={isGeneratingPDF}
          className="relative"
        >
          {isGeneratingPDF ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            <FileIcon className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            generatePDF('none');
          }}
        >
          No Pricing
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            generatePDF('trade');
          }}
        >
          Trade Pricing
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            generatePDF('retail');
          }}
        >
          Trade & Retail Pricing
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
