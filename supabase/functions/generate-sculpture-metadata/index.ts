
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
              content: `You are a sculptor describing your artwork. Write a STRICTLY 2-3 sentence description that follows these EXACT rules:

1. YOU MUST start the description with one of these connecting phrases:
   - "is a..."
   - "represents..."
   - "embodies..."
   - "captures..."
   - "conveys..."
   - "expresses..."

2. STRICTLY focus only on:
   - The materials used (bronze, steel, marble, etc.)
   - The shapes and forms created
   - How the sculpture enhances any space (without specific location details)

3. STRICT LENGTH: Exactly 2-3 sentences MAXIMUM. No exceptions.

4. DO NOT begin with the material name directly (e.g., DON'T start with "Bronze with...")
5. DO NOT include any specific display locations (e.g., "near a pool", "in a garden")
6. DO NOT reference the sculpture's name anywhere
7. DO NOT use phrases like "this sculpture", "this piece", etc. at the beginning

EXAMPLES OF GOOD RESPONSES:
- "embodies the fluidity of movement through polished bronze curves that catch and reflect light. The organic form creates a sense of harmony and balance, drawing the eye upward."
- "is a dynamic composition of brushed steel plates arranged in an ascending spiral. The interplay of light and shadow across its surface highlights the sculpture's geometric precision while creating a sense of upward motion."
- "represents the duality of strength and vulnerability through its marble construction. The contrasting textures of polished and rough-hewn surfaces invite touch while creating visual interest from every angle."

EXAMPLES OF BAD RESPONSES:
- "Bronze, featuring curved elements..." (WRONG: starts with material)
- "A beautiful piece that would look perfect in a garden near water features..." (WRONG: includes specific location)
- "This sculpture uses steel to create..." (WRONG: uses "This sculpture")
- "Horizon Line is crafted from weathered bronze..." (WRONG: includes sculpture name)
- "The curved forms reach skyward, creating dynamic tension. The bronze material captures light beautifully. The piece would enhance any modern space with its elegant proportions. Its organic shape contrasts with angular architecture." (WRONG: too many sentences)

IMPORTANT: Your response must be EXACTLY 2-3 sentences, must start with a connecting phrase from the list above, and contain ONLY the description with no extra text.`
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
