
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useQuoteDeletion(refetchQuotes: () => Promise<void>) {
  const { toast } = useToast();

  const handleDeleteQuote = useCallback(async (quoteId: string) => {
    const { error } = await supabase
      .from("fabrication_quotes")
      .delete()
      .eq("id", quoteId);

    if (error) {
      console.error("Error deleting quote:", error);
      toast({
        title: "Error",
        description: "Failed to delete quote: " + error.message,
        variant: "destructive",
      });
      return;
    }

    // Refetch quotes after deletion
    refetchQuotes();
    
    toast({
      title: "Success",
      description: "Quote deleted successfully",
    });
  }, [refetchQuotes, toast]);

  return { handleDeleteQuote };
}
