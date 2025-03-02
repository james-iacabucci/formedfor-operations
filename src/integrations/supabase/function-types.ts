
import { MessageReaction } from "@/components/chat/types";
import { Database } from "./types";

// Define the types for custom RPC functions
export type CustomFunctions = {
  update_message_reactions: (args: {
    message_id: string;
    reaction_data: MessageReaction[];
  }) => void;
};

// Extend the Supabase client type
declare module '@supabase/supabase-js' {
  interface SupabaseClient<
    Database = any,
    SchemaName extends string & keyof Database = 'public' extends keyof Database
      ? 'public'
      : string & keyof Database,
  > {
    rpc<
      FunctionName extends string & keyof CustomFunctions
    >(
      fn: FunctionName,
      args?: Parameters<CustomFunctions[FunctionName]>[0],
    ): Promise<{
      data: ReturnType<CustomFunctions[FunctionName]> extends void
        ? null
        : ReturnType<CustomFunctions[FunctionName]>;
      error: null | {
        code: string;
        details: string;
        hint: string;
        message: string;
      };
    }>;
  }
}
