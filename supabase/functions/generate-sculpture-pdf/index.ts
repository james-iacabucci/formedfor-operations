
import { serve } from 'https://deno.fresh.dev/std@v1/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import PDFDocument from 'https://esm.sh/pdfkit@0.13.0';

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

    if (!sculptureId) {
      return new Response(
        JSON.stringify({ error: 'Sculpture ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch sculpture data with joined material and method info
    const { data: sculpture, error: sculptureError } = await supabaseClient
      .from('sculptures')
      .select(`
        *,
        material:material_id(name),
        method:method_id(name)
      `)
      .eq('id', sculptureId)
      .single();

    if (sculptureError || !sculpture) {
      console.error('Error fetching sculpture:', sculptureError);
      return new Response(
        JSON.stringify({ error: 'Sculpture not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create PDF document
    const doc = new PDFDocument();
    const chunks: Uint8Array[] = [];

    // Collect PDF chunks
    doc.on('data', (chunk) => chunks.push(chunk));

    // Add content to PDF
    doc
      .fontSize(24)
      .text(sculpture.ai_generated_name || 'Untitled Sculpture', { align: 'center' })
      .moveDown();

    doc
      .fontSize(12)
      .text(`ID: ${sculpture.id}`)
      .moveDown();

    if (sculpture.material?.name) {
      doc.text(`Material: ${sculpture.material.name}`);
    }

    if (sculpture.method?.name) {
      doc.text(`Method: ${sculpture.method.name}`);
    }

    if (sculpture.height_in && sculpture.width_in && sculpture.depth_in) {
      doc.text(`Dimensions: ${sculpture.height_in}" × ${sculpture.width_in}" × ${sculpture.depth_in}"`);
    }

    if (sculpture.weight_lbs) {
      doc.text(`Weight: ${sculpture.weight_lbs} lbs`);
    }

    if (sculpture.ai_description) {
      doc.moveDown()
        .text('Description:', { underline: true })
        .moveDown()
        .text(sculpture.ai_description, {
          width: 500,
          align: 'left'
        });
    }

    // Finalize PDF
    doc.end();

    // Combine chunks into a single Uint8Array
    const pdfBytes = new Uint8Array(chunks.reduce((acc, chunk) => [...acc, ...chunk], []));

    return new Response(pdfBytes, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${sculpture.ai_generated_name || 'sculpture'}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate PDF' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
