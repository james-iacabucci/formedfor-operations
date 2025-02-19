
export async function convertImageUrlToBase64(url: string): Promise<string> {
  console.log('convertImageUrlToBase64: Starting fetch for:', url);
  
  try {
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Accept': 'image/*'
      }
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
    console.log('Response content type:', contentType);
    
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
          // Validate the base64 data
          if (!base64Data || !base64Data.startsWith('data:image/')) {
            console.error('Invalid base64 image data:', {
              dataStart: base64Data ? base64Data.substring(0, 30) : 'null'
            });
            reject(new Error('Invalid base64 image data'));
            return;
          }
          
          console.log('Base64 conversion successful:', {
            contentLength: base64Data.length,
            startsWidth: base64Data.substring(0, 30) + '...',
            format: base64Data.split(';')[0]
          });
          
          resolve(base64Data);
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
