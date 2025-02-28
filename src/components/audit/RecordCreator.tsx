
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RecordCreatorProps {
  tableName: string;
  recordId: string;
}

export function RecordCreator({ tableName, recordId }: RecordCreatorProps) {
  const { data: creatorInfo, isLoading } = useQuery({
    queryKey: ["record_creator", tableName, recordId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("record_creators")
        .select("creator_id, created_at")
        .eq("table_name", tableName)
        .eq("record_id", recordId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        throw error;
      }
      
      // If we have a creator_id, get their username
      if (data?.creator_id) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", data.creator_id)
          .single();
          
        if (profileError) throw profileError;
        
        return {
          ...data,
          username: profile?.username || 'Unknown user'
        };
      }
      
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
  
  if (isLoading) {
    return <span className="text-xs text-muted-foreground">Loading creator info...</span>;
  }
  
  if (!creatorInfo) {
    return <span className="text-xs text-muted-foreground">No creator info</span>;
  }
  
  return (
    <span className="text-xs text-muted-foreground">
      Created by {creatorInfo.username} on {new Date(creatorInfo.created_at).toLocaleDateString()}
    </span>
  );
}
