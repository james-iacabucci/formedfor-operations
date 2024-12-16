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
    const { prompt, sculptureId } = await req.json();
    console.log('Generating metadata for prompt:', prompt);

    // Check if OpenAI API key is available
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OpenAI API key not found');
      throw new Error('OpenAI API key not configured');
    }

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an art curator helping to generate names and descriptions for AI-generated sculptures. Provide thoughtful, artistic interpretations. Always respond with valid JSON containing 'name' and 'description' fields."
          },
          {
            role: "user",
            content: `Generate a creative name (max 3-4 words) and a 2-3 sentence artistic description for a sculpture based on this prompt: "${prompt}". Format the response as JSON with 'name' and 'description' fields.`
          }
        ],
        temperature: 0.7
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error response:', errorText);
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const aiResponse = await openAIResponse.json();
    console.log('OpenAI API response:', JSON.stringify(aiResponse, null, 2));

    if (!aiResponse.choices?.[0]?.message?.content) {
      console.error('Invalid OpenAI response format:', aiResponse);
      throw new Error('Invalid response format from OpenAI');
    }

    let metadata;
    try {
      metadata = JSON.parse(aiResponse.choices[0].message.content);
      
      if (!metadata?.name || !metadata?.description) {
        console.warn('Invalid metadata format from OpenAI, using fallback');
        metadata = {
          name: 'Untitled Sculpture',
          description: 'A unique sculptural interpretation.',
        };
      }
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      console.log('Raw content:', aiResponse.choices[0].message.content);
      
      // Fallback using regex
      const content = aiResponse.choices[0].message.content;
      const nameMatch = content.match(/name["']?\s*:\s*["']([^"']+)["']/i);
      const descriptionMatch = content.match(/description["']?\s*:\s*["']([^"']+)["']/i);
      
      metadata = {
        name: nameMatch ? nameMatch[1] : 'Untitled Sculpture',
        description: descriptionMatch ? descriptionMatch[1] : 'A unique sculptural interpretation.',
      };
    }

    // Update the sculpture with the new metadata if sculptureId is provided
    if (sculptureId) {
      console.log('Updating sculpture metadata:', { sculptureId, metadata });
      
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const { error: updateError } = await supabaseAdmin
        .from('sculptures')
        .update({
          ai_generated_name: metadata.name,
          ai_description: metadata.description,
        })
        .eq('id', sculptureId);

      if (updateError) {
        console.error('Error updating sculpture metadata:', updateError);
        throw new Error('Failed to update sculpture metadata in database');
      }
      
      console.log('Successfully updated sculpture metadata');
    }

    return new Response(
      JSON.stringify({ metadata }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-metadata function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});