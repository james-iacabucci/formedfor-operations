
/**
 * Utility functions for handling file downloads
 */
import { generateSignedUrl } from "./fileStorageService";

/**
 * Downloads a file from a URL
 * @param url The URL of the file to download
 * @param filename The name to save the file as
 */
export async function downloadFile(url: string, filename: string): Promise<void> {
  try {
    console.log(`Starting download for ${filename} from ${url}`);
    
    // Generate a signed URL for secure download with proper headers
    const signedUrl = await generateSignedUrl(url, filename);
    
    console.log(`Got signed URL: ${signedUrl.substring(0, 100)}...`);
    
    // Fetch the file using the signed URL
    const response = await fetch(signedUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
    }
    
    // Get the file data as a blob
    const blob = await response.blob();
    
    // Create a blob URL
    const blobUrl = URL.createObjectURL(blob);
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    
    // Append to document, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the blob URL
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 100);
    
    console.log(`Successfully downloaded ${filename}`);
  } catch (error) {
    console.error("Error downloading file:", error);
    throw error;
  }
}

/**
 * Fallback method for direct download without signed URLs
 * Used as a fallback in case the signed URL approach fails
 */
export async function downloadFileDirectly(url: string, filename: string): Promise<void> {
  try {
    console.log(`Using direct download for ${filename}`);
    
    // Fetch the file
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
    }
    
    // Get the file data as a blob
    const blob = await response.blob();
    
    // Create a blob URL
    const blobUrl = URL.createObjectURL(blob);
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    
    // Append to document, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the blob URL
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 100);
  } catch (error) {
    console.error("Error in direct download:", error);
    throw error;
  }
}
