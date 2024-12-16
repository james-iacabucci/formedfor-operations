import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sculptureId, prompt } = await req.json();
    console.log('Generating metadata for sculpture:', sculptureId, 'with prompt:', prompt);

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Generate content using OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an art curator helping to generate names and descriptions for AI-generated sculptures. Provide thoughtful, artistic interpretations."
          },
          {
            role: "user",
            content: `Generate a creative name (max 3-4 words) and a 2-3 sentence artistic description for a sculpture based on this prompt: "${prompt}". Format the response as JSON with 'name' and 'description' fields.`
          }
        ],
      }),
    });

    const aiResponse = await response.json();
    console.log('AI response:', aiResponse);

    let metadata;
    try {
      metadata = JSON.parse(aiResponse.choices[0].message.content);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      const content = aiResponse.choices[0].message.content;
      // Fallback parsing attempt
      const nameMatch = content.match(/name["']?\s*:\s*["']([^"']+)["']/i);
      const descriptionMatch = content.match(/description["']?\s*:\s*["']([^"']+)["']/i);
      metadata = {
        name: nameMatch ? nameMatch[1] : 'Untitled Sculpture',
        description: descriptionMatch ? descriptionMatch[1] : 'A unique sculptural interpretation.',
      };
    }

    // Update the sculpture with the generated metadata
    const { error: updateError } = await supabaseClient
      .from('sculptures')
      .update({
        ai_generated_name: metadata.name,
        ai_description: metadata.description,
      })
      .eq('id', sculptureId);

    if (updateError) {
      throw updateError;
    }

    return new Response(JSON.stringify(metadata), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-sculpture-metadata function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});