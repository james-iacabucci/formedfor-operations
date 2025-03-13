
import { ArrowLeftIcon, PaperclipIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useCallback } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ChatHeaderProps {
  threadId: string;
  quoteMode: boolean;
  onBackClick: () => void;
  onFileUploadClick: () => void;
  activeView: "chat" | "files";
  onViewChange: (value: "chat" | "files") => void;
}

export const ChatHeader = ({ 
  threadId, 
  quoteMode, 
  onBackClick, 
  onFileUploadClick,
  activeView,
  onViewChange
}: ChatHeaderProps) => {
  const { data: threadDetails } = useQuery({
    queryKey: ["thread-details", threadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_threads")
        .select(`
          id,
          topic,
          sculpture_id,
          fabrication_quote_id,
          variant_id,
          sculptures(id, ai_generated_name, image_url)
        `)
        .eq("id", threadId)
        .single();

      if (error) {
        console.error("Error fetching thread details:", error);
        return null;
      }
      
      return data;
    },
    enabled: !!threadId,
  });

  const renderTitle = useCallback(() => {
    if (!threadDetails) return "Chat";
    
    // Get sculpture name if available
    const sculptureName = threadDetails.sculptures?.ai_generated_name || "Untitled Sculpture";
    
    if (quoteMode) {
      // Show different title format if it's for a variant
      if (threadDetails.variant_id) {
        return `Variant Fabrication - ${sculptureName}`;
      }
      
      // Legacy format for fabrication quotes
      return `Fabrication Quote - ${sculptureName}`;
    }
    
    // For regular sculpture chat
    return sculptureName;
  }, [threadDetails, quoteMode]);

  return (
    <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-background">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={onBackClick}>
          <ArrowLeftIcon className="h-5 w-5" />
        </Button>
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold">{renderTitle()}</h2>
          {threadDetails?.topic && (
            <span className="text-sm text-muted-foreground capitalize">
              {threadDetails.topic}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Tabs value={activeView} onValueChange={onViewChange as (value: string) => void} className="mr-2">
          <TabsList>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {activeView === "chat" && (
          <Button variant="ghost" size="icon" onClick={onFileUploadClick}>
            <PaperclipIcon className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
};
