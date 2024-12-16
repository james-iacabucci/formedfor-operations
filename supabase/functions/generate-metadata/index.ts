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

    if (sculptureError) {
      console.error('Error fetching sculpture:', sculptureError);
      throw sculptureError;
    }

    if (!sculpture) {
      throw new Error('Sculpture not found');
    }

    console.log('Fetched sculpture prompt:', sculpture.prompt);

    // Generate content using OpenAI
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-1106-preview',
        messages: [
          {
            role: 'system',
            content: field === 'ai_generated_name' 
              ? 'You are an art curator helping to generate creative names for AI-generated sculptures. Provide a thoughtful, artistic name using 1 or 2 words maximum. Do not use quotes, periods, or any punctuation in your response. Do not start the name with "The". Only return the word(s).'
              : 'You are an art curator analyzing AI-generated sculptures. In exactly 2 sentences, describe how the sculpture enhances its architectural setting, and comment on its material qualities or distinctive shape. Focus on the visual impact and physical characteristics that make it unique. Do not use quotes in your response.'
          },
          {
            role: 'user',
            content: `Generate a creative ${field === 'ai_generated_name' ? 'name' : 'description'} for a sculpture based on this prompt: "${sculpture.prompt}"`
          }
        ],
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData}`);
    }

    const data = await openAIResponse.json();
    console.log('OpenAI API response:', data);

    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid OpenAI API response:', data);
      throw new Error('Invalid response from OpenAI API');
    }

    let generatedText = data.choices[0].message.content.replace(/['"]/g, '');
    
    // For names, ensure max two words and remove any punctuation
    if (field === 'ai_generated_name') {
      generatedText = generatedText
        .replace(/[.,!?]/g, '') // Remove punctuation
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .join(' ');
      
      // Remove "The" if it starts with it
      if (generatedText.toLowerCase().startsWith('the ')) {
        generatedText = generatedText.slice(4).trim();
      }
      
      // Validate that we have 1 or 2 words
      const wordCount = generatedText.trim().split(/\s+/).length;
      if (wordCount < 1 || wordCount > 2) {
        console.error('Generated name does not have 1 or 2 words:', generatedText);
        throw new Error('Generated name must have 1 or 2 words');
      }
    }

    console.log('Generated text:', generatedText);

    // Update the sculpture with the generated metadata
    const { error: updateError } = await supabaseClient
      .from('sculptures')
      .update({ [field]: generatedText })
      .eq('id', sculptureId);

    if (updateError) {
      console.error('Error updating sculpture:', updateError);
      throw updateError;
    }

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