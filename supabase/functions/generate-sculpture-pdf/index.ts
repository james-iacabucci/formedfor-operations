
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, rgb } from "https://cdn.skypack.dev/pdf-lib@1.17.1";

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

async function fetchFont(weight: string): Promise<Uint8Array | null> {
  const fontUrls = {
    normal: 'https://fonts.gstatic.com/s/montserrat/v25/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Hw5aXo.woff2',
    bold: 'https://fonts.gstatic.com/s/montserrat/v25/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCuM73w5aXo.woff2'
  };

  try {
    console.log(`Fetching Montserrat ${weight} font`);
    const response = await fetch(fontUrls[weight as keyof typeof fontUrls]);
    if (!response.ok) {
      throw new Error(`Failed to fetch font: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  } catch (error) {
    console.error('Error fetching font:', error);
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

    // Create PDF document with 16:9 aspect ratio
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([960, 540]);
    const { width, height } = page.getSize();

    // Fetch and embed Montserrat fonts
    console.log('Fetching fonts...');
    const normalFontBytes = await fetchFont('normal');
    const boldFontBytes = await fetchFont('bold');

    if (!normalFontBytes || !boldFontBytes) {
      throw new Error('Failed to load Montserrat fonts');
    }

    const normalFont = await pdfDoc.embedFont(normalFontBytes);
    const boldFont = await pdfDoc.embedFont(boldFontBytes);

    console.log('Fonts embedded successfully');

    // Calculate layout dimensions
    const imageWidth = width * 0.5;
    const textStartX = imageWidth + 40;
    const contentWidth = width - textStartX - 40;

    // Add images with proper error handling
    try {
      // Main sculpture image - full height, left edge
      if (sculpture.image_url) {
        const imageBytes = await fetchImageAsBytes(sculpture.image_url);
        if (imageBytes) {
          const image = await pdfDoc.embedJpg(imageBytes);
          const scale = Math.max(imageWidth / image.width, height / image.height);
          const scaledWidth = image.width * scale;
          const scaledHeight = image.height * scale;
          
          // Center the image horizontally if it's wider than the space
          const xOffset = (imageWidth - scaledWidth) / 2;
          
          page.drawImage(image, {
            x: xOffset,
            y: 0,
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
          const logoMaxWidth = width * 0.15;
          const logoMaxHeight = height * 0.1;
          const logoScale = Math.min(logoMaxWidth / logo.width, logoMaxHeight / logo.height);
          
          page.drawImage(logo, {
            x: width - (logo.width * logoScale) - 40,
            y: height - (logo.height * logoScale) - 40,
            width: logo.width * logoScale,
            height: logo.height * logoScale,
          });
        }
      }
    } catch (imageError) {
      console.error('Error processing images:', imageError);
    }

    let currentY = height - 60;

    // Sculpture name - large, at the top
    const name = sculpture.ai_generated_name || 'Untitled';
    page.drawText(name.toUpperCase(), {
      x: textStartX,
      y: currentY,
      size: 24,
      font: boldFont,
    });

    currentY -= 60;

    // Material section
    page.drawText('MATERIAL', {
      x: textStartX,
      y: currentY,
      size: 12,
      font: boldFont,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    currentY -= 25;
    
    page.drawText(sculpture.material?.name || 'Not specified', {
      x: textStartX,
      y: currentY,
      size: 14,
      font: normalFont,
    });

    currentY -= 40;

    // Dimensions section
    page.drawText('DIMENSIONS', {
      x: textStartX,
      y: currentY,
      size: 12,
      font: boldFont,
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
        font: normalFont,
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
        font: boldFont,
        color: rgb(0.5, 0.5, 0.5),
      });

      currentY -= 25;

      const words = sculpture.ai_description.split(' ');
      let line = '';

      for (const word of words) {
        const testLine = line + word + ' ';
        const textWidth = normalFont.widthOfTextAtSize(testLine, 14);
        
        if (textWidth > contentWidth && line.length > 0) {
          page.drawText(line.trim(), {
            x: textStartX,
            y: currentY,
            size: 14,
            font: normalFont,
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
          font: normalFont,
        });
      }
    }

    // Edition information at the bottom
    const editionY = 80;
    page.drawText('LIMITED EDITION OF 33', {
      x: textStartX,
      y: editionY,
      size: 14,
      font: boldFont,
      color: rgb(0.5, 0.5, 0.5),
    });

    page.drawText('(available in multiple finishes and sizes)', {
      x: textStartX,
      y: editionY - 25,
      size: 12,
      font: normalFont,
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
