import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sculptureId, field } = await req.json();
    console.log('Generating metadata for sculpture:', sculptureId, 'field:', field);

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the sculpture's prompt
    const { data: sculpture, error: sculptureError } = await supabaseClient
      .from('sculptures')
      .select('prompt')
      .eq('id', sculptureId)
      .single();

    if (sculptureError) throw sculptureError;

    // Generate content using OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: field === 'ai_generated_name' 
              ? 'You are an art curator helping to generate creative names for AI-generated sculptures. Provide thoughtful, artistic names that are 3-4 words maximum. Do not use quotes in your response.'
              : 'You are an art curator analyzing AI-generated sculptures. In exactly 2 sentences, describe how the sculpture enhances its architectural setting, and comment on its material qualities or distinctive shape. Focus on the visual impact and physical characteristics that make it unique. Do not use quotes in your response.'
          },
          {
            role: 'user',
            content: `Generate a creative ${field === 'ai_generated_name' ? 'name' : 'description'} for a sculpture based on this prompt: "${sculpture.prompt}"`
          }
        ],
      }),
    });

    const data = await response.json();
    const generatedText = data.choices[0].message.content.replace(/['"]/g, ''); // Remove any quotes that might be in the response

    // Update the sculpture with the generated metadata
    const { error: updateError } = await supabaseClient
      .from('sculptures')
      .update({ [field]: generatedText })
      .eq('id', sculptureId);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ [field]: generatedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-metadata function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});