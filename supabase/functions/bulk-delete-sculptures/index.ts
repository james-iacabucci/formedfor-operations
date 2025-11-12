import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { deleteType, batchIds } = await req.json();

    console.log(`Bulk delete request: type=${deleteType}, batches=${batchIds?.length || 'all'}`);

    // Build query based on delete type
    let query = supabase.from('sculptures').select('id');

    if (deleteType === 'imported') {
      query = query.eq('import_source', 'excel_import');
      
      // Filter by specific batches if provided
      if (batchIds && batchIds.length > 0) {
        query = query.in('import_batch_id', batchIds);
      }
    } else if (deleteType === 'manual') {
      query = query.eq('import_source', 'manual');
    }
    // 'both' means no filter

    const { data: sculpturesToDelete, error: fetchError } = await query;

    if (fetchError) throw fetchError;

    if (!sculpturesToDelete || sculpturesToDelete.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          deletedCount: 0,
          message: 'No sculptures found matching criteria',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sculptureIds = sculpturesToDelete.map(s => s.id);
    console.log(`Deleting ${sculptureIds.length} sculptures`);

    // Delete related records first (to maintain referential integrity)
    
    // Delete sculpture tags
    await supabase
      .from('sculpture_tags')
      .delete()
      .in('sculpture_id', sculptureIds);

    // Delete sculpture variants
    await supabase
      .from('sculpture_variants')
      .delete()
      .in('sculpture_id', sculptureIds);

    // Delete fabrication quotes
    await supabase
      .from('fabrication_quotes')
      .delete()
      .in('sculpture_id', sculptureIds);

    // Delete tasks
    await supabase
      .from('tasks')
      .delete()
      .in('sculpture_id', sculptureIds);

    // Delete chat threads
    const { data: threads } = await supabase
      .from('chat_threads')
      .select('id')
      .in('sculpture_id', sculptureIds);

    if (threads && threads.length > 0) {
      const threadIds = threads.map(t => t.id);
      
      // Delete thread messages
      await supabase
        .from('chat_messages')
        .delete()
        .in('thread_id', threadIds);

      // Delete thread participants
      await supabase
        .from('chat_thread_participants')
        .delete()
        .in('thread_id', threadIds);

      // Delete threads
      await supabase
        .from('chat_threads')
        .delete()
        .in('id', threadIds);
    }

    // Finally, delete the sculptures
    const { error: deleteError } = await supabase
      .from('sculptures')
      .delete()
      .in('id', sculptureIds);

    if (deleteError) throw deleteError;

    console.log(`Successfully deleted ${sculptureIds.length} sculptures`);

    return new Response(
      JSON.stringify({
        success: true,
        deletedCount: sculptureIds.length,
        message: `Successfully deleted ${sculptureIds.length} sculpture(s)`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Bulk delete error:', error);
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
