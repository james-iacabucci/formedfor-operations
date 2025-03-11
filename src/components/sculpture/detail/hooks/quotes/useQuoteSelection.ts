
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useQuoteSelection(refetchQuotes: () => Promise<void>) {
  const { toast } = useToast();

  const handleSelectQuote = useCallback(async (quoteId: string) => {
    const { error } = await supabase
      .from("fabrication_quotes")
      .update({ is_selected: true })
      .eq("id", quoteId);

    if (error) {
      console.error("Error selecting quote:", error);
      toast({
        title: "Error",
        description: "Failed to select quote. Please try again.",
        variant: "destructive",
      });
      return;
    }

    // Refresh quotes after selection
    refetchQuotes();
    
    toast({
      title: "Quote Selected",
      description: "The fabrication quote has been selected.",
    });
  }, [refetchQuotes, toast]);

  return { handleSelectQuote };
}
