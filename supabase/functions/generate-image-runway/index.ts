
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { prompt, sculptureId } = await req.json()
    console.log('Generating image with Runway for prompt:', prompt, 'sculptureId:', sculptureId)

    const RUNWAY_API_KEY = Deno.env.get('RUNWAY_API_KEY')
    if (!RUNWAY_API_KEY) {
      throw new Error('RUNWAY_API_KEY is not set')
    }

    // Call Runway API
    const response = await fetch('https://api.runwayml.com/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RUNWAY_API_KEY}`
      },
      body: JSON.stringify({
        prompt,
        model: "stable-diffusion-v1-5",
        params: {
          width: 1024,
          height: 1024,
          num_outputs: 1,
          guidance_scale: 7.5
        }
      })
    })

    const data = await response.json()
    console.log('Runway API response:', data)

    if (!data.artifacts?.[0]?.uri) {
      throw new Error('No image URL in response')
    }

    // Update the sculpture with the generated image URL
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error: updateError } = await supabase
      .from('sculptures')
      .update({ image_url: data.artifacts[0].uri })
      .eq('id', sculptureId)

    if (updateError) {
      throw new Error(`Failed to update sculpture: ${updateError.message}`)
    }

    return new Response(
      JSON.stringify({ imageUrl: data.artifacts[0].uri }),
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
