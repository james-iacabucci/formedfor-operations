
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2Icon, Wand2Icon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface PromptFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function PromptField({ value, onChange }: PromptFieldProps) {
  const [isImproving, setIsImproving] = useState(false);

  const improvePrompt = async () => {
    if (!value.trim()) return;

    setIsImproving(true);
    try {
      const { data, error } = await supabase.functions.invoke('improve-prompt', {
        body: { prompt: value.trim() }
      });

      if (error) throw error;

      if (data?.improvedPrompt) {
        onChange(data.improvedPrompt);
        toast({
          title: "Prompt Improved",
          description: "Your prompt has been enhanced for better results.",
        });
      }
    } catch (error) {
      console.error('Error improving prompt:', error);
      toast({
        title: "Error",
        description: "Could not improve prompt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsImproving(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="prompt">Prompt</Label>
        <Button
          variant="ghost"
          size="sm"
          onClick={improvePrompt}
          disabled={isImproving || !value.trim()}
          className="h-8 px-2"
        >
          {isImproving ? (
            <>
              <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
              Improving...
            </>
          ) : (
            <>
              <Wand2Icon className="h-4 w-4 mr-2" />
              Improve Prompt
            </>
          )}
        </Button>
      </div>
      <Textarea
        id="prompt"
        placeholder="Describe your sculpture..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[80px] resize-y"
        rows={3}
      />
    </div>
  );
}
