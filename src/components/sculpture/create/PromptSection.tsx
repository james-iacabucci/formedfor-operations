
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2Icon, RefreshCwIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface PromptSectionProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  isPromptUpdated: boolean;
}

export function PromptSection({ 
  prompt, 
  onPromptChange, 
  isPromptUpdated 
}: PromptSectionProps) {
  const [isImproving, setIsImproving] = useState(false);

  const improvePrompt = async () => {
    if (!prompt.trim()) return;

    setIsImproving(true);
    try {
      const { data, error } = await supabase.functions.invoke('improve-prompt', {
        body: { prompt: prompt.trim() }
      });

      if (error) throw error;

      if (data?.improvedPrompt) {
        onPromptChange(data.improvedPrompt);
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
          disabled={isImproving || !prompt.trim()}
          className="h-8 px-2"
        >
          {isImproving ? (
            <>
              <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
              Improving...
            </>
          ) : (
            <>
              <RefreshCwIcon className="h-4 w-4 mr-2" />
              Improve Prompt
            </>
          )}
        </Button>
      </div>
      <Textarea
        id="prompt"
        placeholder="Describe your sculpture..."
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        className={cn(
          "min-h-[80px] resize-y transition-colors duration-300",
          isPromptUpdated && "bg-green-50 dark:bg-green-900/20"
        )}
        rows={3}
      />
    </div>
  );
}
