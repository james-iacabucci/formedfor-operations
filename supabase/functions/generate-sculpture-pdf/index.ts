
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, rgb, StandardFonts } from "https://cdn.skypack.dev/pdf-lib@1.17.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchImageAsBytes(url: string): Promise<Uint8Array | null> {
  try {
    console.log('Fetching image:', url);
    const response = await fetch(url);
    if (!response.ok) {
      console.error('Failed to fetch image:', response.statusText);
      return null;
    }
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
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

    // Create a new PDF document - A4 Landscape (width: 842, height: 595)
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([842, 595]); // A4 Landscape
    const { width, height } = page.getSize();

    // Define layout constants
    const margin = 50;
    const imageWidth = 400;
    const textStartX = margin + imageWidth + 60; // Start text content after image
    const contentWidth = width - textStartX - margin;

    // Add images with proper error handling
    try {
      // Main sculpture image - large, on the left side
      if (sculpture.image_url) {
        const imageBytes = await fetchImageAsBytes(sculpture.image_url);
        if (imageBytes) {
          const image = await pdfDoc.embedJpg(imageBytes);
          const scale = Math.min(imageWidth / image.width, (height - 2 * margin) / image.height);
          const scaledWidth = image.width * scale;
          const scaledHeight = image.height * scale;
          
          // Center the image vertically in the left section
          const imageY = margin + ((height - 2 * margin) - scaledHeight) / 2;
          
          page.drawImage(image, {
            x: margin,
            y: imageY,
            width: scaledWidth,
            height: scaledHeight,
          });
        }
      }

      // Product line logo - top right
      if (sculpture.product_line?.black_logo_url) {
        const logoBytes = await fetchImageAsBytes(sculpture.product_line.black_logo_url);
        if (logoBytes) {
          const logo = await pdfDoc.embedPng(logoBytes);
          const logoMaxWidth = 120;
          const logoMaxHeight = 60;
          const logoScale = Math.min(logoMaxWidth / logo.width, logoMaxHeight / logo.height);
          
          page.drawImage(logo, {
            x: width - margin - (logo.width * logoScale),
            y: height - margin - (logo.height * logoScale),
            width: logo.width * logoScale,
            height: logo.height * logoScale,
          });
        }
      }
    } catch (imageError) {
      console.error('Error processing images:', imageError);
    }

    // Add text content
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let currentY = height - margin - 20; // Start below top margin

    // Sculpture name - large, at the top
    const name = sculpture.ai_generated_name || 'Untitled';
    page.drawText(name.toUpperCase(), {
      x: textStartX,
      y: currentY,
      size: 24,
      font: helveticaBold,
    });

    currentY -= 60; // Space after title

    // Material section
    page.drawText('MATERIAL', {
      x: textStartX,
      y: currentY,
      size: 12,
      font: helveticaBold,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    currentY -= 25;
    
    page.drawText(sculpture.material?.name || 'Not specified', {
      x: textStartX,
      y: currentY,
      size: 14,
      font: helvetica,
    });

    currentY -= 40;

    // Dimensions section
    page.drawText('DIMENSIONS', {
      x: textStartX,
      y: currentY,
      size: 12,
      font: helveticaBold,
      color: rgb(0.5, 0.5, 0.5),
    });

    currentY -= 25;

    const dimensions = [
      `H: ${sculpture.height_in || 0} in (${sculpture.height_cm || 0}cm)`,
      `W: ${sculpture.width_in || 0} in (${sculpture.width_cm || 0}cm)`,
      `D: ${sculpture.depth_in || 0} in (${sculpture.depth_cm || 0}cm)`,
    ];

    dimensions.forEach((dim) => {
      page.drawText(dim, {
        x: textStartX,
        y: currentY,
        size: 14,
        font: helvetica,
      });
      currentY -= 20;
    });

    currentY -= 20;

    // Description section
    if (sculpture.ai_description) {
      page.drawText('DESCRIPTION', {
        x: textStartX,
        y: currentY,
        size: 12,
        font: helveticaBold,
        color: rgb(0.5, 0.5, 0.5),
      });

      currentY -= 25;

      const words = sculpture.ai_description.split(' ');
      let line = '';
      const maxWidth = contentWidth;

      for (const word of words) {
        const testLine = line + word + ' ';
        const textWidth = helvetica.widthOfTextAtSize(testLine, 14);
        
        if (textWidth > maxWidth && line.length > 0) {
          page.drawText(line.trim(), {
            x: textStartX,
            y: currentY,
            size: 14,
            font: helvetica,
          });
          line = word + ' ';
          currentY -= 20;
        } else {
          line = testLine;
        }
      }
      
      if (line.length > 0) {
        page.drawText(line.trim(), {
          x: textStartX,
          y: currentY,
          size: 14,
          font: helvetica,
        });
      }
    }

    // Edition information - fixed at the bottom of the text section
    const editionY = margin + 60;
    page.drawText('LIMITED EDITION OF 33', {
      x: textStartX,
      y: editionY,
      size: 14,
      font: helveticaBold,
      color: rgb(0.5, 0.5, 0.5),
    });

    page.drawText('(available in multiple finishes and sizes)', {
      x: textStartX,
      y: editionY - 25,
      size: 12,
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
