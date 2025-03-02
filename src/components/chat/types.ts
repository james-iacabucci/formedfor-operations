
import { Json } from "@/integrations/supabase/types";

export interface FileAttachment {
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  existingUrl?: string;
}

export interface MessageReaction {
  reaction: string;
  user_id: string;
  username?: string | null;
}

export interface Message {
  id: string;
  created_at: string;
  content: string;
  user_id: string;
  profiles: {
    username: string | null;
    avatar_url: string | null;
  } | null;
  attachments: FileAttachment[];
  mentions: Json[];
  edited_at: string | null;
  thread_id: string;
  reactions?: MessageReaction[];
}

export interface RawMessage {
  id: string;
  created_at: string;
  content: string;
  user_id: string;
  profiles: {
    username: string | null;
    avatar_url: string | null;
  } | null;
  attachments: Json[];
  mentions: Json[];
  edited_at: string | null;
  thread_id: string;
  reactions?: Json[];
}

export type FileUpload = FileAttachment;

export function isFileAttachment(value: Json): value is Json & FileAttachment {
  if (typeof value !== 'object' || value === null) return false;
  
  const obj = value as Record<string, Json>;
  
  return (
    typeof obj.name === 'string' &&
    typeof obj.url === 'string' &&
    typeof obj.type === 'string' &&
    typeof obj.size === 'number'
  );
}

export function convertToMessage(rawMessage: any): Message {
  let attachments: FileAttachment[] = [];
  
  if (Array.isArray(rawMessage.attachments)) {
    attachments = rawMessage.attachments
      .filter(att => isFileAttachment(att))
      .map(att => ({
        name: att.name as string,
        url: att.url as string,
        type: att.type as string,
        size: att.size as number
      }));
  }

  let reactions: MessageReaction[] = [];
  
  if (rawMessage.reactions && Array.isArray(rawMessage.reactions)) {
    try {
      console.log(`[DEBUG][convertToMessage] Processing message ${rawMessage.id} with ${rawMessage.reactions.length} reactions`);
      console.log(`[DEBUG][convertToMessage] Raw reactions:`, JSON.stringify(rawMessage.reactions));
      
      // Improved deduplication with Map to ensure one reaction per user+reaction type
      const reactionMap = new Map<string, MessageReaction>();
      
      for (const r of rawMessage.reactions) {
        if (typeof r === 'object' && r !== null && 'reaction' in r && 'user_id' in r) {
          const reaction = r.reaction as string;
          const userId = r.user_id as string;
          
          if (!reaction || !userId) {
            console.warn('[REACTION] Invalid reaction data, missing required fields:', r);
            continue;
          }
          
          const key = `${reaction}-${userId}`;
          console.log(`[DEBUG][convertToMessage] Processing reaction: ${key}`);
          
          if (!reactionMap.has(key)) {
            reactionMap.set(key, {
              reaction: reaction,
              user_id: userId,
              username: r.username as string | null
            });
          } else {
            console.warn('[REACTION] Duplicate reaction found and skipped:', key);
          }
        } else {
          console.warn('[REACTION] Invalid reaction format:', r);
        }
      }
      
      reactions = Array.from(reactionMap.values());
      console.log(`[DEBUG][convertToMessage] Deduplicated to ${reactions.length} reactions for message ${rawMessage.id}`);
      console.log(`[DEBUG][convertToMessage] Final reactions:`, JSON.stringify(reactions));
    } catch (error) {
      console.error('[REACTION] Error processing reactions:', error);
      reactions = [];
    }
  }

  return {
    id: rawMessage.id,
    created_at: rawMessage.created_at,
    content: rawMessage.content,
    user_id: rawMessage.user_id,
    profiles: rawMessage.profiles,
    attachments: attachments,
    mentions: Array.isArray(rawMessage.mentions) ? rawMessage.mentions : [],
    edited_at: rawMessage.edited_at,
    thread_id: rawMessage.thread_id,
    reactions: reactions
  };
}

export interface ExtendedFileAttachment extends FileAttachment {
  user: {
    username: string | null;
    avatar_url: string | null;
  } | null;
  userId: string;
  messageId: string;
  uploadedAt: string;
}

export interface MessageData {
  id: string;
  created_at: string;
  attachments: Json[];
  user_id: string;
  profiles: {
    username: string | null;
    avatar_url: string | null;
  } | null;
}
