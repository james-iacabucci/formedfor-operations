
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function AIContextSection() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [aiContext, setAiContext] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  // Fetch current AI context
  const { data: userPreferences, isLoading } = useQuery({
    queryKey: ["user_preferences", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("user_preferences")
        .select("settings")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Save AI context mutation
  const saveAiContextMutation = useMutation({
    mutationFn: async (context: string) => {
      if (!user) return;
      
      const { data: existingPrefs } = await supabase
        .from("user_preferences")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (existingPrefs) {
        // Update existing preferences
        const { error } = await supabase
          .from("user_preferences")
          .update({ 
            settings: { 
              ...userPreferences?.settings, 
              ai_context: context 
            } 
          })
          .eq("user_id", user.id);
        
        if (error) throw error;
      } else {
        // Create new preferences record
        const { error } = await supabase
          .from("user_preferences")
          .insert({ 
            user_id: user.id, 
            settings: { ai_context: context }
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_preferences"] });
      toast.success("AI context saved");
    },
    onError: (error) => {
      console.error("Error saving AI context:", error);
      toast.error("Failed to save AI context");
    },
  });

  // Initialize AI context from fetched data
  useEffect(() => {
    if (userPreferences?.settings) {
      setAiContext(userPreferences.settings.ai_context || "");
    }
  }, [userPreferences]);

  // Handle context change with debounce
  const handleAiContextChange = (value: string) => {
    setAiContext(value);
    setIsTyping(true);
    
    // Clear any existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set a new timeout to save after user stops typing
    const timeout = setTimeout(() => {
      setIsTyping(false);
      saveAiContextMutation.mutate(value);
    }, 1000); // Wait 1 second after typing stops
    
    setTypingTimeout(timeout);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">AI Generation</h3>
      <Separator />
      <div className="space-y-2">
        <Label htmlFor="ai-context">Default AI Context</Label>
        <p className="text-xs italic text-muted-foreground">
          This context will be automatically included in all your AI image generation prompts
        </p>
        <Textarea
          id="ai-context"
          value={aiContext}
          onChange={(e) => handleAiContextChange(e.target.value)}
          placeholder="Enter your default AI image generation context..."
          className="min-h-[120px]"
          disabled={isLoading || saveAiContextMutation.isPending}
        />
        {isTyping && (
          <p className="text-xs text-muted-foreground">Typing...</p>
        )}
        {saveAiContextMutation.isPending && !isTyping && (
          <p className="text-xs text-muted-foreground">Saving...</p>
        )}
      </div>
    </div>
  );
}
