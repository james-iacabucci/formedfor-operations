import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    console.log('Regenerating image with prompt:', prompt, 'sculptureId:', sculptureId, 'creativity:', creativity);

    // Map creativity levels to CFG values (lower = more creative)
    const cfgValues = {
      small: 1.5,
      medium: 1.0,
      large: 0.5,
    };

    const response = await fetch("https://api.runware.ai/v1", {
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

    const data = await response.json();
    console.log('Runware API response:', data);

    if (data.error || !data.data) {
      throw new Error(data.error || 'Failed to generate image');
    }

    const imageData = data.data.find((item: any) => item.taskType === 'imageInference');
    if (!imageData || !imageData.imageURL) {
      throw new Error('No image URL in response');
    }

    // Update the sculpture with the new image URL
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    const supabaseResponse = await fetch(`${supabaseUrl}/rest/v1/sculptures?id=eq.${sculptureId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
      },
      body: JSON.stringify({ image_url: imageData.imageURL }),
    });

    if (!supabaseResponse.ok) {
      throw new Error('Failed to update sculpture');
    }

    return new Response(
      JSON.stringify({ imageUrl: imageData.imageURL }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error regenerating image:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});