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
    const { prompt, sculptureId, creativity, updateExisting, regenerateImage, regenerateMetadata, changes } = await req.json();
    
    if (!prompt || !sculptureId) {
      throw new Error('Missing required parameters');
    }

    console.log('Regenerating with params:', { prompt, sculptureId, creativity, updateExisting, regenerateImage, regenerateMetadata, changes });

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

    let newImageUrl = null;
    if (regenerateImage) {
      // Map creativity levels to CFG values
      const cfgValues = {
        none: 2.0,
        small: 1.5,
        medium: 1.0,
        large: 0.5,
      };

      // Construct the prompt with changes only if provided
      const finalPrompt = changes ? `${prompt}. Changes: ${changes}` : prompt;

      try {
        // Call Runware API for image generation
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
              positivePrompt: finalPrompt,
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

        newImageUrl = imageData.imageURL;
      } catch (error) {
        console.error('Error generating image:', error);
        throw new Error('Failed to generate image');
      }
    }

    let newMetadata = null;
    if (regenerateMetadata) {
      try {
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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

        const aiResponse = await openaiResponse.json();
        console.log('OpenAI response:', aiResponse);

        if (aiResponse.error) {
          console.error('OpenAI API error:', aiResponse.error);
          // Don't throw, just continue without metadata
          console.log('Continuing without metadata due to OpenAI API error');
        } else {
          try {
            if (aiResponse.choices?.[0]?.message?.content) {
              newMetadata = JSON.parse(aiResponse.choices[0].message.content);
              if (!newMetadata?.name || !newMetadata?.description) {
                console.warn('Invalid metadata format, using fallback');
                newMetadata = {
                  name: 'Untitled Sculpture',
                  description: 'A unique sculptural interpretation.',
                };
              }
            }
          } catch (error) {
            console.error('Error parsing AI response:', error);
            // Use regex fallback
            const content = aiResponse.choices[0].message.content;
            const nameMatch = content.match(/name["']?\s*:\s*["']([^"']+)["']/i);
            const descriptionMatch = content.match(/description["']?\s*:\s*["']([^"']+)["']/i);
            newMetadata = {
              name: nameMatch ? nameMatch[1] : 'Untitled Sculpture',
              description: descriptionMatch ? descriptionMatch[1] : 'A unique sculptural interpretation.',
            };
          }
        }
      } catch (error) {
        console.error('Error in metadata generation:', error);
        // Don't throw, just continue without metadata
        console.log('Continuing without metadata due to error');
      }
    }

    if (updateExisting) {
      console.log('Updating existing sculpture:', sculptureId);
      const updateData: any = {};
      
      if (regenerateImage && newImageUrl) {
        updateData.image_url = newImageUrl;
      }
      if (regenerateMetadata && newMetadata) {
        updateData.ai_generated_name = newMetadata.name;
        updateData.ai_description = newMetadata.description;
      }
      if (creativity) {
        updateData.creativity_level = creativity;
      }

      const { error: updateError } = await supabaseAdmin
        .from('sculptures')
        .update(updateData)
        .eq('id', sculptureId);

      if (updateError) {
        console.error('Error updating sculpture:', updateError);
        throw new Error('Failed to update sculpture');
      }

      console.log('Successfully updated sculpture:', sculptureId);
    } else {
      console.log('Creating new sculpture as variation');
      const { error: insertError } = await supabaseAdmin
        .from('sculptures')
        .insert({
          prompt,
          image_url: newImageUrl,
          user_id: originalSculpture.user_id,
          creativity_level: creativity,
          original_sculpture_id: sculptureId,
          ...(newMetadata ? {
            ai_generated_name: newMetadata.name,
            ai_description: newMetadata.description,
          } : {})
        });

      if (insertError) {
        console.error('Error creating variation:', insertError);
        throw new Error('Failed to create variation');
      }
      console.log('Successfully created new sculpture variation');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        imageUrl: newImageUrl,
        metadata: newMetadata 
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