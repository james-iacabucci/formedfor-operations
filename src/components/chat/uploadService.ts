
import { supabase } from "@/integrations/supabase/client";
import { FileUpload } from "./types";
import { Json } from "@/integrations/supabase/types";

export async function uploadFiles(
  files: File[], 
  onProgress: (fileId: string, progress: number) => void
): Promise<Json[]> {
  const uploads: FileUpload[] = [];

  for (const file of files) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;

    onProgress(fileName, 10);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('chat_attachments')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    onProgress(fileName, 100);

    const { data: { publicUrl } } = supabase.storage
      .from('chat_attachments')
      .getPublicUrl(fileName);

    uploads.push({
      name: file.name,
      url: publicUrl,
      type: file.type,
      size: file.size,
    });
  }

  // Convert FileUpload[] to Json[]
  return uploads as unknown as Json[];
}
