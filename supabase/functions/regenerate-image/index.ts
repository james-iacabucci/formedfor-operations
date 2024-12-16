import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, sculptureId, creativity } = await req.json();
    
    if (!prompt || !sculptureId || !creativity) {
      throw new Error('Missing required parameters');
    }

    console.log('Regenerating image with prompt:', prompt, 'sculptureId:', sculptureId, 'creativity:', creativity);

    // Map creativity levels to CFG values (lower = more creative)
    const cfgValues = {
      small: 1.5,
      medium: 1.0,
      large: 0.5,
    };

    // Call Runware API
    const runwareResponse = await fetch("https://api.runware.ai/v1", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        {
          taskType: "authentication",
          apiKey: Deno.env.get('RUNWARE_API_KEY')
        },
        {
          taskType: "imageInference",
          taskUUID: crypto.randomUUID(),
          positivePrompt: prompt,
          model: "runware:100@1",
          width: 1024,
          height: 1024,
          numberResults: 1,
          CFGScale: cfgValues[creativity] || 1.0
        }
      ])
    });

    const data = await runwareResponse.json();
    console.log('Runware API response:', data);

    if (data.error || !data.data) {
      console.error('Runware API error:', data.error || 'No data returned');
      throw new Error(data.error || 'Failed to generate image');
    }

    const imageData = data.data.find((item: any) => item.taskType === 'imageInference');
    if (!imageData || !imageData.imageURL) {
      console.error('No image URL in response');
      throw new Error('No image URL in response');
    }

    // Initialize Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get the original sculpture to copy its user_id
    const { data: originalSculpture, error: fetchError } = await supabaseAdmin
      .from('sculptures')
      .select('user_id')
      .eq('id', sculptureId)
      .single();

    if (fetchError || !originalSculpture) {
      console.error('Error fetching original sculpture:', fetchError);
      throw new Error('Failed to fetch original sculpture');
    }

    // Create a new sculpture record as a variation
    const { error: insertError } = await supabaseAdmin
      .from('sculptures')
      .insert({
        prompt,
        image_url: imageData.imageURL,
        user_id: originalSculpture.user_id,
        creativity_level: creativity,
        original_sculpture_id: sculptureId
      });

    if (insertError) {
      console.error('Error creating variation:', insertError);
      throw new Error('Failed to create variation');
    }

    return new Response(
      JSON.stringify({ success: true, imageUrl: imageData.imageURL }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error in regenerate-image function:', error);
    return new Response(
      JSON.stringify({ 
        error: true,
        message: error.message || 'An error occurred while regenerating the image'
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      }
    );
  }
});