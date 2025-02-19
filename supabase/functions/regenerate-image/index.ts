
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sculptureId } = await req.json();
    console.log('Regenerating image for sculpture:', sculptureId);

    if (!sculptureId) {
      throw new Error('Sculpture ID is required');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the sculpture details
    const { data: sculpture, error: fetchError } = await supabaseClient
      .from('sculptures')
      .select('*')
      .eq('id', sculptureId)
      .single();

    if (fetchError || !sculpture) {
      console.error('Error fetching sculpture:', fetchError);
      throw new Error('Could not fetch sculpture details');
    }

    console.log('Found sculpture:', sculpture);

    if (!sculpture.prompt) {
      throw new Error('Sculpture prompt is required');
    }

    const cfgValues = {
      none: 2.0,
      small: 1.5,
      medium: 1.0,
      large: 0.5,
    };

    const runwareApiKey = Deno.env.get('RUNWARE_API_KEY');
    if (!runwareApiKey) {
      throw new Error('RUNWARE_API_KEY is not configured');
    }

    // Generate new image using RunWare API
    console.log('Calling RunWare API...');
    const runwareResponse = await fetch("https://api.runware.ai/v1", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        {
          taskType: "authentication",
          apiKey: runwareApiKey
        },
        {
          taskType: "imageInference",
          taskUUID: crypto.randomUUID(),
          positivePrompt: sculpture.prompt,
          model: "runware:100@1",
          width: 1024,
          height: 1024,
          numberResults: 1,
          CFGScale: cfgValues[sculpture.creativity_level || 'medium'] || 1.0
        }
      ])
    });

    const runwareData = await runwareResponse.json();
    console.log('RunWare API response:', runwareData);

    if (!runwareData.data || runwareData.error) {
      console.error('RunWare API error:', runwareData.error || 'No data returned');
      throw new Error(runwareData.error || 'Failed to generate image');
    }

    const imageData = runwareData.data.find((item: any) => 
      item.taskType === 'imageInference' && item.imageURL
    );

    if (!imageData || !imageData.imageURL) {
      console.error('No image URL in response');
      throw new Error('No image URL in response');
    }

    // Update sculpture with new image URL
    const { error: updateError } = await supabaseClient
      .from('sculptures')
      .update({ image_url: imageData.imageURL })
      .eq('id', sculptureId);

    if (updateError) {
      console.error('Error updating sculpture:', updateError);
      throw new Error('Failed to update sculpture with new image');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Image regenerated successfully',
        imageUrl: imageData.imageURL 
      }),
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
        message: error.message || 'Failed to regenerate image'
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
