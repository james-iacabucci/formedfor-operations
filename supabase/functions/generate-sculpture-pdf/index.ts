import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, rgb } from "https://esm.sh/pdf-lib@1.17.1";
import fontkit from "https://esm.sh/@pdf-lib/fontkit@1.1.1";

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

const calculateTotal = (quote: { 
  fabrication_cost: number; 
  shipping_cost: number; 
  customs_cost: number; 
  other_cost: number; 
}) => {
  return (
    (quote.fabrication_cost || 0) +
    (quote.shipping_cost || 0) +
    (quote.customs_cost || 0) +
    (quote.other_cost || 0)
  );
};

const calculateTradePrice = (quote: { 
  markup: number;
  fabrication_cost: number;
  shipping_cost: number;
  customs_cost: number;
  other_cost: number;
}) => {
  return calculateTotal(quote) * (quote.markup || 4);
};

const calculateRetailPrice = (tradePrice: number) => {
  return Math.ceil(tradePrice / (1 - 0.35) / 250) * 250;
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-US', { 
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  }).format(num);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sculptureId, pricingMode = 'none' } = await req.json();
    console.log("Generating PDF for sculpture:", sculptureId, "with pricing mode:", pricingMode);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch sculpture data with the selected quote
    const { data: sculpture, error: sculptureError } = await supabase
      .from('sculptures')
      .select(`
        *,
        product_line:product_lines(
          name,
          black_logo_url,
          white_logo_url
        ),
        material:value_lists!sculptures_material_id_fkey(name),
        fabrication_quotes!inner(*)
      `)
      .eq('id', sculptureId)
      .eq('fabrication_quotes.is_selected', true)
      .single();

    if (sculptureError) throw sculptureError;
    if (!sculpture) throw new Error('Sculpture not found');

    // Create PDF document with 16:9 aspect ratio
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    
    const page = pdfDoc.addPage([960, 540]);
    const { width, height } = page.getSize();

    // Draw off-white background for content area
    page.drawRectangle({
      x: width * 0.5, // Start at the middle of the page
      y: 0,
      width: width * 0.5, // Cover right half of the page
      height: height,
      color: rgb(0.97, 0.97, 0.97) // Off-white color matching the image
    });

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
    const contentCenterX = textStartX + (contentWidth / 2);

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

      // Product line logo - centered and twice as large
      if (sculpture.product_line?.black_logo_url) {
        const logoBytes = await fetchImageAsBytes(sculpture.product_line.black_logo_url);
        if (logoBytes) {
          const logo = await pdfDoc.embedPng(logoBytes);
          const logoMaxWidth = width * 0.3; // Doubled from previous 0.15
          const logoMaxHeight = height * 0.2; // Doubled from previous 0.1
          const logoScale = Math.min(logoMaxWidth / logo.width, logoMaxHeight / logo.height);
          const scaledLogoWidth = logo.width * logoScale;
          
          page.drawImage(logo, {
            x: contentCenterX - (scaledLogoWidth / 2), // Center in content area
            y: height - (logo.height * logoScale) - 40,
            width: scaledLogoWidth,
            height: logo.height * logoScale,
          });
        }
      }
    } catch (imageError) {
      console.error('Error processing images:', imageError);
    }

    // Start content layout from top
    let currentY = height - 200;

    // Sculpture name - below logo, in proper case with thinner font
    const name = sculpture.name || 'Untitled';
    const nameWidth = normalFont.widthOfTextAtSize(name, 24);
    page.drawText(name, {
      x: contentCenterX - (nameWidth / 2),
      y: currentY,
      size: 24,
      font: normalFont,
    });

    // Add space after the name
    currentY -= 40;

    // Price row (if applicable)
    if (pricingMode !== 'none' && sculpture.fabrication_quotes?.[0]) {
      const quote = sculpture.fabrication_quotes[0];
      const tradePrice = calculateTradePrice(quote);
      const retailPrice = calculateRetailPrice(tradePrice);
      
      let priceText = '';
      if (pricingMode === 'trade') {
        priceText = `Trade: $${formatNumber(tradePrice)}`;
      } else if (pricingMode === 'retail') {
        priceText = `Trade: $${formatNumber(tradePrice)}  |  Retail: $${formatNumber(retailPrice)}`;
      }
      
      const priceWidth = normalFont.widthOfTextAtSize(priceText, 10.5);
      page.drawText(priceText, {
        x: contentCenterX - (priceWidth / 2),
        y: currentY,
        size: 10.5,
        font: normalFont,
      });

      // Add space after the price
      currentY -= 30;
    }

    // Material (centered between price and HWD)
    const materialText = sculpture.material?.name || 'Not specified';
    const materialWidth = normalFont.widthOfTextAtSize(materialText, 10.5);
    page.drawText(materialText, {
      x: contentCenterX - (materialWidth / 2),
      y: currentY,
      size: 10.5,
      font: normalFont,
    });

    // Add space after material, before HWD
    currentY -= 30;

    // Dimensions - HWD format with both units
    const dimensionsText = `HWD ${sculpture.height_in || 0} × ${sculpture.width_in || 0} × ${sculpture.depth_in || 0} (in) | ${(sculpture.height_in || 0) * 2.54} × ${(sculpture.width_in || 0) * 2.54} × ${(sculpture.depth_in || 0) * 2.54} (cm)`;
    const dimensionsWidth = normalFont.widthOfTextAtSize(dimensionsText, 10.5);
    page.drawText(dimensionsText, {
      x: contentCenterX - (dimensionsWidth / 2),
      y: currentY,
      size: 10.5,
      font: normalFont,
    });

    // Description with same font size as material
    if (sculpture.ai_description) {
      currentY -= 40;

      const words = sculpture.ai_description.split(' ');
      let line = '';
      const contentPadding = 30; // Reduced from 40 for less padding
      const adjustedContentWidth = contentWidth - (contentPadding * 2);

      for (const word of words) {
        const testLine = line + word + ' ';
        const textWidth = normalFont.widthOfTextAtSize(testLine, 10.5); // Matches material font size
        
        if (textWidth > adjustedContentWidth && line.length > 0) {
          const lineWidth = normalFont.widthOfTextAtSize(line.trim(), 10.5);
          page.drawText(line.trim(), {
            x: contentCenterX - (lineWidth / 2),
            y: currentY,
            size: 10.5, // Matches material font size
            font: normalFont,
          });
          line = word + ' ';
          currentY -= 16; // Adjusted for smaller font
        } else {
          line = testLine;
        }
      }
      
      if (line.length > 0) {
        const finalLineWidth = normalFont.widthOfTextAtSize(line.trim(), 10.5);
        page.drawText(line.trim(), {
          x: contentCenterX - (finalLineWidth / 2),
          y: currentY,
          size: 10.5, // Matches material font size
          font: normalFont,
        });
      }
    }

    // Edition information at the bottom
    const editionY = 40;
    const editionText = 'LIMITED EDITION OF 33';
    const editionWidth = normalFont.widthOfTextAtSize(editionText, 7); // Changed from boldFont to normalFont
    page.drawText(editionText, {
      x: contentCenterX - (editionWidth / 2),
      y: editionY,
      size: 7,
      font: normalFont, // Changed from boldFont to normalFont
      color: rgb(0.5, 0.5, 0.5),
    });

    const subEditionText = '(available in multiple finishes and sizes)';
    const subEditionWidth = normalFont.widthOfTextAtSize(subEditionText, 7);
    page.drawText(subEditionText, {
      x: contentCenterX - (subEditionWidth / 2),
      y: editionY - 12,
      size: 7,
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
