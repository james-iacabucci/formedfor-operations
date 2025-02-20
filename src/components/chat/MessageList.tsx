
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  edited_at: string | null;
  profiles: {
    username: string | null;
    avatar_url: string | null;
  } | null;
}

interface MessageListProps {
  threadId: string;
}

export function MessageList({ threadId }: MessageListProps) {
  const { data: messages } = useQuery({
    queryKey: ["messages", threadId],
    queryFn: async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select(`
          id,
          content,
          created_at,
          edited_at,
          user_id,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true });
      return data as Message[];
    },
  });

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {messages?.map((message) => (
          <div key={message.id} className="flex items-start gap-3">
            <Avatar className="w-8 h-8">
              <img src={message.profiles?.avatar_url || ""} alt={message.profiles?.username || "User"} />
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  {message.profiles?.username || "Unknown User"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                </span>
                {message.edited_at && (
                  <span className="text-xs text-muted-foreground">(edited)</span>
                )}
              </div>
              <p className="mt-1 text-sm">{message.content}</p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
