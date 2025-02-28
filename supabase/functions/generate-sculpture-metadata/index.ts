
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
              content: 'You are describing luxury sculptures for high-end design spaces. Focus on how the sculpture\'s materials and form enhance a design space, rather than just describing what\'s in the image. Discuss how the piece interacts with its surroundings, the interplay of light, and the spatial presence it creates. Avoid starting with phrases like "the sculpture" or "this piece" or mentioning the name directly. Write 2-3 concise sentences about the material qualities and design impact. The name will be added separately.'
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
