
export async function convertImageUrlToBase64(url: string): Promise<string> {
  console.log('convertImageUrlToBase64: Starting fetch for:', url);
  
  try {
    const response = await fetch(url, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error('Fetch failed:', {
        status: response.status,
        statusText: response.statusText,
        url: url
      });
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type');
    console.log('Image content type:', contentType);
    
    const blob = await response.blob();
    console.log('Blob received:', {
      size: blob.size,
      type: blob.type
    });
    
    if (blob.size === 0) {
      console.error('Empty blob received');
      throw new Error('Retrieved empty image blob');
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          const base64Data = reader.result as string;
          const base64Match = base64Data.match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/);
          
          if (!base64Match) {
            console.error('Invalid base64 image data format');
            reject(new Error('Invalid base64 image data format'));
            return;
          }
          
          const base64Content = base64Match[2];
          console.log('Base64 conversion successful:', {
            contentLength: base64Content.length,
            startsWidth: base64Content.substring(0, 20) + '...',
            endsWidth: '...' + base64Content.substring(base64Content.length - 20)
          });
          
          resolve(base64Content);
        } catch (error) {
          console.error('Error processing base64 data:', error);
          reject(error);
        }
      };
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        reject(error);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error in convertImageUrlToBase64:', error);
    throw error;
  }
}
