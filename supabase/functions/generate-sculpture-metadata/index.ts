
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
    const { imageUrl, type, existingName } = await req.json()
    console.log(`Processing metadata for image: ${imageUrl}, type: ${type}, existing name: ${existingName}`)

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found')
    }

    // First generate name if it's a name request
    if (type === 'name') {
      console.log('Generating name...')
      const nameResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { 
              role: 'system', 
              content: 'You are an art curator responsible for naming sculptures. Create a brief name (1-2 words maximum) for the sculpture in the image. The name should be clean and simple with NO special characters, NO quotation marks, and NO extra spaces before or after. Just return the name, nothing else.'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'image_url',
                  image_url: { url: imageUrl }
                }
              ]
            }
          ]
        }),
      })

      if (!nameResponse.ok) {
        throw new Error(`OpenAI API error: ${await nameResponse.text()}`)
      }

      const nameData = await nameResponse.json()
      const name = nameData.choices[0].message.content.trim()
      console.log('Generated name:', name)

      return new Response(
        JSON.stringify({ name }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      // Generate description using the existing name
      console.log('Generating description...')
      const descriptionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { 
              role: 'system', 
              content: 'You are a sculptor writing from a first-person artistic perspective. When describing your work, focus exclusively on: 1) The specific materials you chose and why (bronze, steel, marble, etc.), 2) The sculptural forms and shapes you created and their symbolic meaning, and 3) The ideal environments or design settings where this piece would enhance the space (modern interiors, gardens, corporate lobbies, etc.). Do not describe what is visibly happening in the image or the current location. Instead, speak as the artist about your creative intentions and applications. Write 2-3 concise sentences in a sophisticated tone. Do not use phrases like "the sculpture" or "this piece" - the name will be added separately at the beginning.'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'image_url',
                  image_url: { url: imageUrl }
                }
              ]
            }
          ]
        }),
      })

      if (!descriptionResponse.ok) {
        throw new Error(`OpenAI API error: ${await descriptionResponse.text()}`)
      }

      const descriptionData = await descriptionResponse.json()
      const description = descriptionData.choices[0].message.content.trim()
      console.log('Generated description:', description)

      return new Response(
        JSON.stringify({ description }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    )
  }
})
