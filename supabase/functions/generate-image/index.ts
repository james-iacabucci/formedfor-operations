
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Queue for processing image generation requests
type QueueItem = {
  prompt: string;
  sculptureId: string;
  creativity: string;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}

// Global processing state
const queue: QueueItem[] = [];
let isProcessing = false;
const MAX_CONCURRENT_REQUESTS = 2; // Allow max 2 concurrent requests to the API
let activeRequests = 0;

// Function to process the queue
async function processQueue() {
  if (isProcessing) return;
  isProcessing = true;
  
  console.log(`Queue status: ${queue.length} items, ${activeRequests} active requests`);
  
  try {
    while (queue.length > 0 && activeRequests < MAX_CONCURRENT_REQUESTS) {
      const item = queue.shift();
      if (!item) continue;
      
      activeRequests++;
      console.log(`Processing request for sculpture ID: ${item.sculptureId}. Active requests: ${activeRequests}`);
      
      generateSingleImage(item)
        .then(result => {
          activeRequests--;
          item.resolve(result);
          console.log(`Completed request for sculpture ID: ${item.sculptureId}. Active requests: ${activeRequests}`);
          // Continue processing queue
          setTimeout(processQueue, 100);
        })
        .catch(error => {
          activeRequests--;
          item.reject(error);
          console.error(`Failed request for sculpture ID: ${item.sculptureId}:`, error);
          // Continue processing queue
          setTimeout(processQueue, 100);
        });
    }
  } finally {
    isProcessing = false;
    
    // If there are more items and capacity, continue processing
    if (queue.length > 0 && activeRequests < MAX_CONCURRENT_REQUESTS) {
      setTimeout(processQueue, 100);
    }
  }
}

// Function to generate a single image
async function generateSingleImage(item: QueueItem) {
  const { prompt, sculptureId, creativity } = item;
  console.log(`Generating image for: ${sculptureId} with creativity: ${creativity}`);
  
  const API_ENDPOINT = "https://api.runware.ai/v1"
  const RUNWARE_API_KEY = Deno.env.get('RUNWARE_API_KEY')

  if (!RUNWARE_API_KEY) {
    console.error('RUNWARE_API_KEY is not set')
    throw new Error('API key not configured')
  }

  // Map creativity levels to model parameters
  const creativitySettings = {
    low: {
      CFGScale: 8,
      scheduler: "FlowMatchEulerDiscreteScheduler"
    },
    medium: {
      CFGScale: 12,
      scheduler: "FlowMatchEulerDiscreteScheduler"
    },
    high: {
      CFGScale: 16,
      scheduler: "FlowMatchEulerDiscreteScheduler"
    }
  }

  const settings = creativitySettings[creativity] || creativitySettings.medium;
  
  // Add a small random delay to prevent exact simultaneous requests
  await new Promise(resolve => setTimeout(resolve, Math.random() * 200));

  // Prepare Runware API request
  const requestBody = [
    {
      taskType: "authentication",
      apiKey: RUNWARE_API_KEY
    },
    {
      taskType: "imageInference",
      taskUUID: crypto.randomUUID(),
      positivePrompt: prompt,
      model: "runware:100@1",
      width: 1024,
      height: 1024,
      numberResults: 1,
      CFGScale: settings.CFGScale,
      scheduler: settings.scheduler,
      outputFormat: "WEBP",
      steps: 4
    }
  ]

  let retries = 2;
  let lastError = null;
  
  while (retries >= 0) {
    try {
      console.log(`API request attempt for ${sculptureId}, attempts left: ${retries}`);
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const responseText = await response.text();
      
      if (!response.ok) {
        console.error(`API error (${response.status}): ${responseText}`);
        throw new Error(`API request failed: ${response.statusText}`);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse JSON response:', e);
        throw new Error('Invalid JSON response from API');
      }

      if (!data.data || !Array.isArray(data.data)) {
        console.error('Invalid response structure from Runware:', data);
        throw new Error('Invalid response structure from API');
      }

      const imageData = data.data.find((item: any) => item.taskType === 'imageInference');
      if (!imageData || !imageData.imageURL) {
        console.error('No image URL in response:', imageData);
        throw new Error('No image URL in response');
      }

      console.log(`Successfully generated image for ${sculptureId}`);
      return {
        success: true,
        imageUrl: imageData.imageURL,
        sculptureId: sculptureId
      };
    } catch (error) {
      lastError = error;
      if (retries > 0) {
        // Exponential backoff: wait longer between each retry
        const backoffTime = Math.pow(2, 2 - retries) * 500 + Math.random() * 500;
        console.log(`Retrying in ${backoffTime}ms for ${sculptureId}`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      }
      retries--;
    }
  }
  
  console.error(`All retries failed for ${sculptureId}:`, lastError);
  throw lastError || new Error("Failed to generate image after multiple attempts");
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { prompt, sculptureId, creativity } = await req.json()
    console.log('Adding to queue:', { prompt, sculptureId, creativity })

    if (!prompt || !sculptureId) {
      throw new Error('Missing required parameters: prompt and sculptureId are required');
    }

    // Instead of processing immediately, add to queue and return
    const result = await new Promise((resolve, reject) => {
      queue.push({
        prompt,
        sculptureId,
        creativity,
        resolve,
        reject
      });
      
      // Start queue processing
      processQueue();
    });

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in generate-image function:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.stack
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
