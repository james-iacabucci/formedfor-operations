import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface ImportBatch {
  id: string;
  created_at: string;
  file_name: string;
  total_rows: number;
  successful_rows: number;
  failed_rows: number;
}

export function BulkSculptureDelete() {
  const [deleteType, setDeleteType] = useState<'imported' | 'manual' | 'both'>('imported');
  const [batches, setBatches] = useState<ImportBatch[]>([]);
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
  const [counts, setCounts] = useState<{ imported: number; manual: number; total: number }>({
    imported: 0,
    manual: 0,
    total: 0,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Load import batches
    const { data: batchData } = await supabase
      .from('import_batches')
      .select('*')
      .order('created_at', { ascending: false });

    if (batchData) {
      setBatches(batchData);
    }

    // Load counts
    const { count: importedCount } = await supabase
      .from('sculptures')
      .select('*', { count: 'exact', head: true })
      .eq('import_source', 'excel_import');

    const { count: manualCount } = await supabase
      .from('sculptures')
      .select('*', { count: 'exact', head: true })
      .eq('import_source', 'manual');

    const { count: totalCount } = await supabase
      .from('sculptures')
      .select('*', { count: 'exact', head: true });

    setCounts({
      imported: importedCount || 0,
      manual: manualCount || 0,
      total: totalCount || 0,
    });
  };

  const handleBatchToggle = (batchId: string) => {
    setSelectedBatches(prev =>
      prev.includes(batchId)
        ? prev.filter(id => id !== batchId)
        : [...prev, batchId]
    );
  };

  const handleDelete = async () => {
    setShowConfirmDialog(false);
    setIsDeleting(true);

    try {
      const { data, error } = await supabase.functions.invoke('bulk-delete-sculptures', {
        body: {
          deleteType,
          batchIds: deleteType === 'imported' && selectedBatches.length > 0 ? selectedBatches : undefined,
        }
      });

      if (error) throw error;

      toast({
        title: "Deletion completed",
        description: data.message,
      });

      // Reload data
      await loadData();
      setSelectedBatches([]);
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Deletion failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getDeleteCount = () => {
    if (deleteType === 'both') return counts.total;
    if (deleteType === 'manual') return counts.manual;
    
    // For imported, if specific batches selected, sum their successful rows
    if (selectedBatches.length > 0) {
      return batches
        .filter(b => selectedBatches.includes(b.id))
        .reduce((sum, b) => sum + b.successful_rows, 0);
    }
    
    return counts.imported;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bulk Delete Sculptures</CardTitle>
          <CardDescription>
            Delete multiple sculptures based on their source. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Warning: This will permanently delete sculptures and all associated data (variants, quotes, tasks, etc.)
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Imported</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{counts.imported}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Manual</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{counts.manual}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{counts.total}</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Delete Type</label>
            <Select value={deleteType} onValueChange={(v: any) => setDeleteType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="imported">Imported Sculptures Only</SelectItem>
                <SelectItem value="manual">Manually Created Only</SelectItem>
                <SelectItem value="both">All Sculptures</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {deleteType === 'imported' && batches.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Select Import Batches (Optional)</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (selectedBatches.length === batches.length) {
                      setSelectedBatches([]);
                    } else {
                      setSelectedBatches(batches.map(b => b.id));
                    }
                  }}
                >
                  {selectedBatches.length === batches.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Leave unselected to delete all imported sculptures
              </p>
              <div className="space-y-2 max-h-[300px] overflow-y-auto border rounded p-2">
                {batches.map(batch => (
                  <div key={batch.id} className="flex items-center gap-2 p-2 hover:bg-accent rounded">
                    <Checkbox
                      checked={selectedBatches.includes(batch.id)}
                      onCheckedChange={() => handleBatchToggle(batch.id)}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{batch.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(batch.created_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">{batch.successful_rows} sculptures</Badge>
                      {batch.failed_rows > 0 && (
                        <Badge variant="destructive">{batch.failed_rows} failed</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            variant="destructive"
            onClick={() => setShowConfirmDialog(true)}
            disabled={isDeleting || getDeleteCount() === 0}
            className="w-full"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete {getDeleteCount()} Sculpture(s)
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{getDeleteCount()} sculpture(s)</strong> and all associated data including:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>All sculpture variants</li>
                <li>All fabrication quotes</li>
                <li>All related tasks</li>
                <li>All chat threads and messages</li>
                <li>All tag associations</li>
              </ul>
              <p className="mt-2 font-semibold">This action cannot be undone.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete {getDeleteCount()} Sculpture(s)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
