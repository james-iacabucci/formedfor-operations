
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
              content: `You are a sculptor describing your artwork. Write a 2-3 sentence description of this sculpture that follows these EXACT rules:

1. Start with a verb or phrase that would naturally follow after the sculpture's name, such as "is a...", "represents...", "embodies...", "captures...", etc.

2. Focus on: 
   - The materials used in the sculpture (bronze, steel, marble, etc.)
   - The shapes and forms you created
   - How the sculpture enhances the space where it's displayed

3. DO NOT include the sculpture's name anywhere in your description
4. DO NOT use words like "this sculpture", "this piece", etc. at the beginning
5. Keep your description concise and professional
6. Write from the artist's perspective

Example of a good response:
"embodies the fluidity of movement through polished bronze curves that catch and reflect light. The organic form creates a sense of harmony and balance, drawing the eye upward. It serves as a meditative focal point in modern architectural spaces, bridging the gap between nature and structure."

IMPORTANT: Your response must be ONLY the description with no extra text, titles, or formatting.`
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
