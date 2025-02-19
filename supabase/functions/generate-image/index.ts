
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { prompt, sculptureId, creativity } = await req.json()
    console.log('Starting image generation:', { prompt, sculptureId, creativity })

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
        scheduler: "euler"
      },
      medium: {
        CFGScale: 12,
        scheduler: "dpm_solver"
      },
      high: {
        CFGScale: 16,
        scheduler: "unipc"
      }
    }

    const settings = creativitySettings[creativity] || creativitySettings.medium
    console.log('Using settings:', settings)

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

    console.log('Calling Runware API...')
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    const responseText = await response.text();
    console.log('Raw Runware API response:', responseText);

    if (!response.ok) {
      console.error('Runware API error:', {
        status: response.status,
        statusText: response.statusText,
        body: responseText
      })
      throw new Error(`API request failed: ${response.statusText}`)
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse JSON response:', e);
      throw new Error('Invalid JSON response from API');
    }

    console.log('Parsed Runware API response:', data);

    if (!data.data || !Array.isArray(data.data)) {
      console.error('Invalid response structure from Runware:', data);
      throw new Error('Invalid response structure from API');
    }

    const imageData = data.data.find((item: any) => item.taskType === 'imageInference');
    if (!imageData || !imageData.imageURL) {
      console.error('No image URL in response:', imageData);
      throw new Error('No image URL in response');
    }

    console.log('Successfully generated image:', {
      sculptureId,
      imageUrl: imageData.imageURL
    });

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: imageData.imageURL,
        sculptureId: sculptureId
      }),
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
