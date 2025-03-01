
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ChatHeaderProps {
  threadId: string;
}

export function ChatHeader({ threadId }: ChatHeaderProps) {
  const [sculptureName, setSculptureName] = useState<string>("");

  useEffect(() => {
    const fetchSculptureName = async () => {
      if (!threadId) return;
      
      const { data, error } = await supabase
        .from("chat_threads")
        .select("sculptures(ai_generated_name, manual_name)")
        .eq("sculpture_id", threadId)
        .limit(1)
        .single();
      
      if (error) {
        console.error("Error fetching sculpture name:", error);
        return;
      }
      
      if (data?.sculptures) {
        const name = data.sculptures.manual_name || data.sculptures.ai_generated_name || "Untitled Sculpture";
        setSculptureName(name);
      }
    };
    
    fetchSculptureName();
  }, [threadId]);

  return (
    <div className="border-b shrink-0 py-3 px-4">
      <div className="flex items-center justify-between">
        <div className="font-medium truncate">{sculptureName}</div>
      </div>
    </div>
  );
}
