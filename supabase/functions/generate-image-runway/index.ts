
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
    console.log('Calling Runway API...')
    const runwayResponse = await fetch('https://api.runwayml.com/v1/inference', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RUNWAY_API_KEY}`
      },
      body: JSON.stringify({
        prompt,
        model: "stable-diffusion-xl",
        mode: "generate",
        parameters: {
          image_strength: 1.0,
          guidance_scale: 7.5,
          num_outputs: 1,
          width: 1024,
          height: 1024
        }
      })
    })

    if (!runwayResponse.ok) {
      const errorText = await runwayResponse.text()
      console.error('Runway API error:', {
        status: runwayResponse.status,
        statusText: runwayResponse.statusText,
        body: errorText
      })
      throw new Error(`Runway API error: ${runwayResponse.status} ${runwayResponse.statusText} - ${errorText}`)
    }

    const data = await runwayResponse.json()
    console.log('Runway API response:', JSON.stringify(data, null, 2))

    if (!data.output) {
      console.error('Unexpected Runway API response format:', data)
      throw new Error('Invalid response format from Runway API')
    }

    const imageUrl = data.output
    console.log('Generated image URL:', imageUrl)

    // Update the sculpture with the generated image URL
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error: updateError } = await supabase
      .from('sculptures')
      .update({ image_url: imageUrl })
      .eq('id', sculptureId)

    if (updateError) {
      throw new Error(`Failed to update sculpture: ${updateError.message}`)
    }

    return new Response(
      JSON.stringify({ imageUrl }),
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
