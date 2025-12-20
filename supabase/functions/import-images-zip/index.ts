import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import * as zip from "https://deno.land/x/zipjs@v2.7.32/index.js"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Convert filename to Title Case
function toTitleCase(str: string): string {
  return str
    .replace(/[-_]/g, ' ') // Replace hyphens and underscores with spaces
    .replace(/\s+/g, ' ') // Normalize multiple spaces
    .trim()
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Check if file is a supported image type
function isSupportedImage(filename: string): boolean {
  const ext = filename.toLowerCase().split('.').pop()
  return ['png', 'jpg', 'jpeg', 'webp'].includes(ext || '')
}

// Get file extension
function getExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || 'png'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get request data
    const formData = await req.formData()
    const zipFile = formData.get('file') as File
    const userId = formData.get('userId') as string

    if (!zipFile || !userId) {
      throw new Error('Missing required parameters: file and userId')
    }

    console.log(`Starting ZIP import for user: ${userId}, file: ${zipFile.name}`)

    // Create import batch record
    const { data: batch, error: batchError } = await supabase
      .from('import_batches')
      .insert({
        created_by: userId,
        file_name: zipFile.name,
        status: 'in_progress',
      })
      .select()
      .single()

    if (batchError) {
      console.error('Failed to create import batch:', batchError)
      throw batchError
    }

    console.log(`Created import batch: ${batch.id}`)

    // Read ZIP file
    const zipBlob = new Blob([await zipFile.arrayBuffer()])
    const zipReader = new zip.ZipReader(new zip.BlobReader(zipBlob))
    const entries = await zipReader.getEntries()

    console.log(`Found ${entries.length} entries in ZIP`)

    // Filter for supported image files (not in subdirectories)
    const imageEntries = entries.filter(entry => {
      if (entry.directory) return false
      const filename = entry.filename
      // Skip files in subdirectories (check for / in path)
      const pathParts = filename.split('/')
      if (pathParts.length > 2) return false // More than one level deep
      // Get actual filename (last part of path)
      const actualFilename = pathParts[pathParts.length - 1]
      // Skip hidden files (starting with .)
      if (actualFilename.startsWith('.')) return false
      // Skip macOS metadata files
      if (actualFilename.startsWith('__MACOSX')) return false
      if (filename.includes('__MACOSX')) return false
      return isSupportedImage(actualFilename)
    })

    console.log(`Found ${imageEntries.length} valid image files`)

    // Get the Formed For product line ID
    const FORMED_FOR_PRODUCT_LINE_ID = '6a1e09cf-7599-43e2-9f6f-919f7c0264a8'

    // Process results
    const results: Array<{
      filename: string
      sculptureName: string
      success: boolean
      action: 'created' | 'skipped' | 'error'
      message: string
    }> = []

    let successCount = 0
    let skipCount = 0
    let errorCount = 0

    for (const entry of imageEntries) {
      // Get actual filename without path
      const pathParts = entry.filename.split('/')
      const actualFilename = pathParts[pathParts.length - 1]
      
      // Get name without extension
      const nameWithoutExt = actualFilename.substring(0, actualFilename.lastIndexOf('.'))
      const sculptureName = toTitleCase(nameWithoutExt)
      const extension = getExtension(actualFilename)

      console.log(`Processing: ${actualFilename} -> "${sculptureName}"`)

      try {
        // Check if sculpture already exists (case-insensitive match on manual_name)
        const { data: existingSculpture } = await supabase
          .from('sculptures')
          .select('id, manual_name')
          .ilike('manual_name', sculptureName)
          .limit(1)
          .single()

        if (existingSculpture) {
          console.log(`Sculpture "${sculptureName}" already exists, skipping`)
          skipCount++
          results.push({
            filename: actualFilename,
            sculptureName,
            success: true,
            action: 'skipped',
            message: `Already exists as "${existingSculpture.manual_name}"`,
          })

          // Log to import_logs
          await supabase.from('import_logs').insert({
            batch_id: batch.id,
            level: 'info',
            message: `Skipped: "${sculptureName}" already exists`,
            row_data: { filename: actualFilename, sculptureName },
          })

          continue
        }

        // Extract image data
        const imageBlob = await entry.getData!(new zip.BlobWriter())
        const imageArrayBuffer = await imageBlob.arrayBuffer()
        const imageBytes = new Uint8Array(imageArrayBuffer)

        // Generate a unique sculpture ID
        const sculptureId = crypto.randomUUID()

        // Upload image to storage
        const storagePath = `${sculptureId}/thumbnail.${extension}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('sculptures')
          .upload(storagePath, imageBytes, {
            contentType: `image/${extension === 'jpg' ? 'jpeg' : extension}`,
            upsert: false,
          })

        if (uploadError) {
          console.error(`Failed to upload image for ${sculptureName}:`, uploadError)
          throw uploadError
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('sculptures')
          .getPublicUrl(storagePath)

        const imageUrl = publicUrlData.publicUrl

        // Create sculpture record
        const { error: sculptureError } = await supabase
          .from('sculptures')
          .insert({
            id: sculptureId,
            manual_name: sculptureName,
            prompt: `Imported: ${sculptureName}`,
            image_url: imageUrl,
            product_line_id: FORMED_FOR_PRODUCT_LINE_ID,
            status: 'approved',
            import_source: 'zip_import',
            is_manual: true,
            created_by: userId,
            import_batch_id: batch.id,
            last_import_date: new Date().toISOString(),
            ai_engine: 'manual',
          })

        if (sculptureError) {
          console.error(`Failed to create sculpture ${sculptureName}:`, sculptureError)
          throw sculptureError
        }

        console.log(`Created sculpture: ${sculptureName} (${sculptureId})`)
        successCount++
        results.push({
          filename: actualFilename,
          sculptureName,
          success: true,
          action: 'created',
          message: `Successfully created`,
        })

        // Log to import_logs
        await supabase.from('import_logs').insert({
          batch_id: batch.id,
          level: 'info',
          message: `Created: "${sculptureName}"`,
          row_data: { filename: actualFilename, sculptureName, sculptureId },
        })

      } catch (error) {
        console.error(`Error processing ${actualFilename}:`, error)
        errorCount++
        results.push({
          filename: actualFilename,
          sculptureName,
          success: false,
          action: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
        })

        // Log error to import_logs
        await supabase.from('import_logs').insert({
          batch_id: batch.id,
          level: 'error',
          message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          row_data: { filename: actualFilename, sculptureName },
        })
      }
    }

    await zipReader.close()

    // Update batch with final counts
    await supabase
      .from('import_batches')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        total_rows: imageEntries.length,
        successful_rows: successCount,
        failed_rows: errorCount,
      })
      .eq('id', batch.id)

    console.log(`Import complete: ${successCount} created, ${skipCount} skipped, ${errorCount} errors`)

    return new Response(
      JSON.stringify({
        success: true,
        batchId: batch.id,
        summary: {
          total: imageEntries.length,
          created: successCount,
          skipped: skipCount,
          errors: errorCount,
        },
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in import-images-zip function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
