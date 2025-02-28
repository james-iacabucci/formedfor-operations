
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: string;
  actor_id: string | null;
  old_data: any;
  new_data: any;
  created_at: string;
}

export function useAuditLogs(tableName?: string, recordId?: string) {
  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ["audit_logs", tableName, recordId],
    queryFn: async () => {
      let query = supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (tableName) {
        query = query.eq("table_name", tableName);
      }
      
      if (recordId) {
        query = query.eq("record_id", recordId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as AuditLog[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  return {
    auditLogs,
    isLoading
  };
}
