import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImportRow {
  rowNumber: number;
  data: Record<string, any>;
}

interface ImportResult {
  success: boolean;
  sculptureId?: string;
  sculptureName?: string;
  action?: 'created' | 'updated';
  error?: string;
  warnings?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { rows, batchId, userId } = await req.json();

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      throw new Error('No rows provided for import');
    }

    console.log(`Starting import batch ${batchId} with ${rows.length} rows`);

    const results: ImportResult[] = [];
    let successCount = 0;
    let errorCount = 0;

    // Log batch start
    await supabase.from('import_logs').insert({
      batch_id: batchId,
      level: 'info',
      message: `Starting import batch with ${rows.length} rows`,
      row_number: null,
    });

    // Process each row
    for (const row of rows as ImportRow[]) {
      try {
        const result = await processRow(supabase, row, batchId, userId);
        results.push(result);
        
        if (result.success) {
          successCount++;
          await supabase.from('import_logs').insert({
            batch_id: batchId,
            level: 'info',
            message: `${result.action === 'created' ? 'Created' : 'Updated'} sculpture "${result.sculptureName}"`,
            row_number: row.rowNumber,
            row_data: row.data,
          });
        } else {
          errorCount++;
          await supabase.from('import_logs').insert({
            batch_id: batchId,
            level: 'error',
            message: result.error || 'Unknown error',
            row_number: row.rowNumber,
            row_data: row.data,
          });
        }
      } catch (error) {
        errorCount++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({
          success: false,
          error: errorMessage,
        });
        
        await supabase.from('import_logs').insert({
          batch_id: batchId,
          level: 'error',
          message: errorMessage,
          row_number: row.rowNumber,
          row_data: row.data,
        });
      }
    }

    // Update batch status
    await supabase.from('import_batches').update({
      successful_rows: successCount,
      failed_rows: errorCount,
      status: errorCount === 0 ? 'completed' : 'completed',
      completed_at: new Date().toISOString(),
    }).eq('id', batchId);

    // Log batch completion
    await supabase.from('import_logs').insert({
      batch_id: batchId,
      level: 'info',
      message: `Batch complete: ${successCount} success, ${errorCount} errors`,
      row_number: null,
    });

    return new Response(
      JSON.stringify({
        success: true,
        results,
        summary: {
          total: rows.length,
          successful: successCount,
          failed: errorCount,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Import error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function processRow(
  supabase: any,
  row: ImportRow,
  batchId: string,
  userId: string
): Promise<ImportResult> {
  const { data: rowData, rowNumber } = row;
  const warnings: string[] = [];

  // Extract and validate data
  const name = rowData.name || rowData.sculpture_name || rowData['Sculpture Name'];
  if (!name) {
    return { success: false, error: 'Missing sculpture name' };
  }

  const productLineName = rowData.product_line || rowData['Product Line'];
  if (!productLineName) {
    return { success: false, error: 'Missing product line' };
  }

  // Lookup product line
  const { data: productLine } = await supabase
    .from('product_lines')
    .select('id')
    .ilike('name', productLineName)
    .single();

  if (!productLine) {
    return { success: false, error: `Product line "${productLineName}" not found` };
  }

  // Prepare sculpture data
  const sculptureData: any = {
    manual_name: name,
    product_line_id: productLine.id,
    created_by: userId,
    import_source: 'excel_import',
    import_batch_id: batchId,
    last_import_date: new Date().toISOString(),
    import_metadata: rowData,
    status: rowData.status || 'idea',
    prompt: rowData.prompt || rowData.description || `Imported sculpture: ${name}`,
  };

  // Add optional fields
  if (rowData.description || rowData.manual_description) {
    sculptureData.manual_description = rowData.description || rowData.manual_description;
  }

  // Dimensions
  if (rowData.height_in) sculptureData.height_in = parseFloat(rowData.height_in);
  if (rowData.width_in) sculptureData.width_in = parseFloat(rowData.width_in);
  if (rowData.depth_in) sculptureData.depth_in = parseFloat(rowData.depth_in);
  if (rowData.weight_lbs) sculptureData.weight_lbs = parseFloat(rowData.weight_lbs);

  // Auto-convert to metric
  if (sculptureData.height_in) sculptureData.height_cm = sculptureData.height_in * 2.54;
  if (sculptureData.width_in) sculptureData.width_cm = sculptureData.width_in * 2.54;
  if (sculptureData.depth_in) sculptureData.depth_cm = sculptureData.depth_in * 2.54;
  if (sculptureData.weight_lbs) sculptureData.weight_kg = sculptureData.weight_lbs / 2.20462;

  // Base dimensions
  if (rowData.base_height_in) sculptureData.base_height_in = parseFloat(rowData.base_height_in);
  if (rowData.base_width_in) sculptureData.base_width_in = parseFloat(rowData.base_width_in);
  if (rowData.base_depth_in) sculptureData.base_depth_in = parseFloat(rowData.base_depth_in);
  if (rowData.base_weight_lbs) sculptureData.base_weight_lbs = parseFloat(rowData.base_weight_lbs);

  if (sculptureData.base_height_in) sculptureData.base_height_cm = sculptureData.base_height_in * 2.54;
  if (sculptureData.base_width_in) sculptureData.base_width_cm = sculptureData.base_width_in * 2.54;
  if (sculptureData.base_depth_in) sculptureData.base_depth_cm = sculptureData.base_depth_in * 2.54;
  if (sculptureData.base_weight_lbs) sculptureData.base_weight_kg = sculptureData.base_weight_lbs / 2.20462;

  // Lookup material if provided
  if (rowData.material || rowData.material_name) {
    const { data: material } = await supabase
      .from('value_lists')
      .select('id')
      .eq('type', 'material')
      .ilike('name', rowData.material || rowData.material_name)
      .single();
    
    if (material) {
      sculptureData.material_id = material.id;
    } else {
      warnings.push(`Material "${rowData.material || rowData.material_name}" not found`);
    }
  }

  // Lookup method if provided
  if (rowData.method || rowData.method_name) {
    const { data: method } = await supabase
      .from('value_lists')
      .select('id')
      .eq('type', 'method')
      .ilike('name', rowData.method || rowData.method_name)
      .single();
    
    if (method) {
      sculptureData.method_id = method.id;
    } else {
      warnings.push(`Method "${rowData.method || rowData.method_name}" not found`);
    }
  }

  // Base material
  if (rowData.base_material || rowData.base_material_name) {
    const { data: baseMaterial } = await supabase
      .from('value_lists')
      .select('id')
      .eq('type', 'material')
      .ilike('name', rowData.base_material || rowData.base_material_name)
      .single();
    
    if (baseMaterial) {
      sculptureData.base_material_id = baseMaterial.id;
    } else {
      warnings.push(`Base material "${rowData.base_material || rowData.base_material_name}" not found`);
    }
  }

  // Base method
  if (rowData.base_method || rowData.base_method_name) {
    const { data: baseMethod } = await supabase
      .from('value_lists')
      .select('id')
      .eq('type', 'method')
      .ilike('name', rowData.base_method || rowData.base_method_name)
      .single();
    
    if (baseMethod) {
      sculptureData.base_method_id = baseMethod.id;
    } else {
      warnings.push(`Base method "${rowData.base_method || rowData.base_method_name}" not found`);
    }
  }

  // Handle image URL
  if (rowData.image_url) {
    // For now, just store the URL - could implement download in future
    sculptureData.image_url = rowData.image_url;
  }

  // Check if sculpture exists (match by name and product line)
  const { data: existingSculpture } = await supabase
    .from('sculptures')
    .select('id')
    .eq('product_line_id', productLine.id)
    .ilike('manual_name', name)
    .single();

  let sculptureId: string;
  let action: 'created' | 'updated';

  if (existingSculpture) {
    // Update existing sculpture
    const { data, error } = await supabase
      .from('sculptures')
      .update(sculptureData)
      .eq('id', existingSculpture.id)
      .select('id')
      .single();

    if (error) throw error;
    sculptureId = data.id;
    action = 'updated';
  } else {
    // Create new sculpture
    const { data, error } = await supabase
      .from('sculptures')
      .insert(sculptureData)
      .select('id')
      .single();

    if (error) throw error;
    sculptureId = data.id;
    action = 'created';
  }

  // Handle tags if provided
  if (rowData.tags) {
    const tagNames = typeof rowData.tags === 'string' 
      ? rowData.tags.split(',').map(t => t.trim())
      : rowData.tags;

    for (const tagName of tagNames) {
      if (!tagName) continue;

      // Find or create tag
      let { data: tag } = await supabase
        .from('tags')
        .select('id')
        .ilike('name', tagName)
        .single();

      if (!tag) {
        const { data: newTag } = await supabase
          .from('tags')
          .insert({ name: tagName })
          .select('id')
          .single();
        tag = newTag;
      }

      if (tag) {
        // Create tag relation if it doesn't exist
        await supabase
          .from('sculpture_tags')
          .upsert({ 
            sculpture_id: sculptureId, 
            tag_id: tag.id 
          }, { 
            onConflict: 'sculpture_id,tag_id' 
          });
      }
    }
  }

  return {
    success: true,
    sculptureId,
    sculptureName: name,
    action,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}
