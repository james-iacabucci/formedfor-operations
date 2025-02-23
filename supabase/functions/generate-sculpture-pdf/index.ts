
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, rgb, StandardFonts } from "https://cdn.skypack.dev/pdf-lib@1.17.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sculptureId } = await req.json();
    console.log("Generating PDF for sculpture:", sculptureId);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch sculpture data
    const { data: sculpture, error: sculptureError } = await supabase
      .from('sculptures')
      .select(`
        *,
        product_line:product_lines(
          name,
          black_logo_url,
          white_logo_url
        ),
        material:value_lists!sculptures_material_id_fkey(name)
      `)
      .eq('id', sculptureId)
      .single();

    if (sculptureError) throw sculptureError;
    if (!sculpture) throw new Error('Sculpture not found');

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const { height } = page.getSize();

    // Embed the main image
    let imageBytes;
    if (sculpture.image_url) {
      const imageResponse = await fetch(sculpture.image_url);
      imageBytes = await imageResponse.arrayBuffer();
      const image = await pdfDoc.embedJpg(imageBytes);
      const imageDims = image.scale(0.5); // Scale image to fit page
      page.drawImage(image, {
        x: 50,
        y: height - 400,
        width: 250,
        height: 300,
      });
    }

    // Add product line logo if available
    if (sculpture.product_line?.black_logo_url) {
      const logoResponse = await fetch(sculpture.product_line.black_logo_url);
      const logoBytes = await logoResponse.arrayBuffer();
      const logo = await pdfDoc.embedPng(logoBytes);
      const logoDims = logo.scale(0.3);
      page.drawImage(logo, {
        x: 400,
        y: height - 100,
        width: logoDims.width,
        height: logoDims.height,
      });
    }

    // Add text content
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;

    // Sculpture name
    page.drawText(sculpture.ai_generated_name || 'Untitled', {
      x: 400,
      y: height - 200,
      size: 24,
      font,
    });

    // Material
    page.drawText(sculpture.material?.name || 'Material not specified', {
      x: 400,
      y: height - 250,
      size: fontSize,
      font,
    });

    // Dimensions
    const dimensionsText = `Height: ${sculpture.height_in || 0} in (${sculpture.height_cm || 0} cm)\n` +
      `Width: ${sculpture.width_in || 0} in (${sculpture.width_cm || 0} cm)\n` +
      `Depth: ${sculpture.depth_in || 0} in (${sculpture.depth_cm || 0} cm)`;

    page.drawText(dimensionsText, {
      x: 400,
      y: height - 300,
      size: fontSize,
      font,
      lineHeight: 15,
    });

    // Description
    if (sculpture.ai_description) {
      const description = sculpture.ai_description;
      page.drawText(description, {
        x: 400,
        y: height - 400,
        size: fontSize,
        font,
        maxWidth: 150,
        lineHeight: 15,
      });
    }

    // Add edition information
    page.drawText('LIMITED EDITION OF 33', {
      x: 400,
      y: height - 500,
      size: fontSize,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    page.drawText('(available in multiple finishes and sizes)', {
      x: 400,
      y: height - 520,
      size: fontSize - 2,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Serialize the PDF to bytes
    const pdfBytes = await pdfDoc.save();
    const base64PDF = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));

    return new Response(
      JSON.stringify({ data: base64PDF }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      }
    );

  } catch (error) {
    console.error('Error generating PDF:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      }
    );
  }
});
