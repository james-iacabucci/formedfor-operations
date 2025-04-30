
import { FileIcon, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ChatHeaderProps {
  threadId: string;
  activeView: "chat" | "files";
  onViewChange: (view: "chat" | "files") => void;
  onClose?: () => void;
  quoteMode?: boolean;
  sculptureId?: string;
}

export function ChatHeader({
  threadId,
  activeView,
  onViewChange,
  onClose,
  quoteMode = false,
  sculptureId
}: ChatHeaderProps) {
  const { data: threadInfo, isLoading } = useQuery({
    queryKey: ["thread-info", threadId, sculptureId],
    queryFn: async () => {
      if (!threadId) return null;

      const { data, error } = await supabase
        .from("chat_threads")
        .select(`
          id,
          topic,
          sculpture_id,
          fabrication_quote_id,
          variant_id
        `)
        .eq("id", threadId)
        .single();

      if (error) {
        console.error("Error fetching thread info:", error);
        return null;
      }

      return data;
    },
  });

  // Get sculpture info if sculptureId is provided
  const { data: sculptureInfo } = useQuery({
    queryKey: ["sculpture-chat-info", sculptureId],
    queryFn: async () => {
      if (!sculptureId) return null;
      
      const { data, error } = await supabase
        .from("sculptures")
        .select("ai_generated_name")
        .eq("id", sculptureId)
        .single();
      
      if (error) {
        console.error("Error fetching sculpture info:", error);
        return null;
      }
      
      return data;
    },
    enabled: !!sculptureId
  });

  // Determine the title of the chat
  const title = isLoading 
    ? "Loading..." 
    : quoteMode 
      ? "Quote Chat" 
      : sculptureInfo?.ai_generated_name
        ? `${sculptureInfo.ai_generated_name} Chat`
        : "Sculpture Chat";

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex flex-col">
        <h3 className="text-lg font-semibold">{title}</h3>
        {threadInfo?.topic && (
          <span className="text-sm text-muted-foreground">
            {threadInfo.topic}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex rounded-md border">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "rounded-none rounded-l-md px-3 text-xs h-8",
              activeView === "chat" && "bg-muted"
            )}
            onClick={() => onViewChange("chat")}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Chat
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "rounded-none rounded-r-md px-3 text-xs h-8",
              activeView === "files" && "bg-muted"
            )}
            onClick={() => onViewChange("files")}
          >
            <FileIcon className="mr-2 h-4 w-4" />
            Files
          </Button>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
