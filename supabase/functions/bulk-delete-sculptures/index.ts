import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.7";

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { deleteType, batchIds } = await req.json();
    
    console.log(`Bulk delete request: type=${deleteType}, batches=${batchIds?.length || 0}`);

    // Build query to get sculptures to delete
    let query = supabase.from('sculptures').select('id');
    
    if (deleteType === 'imported') {
      query = query.not('import_batch_id', 'is', null);
    } else if (deleteType === 'manual') {
      query = query.eq('is_manual', true);
    } else if (deleteType === 'excel_import') {
      query = query.eq('import_source', 'excel_import');
    } else if (deleteType === 'zip_import') {
      query = query.eq('import_source', 'zip_import');
    } else if (deleteType === 'specific_batches' && batchIds?.length > 0) {
      query = query.in('import_batch_id', batchIds);
    }

    const { data: sculptures, error: fetchError } = await query;
    
    if (fetchError) {
      console.error('Error fetching sculptures:', fetchError);
      throw fetchError;
    }

    if (!sculptures || sculptures.length === 0) {
      return new Response(
        JSON.stringify({ success: true, deleted: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sculptureIds = sculptures.map(s => s.id);
    console.log(`Deleting ${sculptureIds.length} sculptures`);

    // Delete in order to respect foreign key constraints:
    // 1. Delete chat_messages (via chat_threads)
    const { data: threads } = await supabase
      .from('chat_threads')
      .select('id')
      .in('sculpture_id', sculptureIds);
    
    if (threads && threads.length > 0) {
      const threadIds = threads.map(t => t.id);
      
      // Delete chat messages
      await supabase
        .from('chat_messages')
        .delete()
        .in('thread_id', threadIds);
      
      // Delete thread participants
      await supabase
        .from('chat_thread_participants')
        .delete()
        .in('thread_id', threadIds);
      
      // Delete chat threads
      await supabase
        .from('chat_threads')
        .delete()
        .in('sculpture_id', sculptureIds);
    }

    // 2. Delete fabrication quotes
    await supabase
      .from('fabrication_quotes')
      .delete()
      .in('sculpture_id', sculptureIds);

    // 3. Delete sculpture variants
    await supabase
      .from('sculpture_variants')
      .delete()
      .in('sculpture_id', sculptureIds);

    // 4. Delete sculpture tags
    await supabase
      .from('sculpture_tags')
      .delete()
      .in('sculpture_id', sculptureIds);

    // 5. Delete tasks related to sculptures
    await supabase
      .from('tasks')
      .delete()
      .in('sculpture_id', sculptureIds);

    // 6. Finally delete the sculptures
    const { error: deleteError } = await supabase
      .from('sculptures')
      .delete()
      .in('id', sculptureIds);

    if (deleteError) {
      console.error('Error deleting sculptures:', deleteError);
      throw deleteError;
    }

    console.log(`Successfully deleted ${sculptureIds.length} sculptures`);

    return new Response(
      JSON.stringify({ success: true, deleted: sculptureIds.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Bulk delete error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
