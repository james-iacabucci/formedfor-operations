import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, AlertCircle, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';

interface ImportLog {
  level: 'info' | 'warn' | 'error';
  message: string;
  rowNumber?: number;
}

export function SculptureImport() {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<ImportLog[]>([]);
  const [importSummary, setImportSummary] = useState<{
    total: number;
    successful: number;
    failed: number;
  } | null>(null);
  const { toast } = useToast();

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
      toast({
        title: "Invalid file type",
        description: "Please select an Excel file (.xlsx or .xls)",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    setLogs([]);
    setImportSummary(null);

    // Parse and preview file
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
      
      setPreviewData(data.slice(0, 10)); // Show first 10 rows
      
      toast({
        title: "File loaded",
        description: `Preview showing first 10 of ${data.length} rows`,
      });
    } catch (error) {
      console.error('Error parsing file:', error);
      toast({
        title: "Error",
        description: "Failed to parse Excel file",
        variant: "destructive",
      });
    }
  }, [toast]);

  const downloadTemplate = useCallback(() => {
    const template = [
      {
        'Sculpture Name': 'Example Sculpture',
        'Product Line': 'Your Product Line',
        'Description': 'Optional description',
        'Status': 'idea',
        'Height (inches)': '24',
        'Width (inches)': '18',
        'Depth (inches)': '12',
        'Weight (lbs)': '50',
        'Material': 'Bronze',
        'Method': 'Cast',
        'Base Height (inches)': '6',
        'Base Width (inches)': '18',
        'Base Depth (inches)': '18',
        'Base Weight (lbs)': '20',
        'Base Material': 'Marble',
        'Base Method': 'Cut',
        'Image URL': 'https://example.com/image.jpg',
        'Tags': 'wildlife, outdoor',
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'sculpture_import_template.xlsx');
  }, []);

  const handleImport = useCallback(async () => {
    if (!file) return;

    setIsImporting(true);
    setProgress(0);
    setLogs([]);
    setImportSummary(null);

    try {
      // Parse entire file
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });

      // Normalize column names
      const normalizedData = data.map((row: any, index: number) => {
        const normalized: any = { rowNumber: index + 2 }; // +2 for header and 1-based
        
        Object.keys(row).forEach(key => {
          const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '_');
          
          // Map common variations
          if (normalizedKey.includes('name')) normalized.name = row[key];
          else if (normalizedKey.includes('product') && normalizedKey.includes('line')) normalized.product_line = row[key];
          else if (normalizedKey.includes('description')) normalized.description = row[key];
          else if (normalizedKey.includes('status')) normalized.status = row[key];
          else if (normalizedKey.includes('height') && !normalizedKey.includes('base')) normalized.height_in = row[key];
          else if (normalizedKey.includes('width') && !normalizedKey.includes('base')) normalized.width_in = row[key];
          else if (normalizedKey.includes('depth') && !normalizedKey.includes('base')) normalized.depth_in = row[key];
          else if (normalizedKey.includes('weight') && !normalizedKey.includes('base')) normalized.weight_lbs = row[key];
          else if (normalizedKey.includes('material') && !normalizedKey.includes('base')) normalized.material = row[key];
          else if (normalizedKey.includes('method') && !normalizedKey.includes('base')) normalized.method = row[key];
          else if (normalizedKey.includes('base') && normalizedKey.includes('height')) normalized.base_height_in = row[key];
          else if (normalizedKey.includes('base') && normalizedKey.includes('width')) normalized.base_width_in = row[key];
          else if (normalizedKey.includes('base') && normalizedKey.includes('depth')) normalized.base_depth_in = row[key];
          else if (normalizedKey.includes('base') && normalizedKey.includes('weight')) normalized.base_weight_lbs = row[key];
          else if (normalizedKey.includes('base') && normalizedKey.includes('material')) normalized.base_material = row[key];
          else if (normalizedKey.includes('base') && normalizedKey.includes('method')) normalized.base_method = row[key];
          else if (normalizedKey.includes('image') && normalizedKey.includes('url')) normalized.image_url = row[key];
          else if (normalizedKey.includes('tags')) normalized.tags = row[key];
          else if (normalizedKey.includes('prompt')) normalized.prompt = row[key];
        });
        
        return { rowNumber: index + 2, data: normalized };
      });

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create import batch
      const { data: batch, error: batchError } = await supabase
        .from('import_batches')
        .insert({
          created_by: user.id,
          file_name: file.name,
          total_rows: normalizedData.length,
        })
        .select()
        .single();

      if (batchError) throw batchError;

      // Process in batches of 50
      const batchSize = 50;
      const totalBatches = Math.ceil(normalizedData.length / batchSize);
      let processedCount = 0;

      for (let i = 0; i < normalizedData.length; i += batchSize) {
        const batch_rows = normalizedData.slice(i, i + batchSize);
        
        const { data: result, error } = await supabase.functions.invoke('import-sculptures', {
          body: {
            rows: batch_rows,
            batchId: batch.id,
            userId: user.id,
          }
        });

        if (error) throw error;

        processedCount += batch_rows.length;
        setProgress((processedCount / normalizedData.length) * 100);

        // Collect logs from results
        if (result?.results) {
          const newLogs: ImportLog[] = result.results.map((r: any, idx: number) => ({
            level: r.success ? 'info' : 'error',
            message: r.success 
              ? `Row ${batch_rows[idx].rowNumber}: ${r.action} "${r.sculptureName}"${r.warnings ? ` (warnings: ${r.warnings.join(', ')})` : ''}`
              : `Row ${batch_rows[idx].rowNumber}: ${r.error}`,
            rowNumber: batch_rows[idx].rowNumber,
          }));
          setLogs(prev => [...prev, ...newLogs]);
        }
      }

      // Fetch final batch data
      const { data: finalBatch } = await supabase
        .from('import_batches')
        .select('*')
        .eq('id', batch.id)
        .single();

      if (finalBatch) {
        setImportSummary({
          total: finalBatch.total_rows,
          successful: finalBatch.successful_rows,
          failed: finalBatch.failed_rows,
        });
      }

      toast({
        title: "Import completed",
        description: `Successfully imported ${finalBatch?.successful_rows || 0} sculptures`,
      });
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  }, [file, toast]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Import Sculptures from Excel</CardTitle>
          <CardDescription>
            Upload an Excel file (.xlsx or .xls) with sculpture data. Download the template to see the expected format.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={downloadTemplate} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
            
            <div className="flex-1">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                disabled={isImporting}
              />
              <label htmlFor="file-upload">
                <Button asChild variant="outline" disabled={isImporting}>
                  <span className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    Select File
                  </span>
                </Button>
              </label>
            </div>
          </div>

          {file && (
            <Alert>
              <FileSpreadsheet className="h-4 w-4" />
              <AlertDescription>
                Selected: {file.name} ({previewData.length > 0 ? `${previewData.length}+ rows` : 'parsing...'})
              </AlertDescription>
            </Alert>
          )}

          {previewData.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Preview (first 10 rows)</h4>
              <ScrollArea className="h-[200px] border rounded">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.keys(previewData[0] || {}).slice(0, 6).map(key => (
                        <TableHead key={key}>{key}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.map((row, idx) => (
                      <TableRow key={idx}>
                        {Object.values(row).slice(0, 6).map((val: any, i) => (
                          <TableCell key={i}>{String(val).slice(0, 50)}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          )}

          {file && !isImporting && (
            <Button onClick={handleImport} className="w-full">
              Start Import
            </Button>
          )}

          {isImporting && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground text-center">
                Importing... {Math.round(progress)}%
              </p>
            </div>
          )}

          {importSummary && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Import complete: {importSummary.successful} successful, {importSummary.failed} failed out of {importSummary.total} total
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Import Log</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-1">
                {logs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    {log.level === 'info' && <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />}
                    {log.level === 'warn' && <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />}
                    {log.level === 'error' && <XCircle className="h-4 w-4 text-red-500 mt-0.5" />}
                    <span className="flex-1">{log.message}</span>
                    {log.rowNumber && (
                      <Badge variant="outline" className="text-xs">
                        Row {log.rowNumber}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
