
import { supabase } from "@/integrations/supabase/client";
import { FileUpload } from "./types";
import { Json } from "@/integrations/supabase/types";

export async function uploadFiles(
  files: File[], 
  onProgress: (fileId: string, progress: number) => void
): Promise<Json[]> {
  const uploads: FileUpload[] = [];

  for (const file of files) {
    // Use the file name as ID for progress tracking
    const fileId = file.name;
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = fileName;

    try {
      // Start progress
      onProgress(fileId, 10);
      
      // Upload file
      const { error: uploadError } = await supabase.storage
        .from('chat_attachments')
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      // Update progress to 75%
      onProgress(fileId, 75);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('chat_attachments')
        .getPublicUrl(filePath);

      // Complete progress
      onProgress(fileId, 100);

      uploads.push({
        name: file.name,
        url: publicUrl,
        type: file.type,
        size: file.size,
      });
      
      console.log("Uploaded file:", file.name, "URL:", publicUrl);
    } catch (error) {
      console.error(`Error uploading file ${file.name}:`, error);
      // Set progress to 0 to indicate failure
      onProgress(fileId, 0);
      throw error;
    }
  }

  console.log("All files uploaded successfully:", uploads.length);
  return uploads as unknown as Json[];
}
