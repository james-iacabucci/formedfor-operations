
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { PaperclipIcon, SendIcon } from "lucide-react";

interface MessageInputProps {
  threadId: string;
}

export function MessageInput({ threadId }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("chat_messages")
        .insert({
          thread_id: threadId,
          content: content.trim(),
          user_id: user.data.user.id,
        });

      if (error) throw error;

      setContent("");
      queryClient.invalidateQueries({ queryKey: ["messages", threadId] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 border-t">
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          className="shrink-0"
          onClick={() => {
            toast({
              title: "Coming soon",
              description: "File attachments will be available soon.",
            });
          }}
        >
          <PaperclipIcon className="h-4 w-4" />
        </Button>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          className="min-h-[2.5rem] max-h-32"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <Button 
          variant="default"
          size="icon"
          className="shrink-0"
          disabled={isSubmitting || !content.trim()}
          onClick={handleSubmit}
        >
          <SendIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
