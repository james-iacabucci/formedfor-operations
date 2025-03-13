
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Files, MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SheetClose } from "@/components/ui/sheet";

interface ChatHeaderProps {
  threadId: string;
  activeView: "chat" | "files";
  onViewChange: (value: "chat" | "files") => void;
  onClose?: () => void;
  quoteMode?: boolean;
}

export function ChatHeader({ threadId, activeView, onViewChange, onClose, quoteMode = false }: ChatHeaderProps) {
  const [title, setTitle] = useState<string>("");

  useEffect(() => {
    const fetchTitle = async () => {
      if (!threadId) return;
      
      if (quoteMode) {
        // For quote chat, get the variant details
        try {
          // Get the thread info which includes the variant_id
          const { data: threadData, error: threadError } = await supabase
            .from("chat_threads")
            .select("variant_id, sculptures(ai_generated_name, manual_name)")
            .eq("id", threadId)
            .single();
          
          if (threadError) {
            console.error("Error fetching thread:", threadError);
            setTitle("Fabrication Quotes");
            return;
          }
          
          // Get sculpture name
          let sculptureName = "Untitled Sculpture";
          if (threadData?.sculptures) {
            sculptureName = threadData.sculptures.manual_name || 
                           threadData.sculptures.ai_generated_name || 
                           "Untitled Sculpture";
          }
          
          if (threadData?.variant_id) {
            // Get the variant order index
            const { data: variantData, error: variantError } = await supabase
              .from("sculpture_variants")
              .select("order_index")
              .eq("id", threadData.variant_id)
              .single();
              
            if (!variantError && variantData) {
              setTitle(`${sculptureName} - Variant ${variantData.order_index + 1} Quotes`);
            } else {
              setTitle(`${sculptureName} - Fabrication Quotes`);
            }
          } else {
            setTitle(`${sculptureName} - Fabrication Quotes`);
          }
        } catch (error) {
          console.error("Error in fetching variant data:", error);
          setTitle("Fabrication Quotes");
        }
      } else {
        // For sculpture chat, get sculpture name
        const { data, error } = await supabase
          .from("chat_threads")
          .select("sculptures(ai_generated_name, manual_name)")
          .eq("id", threadId)
          .limit(1)
          .single();
        
        if (error) {
          console.error("Error fetching sculpture name:", error);
          setTitle("Chat");
          return;
        }
        
        if (data?.sculptures) {
          const name = data.sculptures.manual_name || data.sculptures.ai_generated_name || "Untitled Sculpture";
          setTitle(name);
        } else {
          setTitle("Chat");
        }
      }
    };
    
    fetchTitle();
  }, [threadId, quoteMode]);

  return (
    <div className="border-b shrink-0 py-3 px-4">
      <div className="flex items-center justify-between">
        <div className="font-medium truncate">{title}</div>
        
        <div className="flex items-center space-x-2">
          <Tabs
            value={activeView}
            onValueChange={(value) => onViewChange(value as "chat" | "files")}
            className="h-8"
          >
            <TabsList className="h-8 p-0.5 bg-muted/30">
              <TabsTrigger 
                value="chat" 
                className="h-7 px-3 py-1 text-xs font-medium rounded-md text-foreground dark:text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
              >
                <MessageSquare className="h-3.5 w-3.5 mr-1" />
                Chat
              </TabsTrigger>
              <TabsTrigger 
                value="files" 
                className="h-7 px-3 py-1 text-xs font-medium rounded-md text-foreground dark:text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
              >
                <Files className="h-3.5 w-3.5 mr-1" />
                Files
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <SheetClose asChild>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </SheetClose>
        </div>
      </div>
    </div>
  );
}
