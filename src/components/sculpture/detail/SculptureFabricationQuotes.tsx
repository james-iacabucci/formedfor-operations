
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { FabricationQuoteCard } from "./FabricationQuoteCard";
import { FabricationQuoteForm } from "./FabricationQuoteForm";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FabricationQuote } from "@/types/fabrication-quote";

interface SculptureFabricationQuotesProps {
  sculptureId: string;
}

export function SculptureFabricationQuotes({ sculptureId }: SculptureFabricationQuotesProps) {
  const [isAddingQuote, setIsAddingQuote] = useState(false);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);

  const { data: quotes, isLoading } = useQuery({
    queryKey: ["fabrication-quotes", sculptureId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fabrication_quotes")
        .select("*")
        .eq("sculpture_id", sculptureId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as FabricationQuote[];
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fabrication Quotes</CardTitle>
        <CardDescription>
          Get quotes for fabricating this sculpture in different materials
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAddingQuote || editingQuoteId ? (
          <FabricationQuoteForm 
            sculptureId={sculptureId}
            editingQuoteId={editingQuoteId}
            onCancel={() => {
              setIsAddingQuote(false);
              setEditingQuoteId(null);
            }}
            onSuccess={() => {
              setIsAddingQuote(false);
              setEditingQuoteId(null);
            }}
          />
        ) : (
          <>
            {quotes && quotes.length > 0 ? (
              <div className="space-y-4">
                {quotes.map((quote) => (
                  <FabricationQuoteCard 
                    key={quote.id} 
                    quote={quote} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No quotes yet
              </div>
            )}
          </>
        )}
      </CardContent>
      <CardFooter>
        {!isAddingQuote && !editingQuoteId && (
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => setIsAddingQuote(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Quote
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
