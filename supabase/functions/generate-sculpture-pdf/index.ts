
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, rgb, StandardFonts } from "https://cdn.skypack.dev/pdf-lib@1.17.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchAndResizeImage(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return arrayBuffer;
}

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
    const { width, height } = page.getSize();

    // Add images with proper error handling
    try {
      if (sculpture.image_url) {
        const imageBytes = await fetchAndResizeImage(sculpture.image_url);
        const image = await pdfDoc.embedJpg(imageBytes);
        const scale = Math.min(250 / image.width, 300 / image.height);
        const scaledWidth = image.width * scale;
        const scaledHeight = image.height * scale;
        
        page.drawImage(image, {
          x: 50,
          y: height - 350,
          width: scaledWidth,
          height: scaledHeight,
        });
      }

      // Add logo with proper scaling
      if (sculpture.product_line?.black_logo_url) {
        const logoBytes = await fetchAndResizeImage(sculpture.product_line.black_logo_url);
        const logo = await pdfDoc.embedPng(logoBytes);
        const logoScale = Math.min(100 / logo.width, 50 / logo.height);
        
        page.drawImage(logo, {
          x: width - 150,
          y: height - 80,
          width: logo.width * logoScale,
          height: logo.height * logoScale,
        });
      }
    } catch (imageError) {
      console.error('Error processing images:', imageError);
      // Continue without images if there's an error
    }

    // Add text content
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Sculpture name
    page.drawText(sculpture.ai_generated_name || 'Untitled', {
      x: 50,
      y: height - 50,
      size: 24,
      font: helveticaBold,
    });

    // Material info
    page.drawText('MATERIAL', {
      x: width - 200,
      y: height - 150,
      size: 10,
      font: helveticaBold,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    page.drawText(sculpture.material?.name || 'Not specified', {
      x: width - 200,
      y: height - 170,
      size: 12,
      font: helvetica,
    });

    // Dimensions
    page.drawText('DIMENSIONS', {
      x: width - 200,
      y: height - 200,
      size: 10,
      font: helveticaBold,
      color: rgb(0.5, 0.5, 0.5),
    });

    const dimensions = [
      `H: ${sculpture.height_in || 0}″ (${sculpture.height_cm || 0}cm)`,
      `W: ${sculpture.width_in || 0}″ (${sculpture.width_cm || 0}cm)`,
      `D: ${sculpture.depth_in || 0}″ (${sculpture.depth_cm || 0}cm)`,
    ];

    dimensions.forEach((dim, index) => {
      page.drawText(dim, {
        x: width - 200,
        y: height - 220 - (index * 20),
        size: 12,
        font: helvetica,
      });
    });

    // Description
    if (sculpture.ai_description) {
      page.drawText('DESCRIPTION', {
        x: width - 200,
        y: height - 300,
        size: 10,
        font: helveticaBold,
        color: rgb(0.5, 0.5, 0.5),
      });

      const words = sculpture.ai_description.split(' ');
      let line = '';
      let yPos = height - 320;
      const maxWidth = 180;

      for (const word of words) {
        const testLine = line + word + ' ';
        const textWidth = helvetica.widthOfTextAtSize(testLine, 12);
        
        if (textWidth > maxWidth && line.length > 0) {
          page.drawText(line.trim(), {
            x: width - 200,
            y: yPos,
            size: 12,
            font: helvetica,
          });
          line = word + ' ';
          yPos -= 20;
        } else {
          line = testLine;
        }
      }
      
      if (line.length > 0) {
        page.drawText(line.trim(), {
          x: width - 200,
          y: yPos,
          size: 12,
          font: helvetica,
        });
      }
    }

    // Edition information at the bottom
    page.drawText('LIMITED EDITION OF 33', {
      x: width - 200,
      y: 100,
      size: 12,
      font: helveticaBold,
      color: rgb(0.5, 0.5, 0.5),
    });

    page.drawText('(available in multiple finishes and sizes)', {
      x: width - 200,
      y: 80,
      size: 10,
      font: helvetica,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Serialize the PDF to bytes
    const pdfBytes = await pdfDoc.save();
    
    // Convert to base64 in chunks to avoid stack overflow
    const chunkSize = 8192;
    const chunks = [];
    for (let i = 0; i < pdfBytes.length; i += chunkSize) {
      chunks.push(String.fromCharCode.apply(null, pdfBytes.subarray(i, i + chunkSize)));
    }
    const base64PDF = btoa(chunks.join(''));

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
