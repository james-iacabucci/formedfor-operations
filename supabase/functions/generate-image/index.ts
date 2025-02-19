
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

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
    console.log('Generating image for prompt:', prompt, 'sculptureId:', sculptureId, 'creativity:', creativity)

    const API_ENDPOINT = "https://api.runware.ai/v1"
    const RUNWARE_API_KEY = Deno.env.get('RUNWARE_API_KEY')

    if (!RUNWARE_API_KEY) {
      throw new Error('RUNWARE_API_KEY is not set')
    }

    // Map creativity levels to model parameters
    const creativitySettings = {
      low: {
        CFGScale: 8,
        scheduler: "EulerDiscreteScheduler"
      },
      medium: {
        CFGScale: 12,
        scheduler: "DPMSolverMultistepScheduler"
      },
      high: {
        CFGScale: 16,
        scheduler: "UniPCMultistepScheduler"
      }
    }

    const settings = creativitySettings[creativity] || creativitySettings.medium

    // Call Runware API
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
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
          outputFormat: "WEBP"
        }
      ])
    })

    const data = await response.json()
    console.log('Runware API response:', data)

    if (data.error || !data.data) {
      throw new Error(data.error || 'Failed to generate image')
    }

    const imageData = data.data.find((item: any) => item.taskType === 'imageInference')
    if (!imageData || !imageData.imageURL) {
      throw new Error('No image URL in response')
    }

    // Instead of storing in Supabase immediately, return the temporary URL
    return new Response(
      JSON.stringify({ 
        success: true,
        imageUrl: imageData.imageURL,
        sculptureId: sculptureId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error generating image:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
