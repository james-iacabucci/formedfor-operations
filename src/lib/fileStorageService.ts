
/**
 * Service for handling file operations with Supabase Storage
 */
import { supabase } from "@/integrations/supabase/client";

/**
 * Generate a signed URL for downloading a file from storage
 * @param url The public URL of the file
 * @param fileName The name to save the file as
 * @param expiresIn Duration in seconds for which the URL is valid (default: 300 = 5 minutes)
 * @returns Promise with the signed URL
 */
export async function generateSignedUrl(url: string, fileName: string, expiresIn: number = 300): Promise<string> {
  try {
    // Extract the file path from the public URL
    // Example URL: https://lkgomkokczyvftjrbejq.supabase.co/storage/v1/object/public/chat_attachments/filename.ext
    const pathMatch = url.match(/\/public\/([^/]+)\/(.+)$/);
    
    if (!pathMatch || pathMatch.length < 3) {
      console.error("Could not extract file path from URL:", url);
      throw new Error("Invalid file URL format");
    }
    
    const bucketName = pathMatch[1]; // e.g. "chat_attachments"
    const filePath = pathMatch[2];   // e.g. "filename.ext"
    
    console.log(`Generating signed URL for ${bucketName}/${filePath} with filename ${fileName}`);
    
    // Create a signed URL with download options
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, expiresIn, {
        download: fileName,
        transform: {
          metadata: {
            'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`
          }
        }
      });
    
    if (error || !data?.signedUrl) {
      console.error("Error generating signed URL:", error);
      throw error || new Error("Failed to generate signed URL");
    }
    
    console.log("Successfully generated signed URL");
    return data.signedUrl;
  } catch (error) {
    console.error("Error in generateSignedUrl:", error);
    throw error;
  }
}
