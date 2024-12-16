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
    const { prompt, sculptureId } = await req.json()
    console.log('Generating image for prompt:', prompt, 'sculptureId:', sculptureId)

    const API_ENDPOINT = "https://api.runware.ai/v1"
    const RUNWARE_API_KEY = Deno.env.get('RUNWARE_API_KEY')

    if (!RUNWARE_API_KEY) {
      throw new Error('RUNWARE_API_KEY is not set')
    }

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
          numberResults: 1
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

    // Update the sculpture with the generated image URL
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error: updateError } = await supabase
      .from('sculptures')
      .update({ image_url: imageData.imageURL })
      .eq('id', sculptureId)

    if (updateError) {
      throw new Error(`Failed to update sculpture: ${updateError.message}`)
    }

    return new Response(
      JSON.stringify({ imageUrl: imageData.imageURL }),
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