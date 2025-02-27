
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
}

export type FileUpload = FileAttachment;

export function isFileAttachment(value: Json): value is Json & FileAttachment {
  if (typeof value !== 'object' || value === null) return false;
  
  const obj = value as Record<string, Json>;
  
  // Log detailed information about the object being checked
  console.log("Checking isFileAttachment:", { 
    value,
    hasName: 'name' in obj, 
    nameType: obj.name ? typeof obj.name : 'undefined',
    hasUrl: 'url' in obj, 
    urlType: obj.url ? typeof obj.url : 'undefined',
    hasType: 'type' in obj,
    typeType: obj.type ? typeof obj.type : 'undefined',
    hasSize: 'size' in obj,
    sizeType: obj.size !== undefined ? typeof obj.size : 'undefined'
  });
  
  return (
    typeof obj.name === 'string' &&
    typeof obj.url === 'string' &&
    typeof obj.type === 'string' &&
    typeof obj.size === 'number'
  );
}

// Helper function to convert raw message data to Message type
export function convertToMessage(rawMessage: any): Message {
  console.log("Converting raw message to Message:", rawMessage);
  
  let attachments: FileAttachment[] = [];
  
  if (Array.isArray(rawMessage.attachments)) {
    attachments = rawMessage.attachments
      .filter(att => {
        const isValid = isFileAttachment(att);
        console.log("Filtering attachment:", { att, isValid });
        return isValid;
      })
      .map(att => ({
        name: att.name as string,
        url: att.url as string,
        type: att.type as string,
        size: att.size as number
      }));
      
    console.log("Processed attachments:", attachments);
  } else {
    console.log("Message has no attachments array:", rawMessage.attachments);
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
    thread_id: rawMessage.thread_id
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
