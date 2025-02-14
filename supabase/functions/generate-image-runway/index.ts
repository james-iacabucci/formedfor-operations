
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
    console.log('Input received:', { prompt, sculptureId })

    const RUNWAY_API_KEY = Deno.env.get('RUNWAY_API_KEY')
    if (!RUNWAY_API_KEY) {
      throw new Error('RUNWAY_API_KEY is not set')
    }
    console.log('RUNWAY_API_KEY found:', RUNWAY_API_KEY.substring(0, 5) + '...')

    // Call Runway API
    console.log('Preparing Runway API call...')
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RUNWAY_API_KEY}`,
      'x-api-version': '2024-01-01'  // Using x-api-version with the date format
    }
    
    console.log('Request headers:', JSON.stringify(headers, null, 2))
    
    const requestBody = {
      prompt,
      cfg_scale: 7.5,
      height: 1024,
      width: 1024,
      numOutputs: 1,
      seed: Math.floor(Math.random() * 1000000)
    }
    console.log('Request body:', JSON.stringify(requestBody, null, 2))
    
    console.log('Sending request to Runway API...')
    const runwayResponse = await fetch('https://api.runwayml.com/v2/text-to-image', {  // Using v2 endpoint
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    })

    console.log('Runway response status:', runwayResponse.status)
    console.log('Runway response status text:', runwayResponse.statusText)

    const responseText = await runwayResponse.text()
    console.log('Raw response text:', responseText)

    if (!runwayResponse.ok) {
      const errorDetails = {
        status: runwayResponse.status,
        statusText: runwayResponse.statusText,
        headers: Object.fromEntries(runwayResponse.headers.entries()),
        responseText,
        requestHeaders: headers,
        requestBody
      }
      console.error('Runway API error details:', JSON.stringify(errorDetails, null, 2))
      throw new Error(`Runway API error: ${runwayResponse.status} ${runwayResponse.statusText} - ${responseText}`)
    }

    // Parse the response text as JSON after we know it's OK
    const data = JSON.parse(responseText)
    console.log('Runway API response data:', JSON.stringify(data, null, 2))

    if (!data.artifacts?.[0]?.uri) {
      console.error('Unexpected Runway API response format:', JSON.stringify(data, null, 2))
      throw new Error('Invalid response format from Runway API')
    }

    const imageUrl = data.artifacts[0].uri
    console.log('Generated image URL:', imageUrl)

    // Update the sculpture with the generated image URL
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Updating sculpture in database...')
    const { error: updateError } = await supabase
      .from('sculptures')
      .update({ image_url: imageUrl })
      .eq('id', sculptureId)

    if (updateError) {
      console.error('Database update error:', updateError)
      throw new Error(`Failed to update sculpture: ${updateError.message}`)
    }

    console.log('Successfully completed all operations')
    return new Response(
      JSON.stringify({ imageUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Full error details:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    })
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
