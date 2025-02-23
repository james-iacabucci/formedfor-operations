
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, rgb } from "https://cdn.skypack.dev/pdf-lib@1.17.1";
import fontkit from "https://cdn.skypack.dev/@pdf-lib/fontkit@1.1.1";

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
    normal: 'https://github.com/JulietaUla/Montserrat/raw/master/fonts/ttf/Montserrat-Regular.ttf',
    bold: 'https://github.com/JulietaUla/Montserrat/raw/master/fonts/ttf/Montserrat-Bold.ttf'
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

    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    
    const page = pdfDoc.addPage([960, 540]);
    const { width, height } = page.getSize();

    // Embed fonts
    console.log('Fetching fonts...');
    const normalFontBytes = await fetchFont('normal');
    const boldFontBytes = await fetchFont('bold');

    if (!normalFontBytes || !boldFontBytes) {
      throw new Error('Failed to load Montserrat fonts');
    }

    const normalFont = await pdfDoc.embedFont(normalFontBytes);
    const boldFont = await pdfDoc.embedFont(boldFontBytes);

    console.log('Fonts embedded successfully');

    // Layout constants
    const margin = 40;
    const leftSection = width * 0.5;
    const rightSection = width - leftSection - margin;
    const redLineColor = rgb(0.8, 0.2, 0.2);

    // Add sculpture image on the left
    if (sculpture.image_url) {
      const imageBytes = await fetchImageAsBytes(sculpture.image_url);
      if (imageBytes) {
        const image = await pdfDoc.embedJpg(imageBytes);
        const imgAspectRatio = image.width / image.height;
        let imgWidth = leftSection - margin * 2;
        let imgHeight = imgWidth / imgAspectRatio;
        
        // Ensure image fits height
        if (imgHeight > height - margin * 2) {
          imgHeight = height - margin * 2;
          imgWidth = imgHeight * imgAspectRatio;
        }
        
        // Center image in left section
        const xOffset = margin + (leftSection - margin * 2 - imgWidth) / 2;
        const yOffset = (height - imgHeight) / 2;
        
        page.drawImage(image, {
          x: xOffset,
          y: yOffset,
          width: imgWidth,
          height: imgHeight,
        });
      }
    }

    // Right section content
    const rightStart = leftSection + margin;

    // Draw diagonal lines and title
    const lineLength = 100;
    const lineAngle = Math.PI / 4; // 45 degrees
    const lineOffsetY = height - margin - 20;
    
    // Top diagonal red line
    page.drawLine({
      start: { x: rightStart, y: lineOffsetY },
      end: { x: rightStart + lineLength * Math.cos(lineAngle), 
             y: lineOffsetY - lineLength * Math.sin(lineAngle) },
      color: redLineColor,
      thickness: 1,
    });

    // Title text
    const name = sculpture.ai_generated_name || 'Untitled';
    let currentY = height - margin - 60;
    page.drawText(name, {
      x: rightStart,
      y: currentY,
      size: 24,
      font: boldFont,
    });

    currentY -= 80;

    // Center logo and "FORMED FOR" text
    if (sculpture.product_line?.black_logo_url) {
      const logoBytes = await fetchImageAsBytes(sculpture.product_line.black_logo_url);
      if (logoBytes) {
        const logo = await pdfDoc.embedPng(logoBytes);
        const logoMaxWidth = 80;
        const logoMaxHeight = 80;
        const logoScale = Math.min(logoMaxWidth / logo.width, logoMaxHeight / logo.height);
        
        const logoWidth = logo.width * logoScale;
        const logoX = rightStart + (rightSection - logoWidth) / 2;
        
        page.drawImage(logo, {
          x: logoX,
          y: currentY,
          width: logoWidth,
          height: logo.height * logoScale,
        });

        currentY -= 40;
        
        const formedForText = "FORMED FOR";
        const textWidth = boldFont.widthOfTextAtSize(formedForText, 12);
        page.drawText(formedForText, {
          x: rightStart + (rightSection - textWidth) / 2,
          y: currentY,
          size: 12,
          font: boldFont,
        });
      }
    }

    currentY -= 60;

    // Sculpture name in larger font
    page.drawText(name, {
      x: rightStart,
      y: currentY,
      size: 28,
      font: boldFont,
    });

    currentY -= 40;

    // Material text with red line
    page.drawLine({
      start: { x: rightStart, y: currentY + 10 },
      end: { x: rightStart + lineLength * Math.cos(lineAngle), 
             y: currentY + 10 - lineLength * Math.sin(lineAngle) },
      color: redLineColor,
      thickness: 1,
    });

    page.drawText((sculpture.material?.name || 'Not specified'), {
      x: rightStart,
      y: currentY,
      size: 14,
      font: normalFont,
    });

    currentY -= 40;

    // Dimensions with elegant formatting
    const formatDimension = (value: number | null, unit: string) => 
      `${value?.toFixed(2) || '0'} ${unit}`;

    const dimensions = [
      `Height: ${formatDimension(sculpture.height_in, 'in')} | ${formatDimension(sculpture.height_cm, 'cm')}`,
      `Width: ${formatDimension(sculpture.width_in, 'in')} | ${formatDimension(sculpture.width_cm, 'cm')}`,
      `Depth: ${formatDimension(sculpture.depth_in, 'in')} | ${formatDimension(sculpture.depth_cm, 'cm')}`,
    ];

    dimensions.forEach((dim) => {
      page.drawText(dim, {
        x: rightStart,
        y: currentY,
        size: 12,
        font: normalFont,
      });
      currentY -= 20;
    });

    currentY -= 40;

    // Description with better text wrapping
    if (sculpture.ai_description) {
      const words = sculpture.ai_description.split(' ');
      let line = '';
      const maxWidth = rightSection - margin;

      for (const word of words) {
        const testLine = line + word + ' ';
        const textWidth = normalFont.widthOfTextAtSize(testLine, 12);
        
        if (textWidth > maxWidth && line.length > 0) {
          page.drawText(line.trim(), {
            x: rightStart,
            y: currentY,
            size: 12,
            font: normalFont,
          });
          line = word + ' ';
          currentY -= 16;
        } else {
          line = testLine;
        }
      }
      
      if (line.length > 0) {
        page.drawText(line.trim(), {
          x: rightStart,
          y: currentY,
          size: 12,
          font: normalFont,
        });
      }
    }

    // Edition information at the bottom
    const editionY = margin + 40;
    page.drawText('LIMITED EDITION OF 33', {
      x: rightStart,
      y: editionY,
      size: 12,
      font: boldFont,
    });

    page.drawText('(available in multiple finishes and sizes)', {
      x: rightStart,
      y: editionY - 20,
      size: 10,
      font: normalFont,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Serialize PDF
    const pdfBytes = await pdfDoc.save();
    
    // Convert to base64 in chunks
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
