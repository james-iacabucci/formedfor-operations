import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  FileArchive, 
  CheckCircle2, 
  XCircle, 
  SkipForward,
  Image as ImageIcon 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

interface ImportResult {
  filename: string;
  sculptureName: string;
  success: boolean;
  action: 'created' | 'skipped' | 'error';
  message: string;
}

interface ImportSummary {
  total: number;
  created: number;
  skipped: number;
  errors: number;
}

export function ZipImageImport() {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFileSelect = useCallback((selectedFile: File) => {
    if (!selectedFile.name.match(/\.zip$/i)) {
      toast({
        title: "Invalid file type",
        description: "Please select a ZIP file (.zip)",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    setResults([]);
    setSummary(null);

    toast({
      title: "File selected",
      description: `Ready to import: ${selectedFile.name}`,
    });
  }, [toast]);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  }, [handleFileSelect]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  const handleImport = useCallback(async () => {
    if (!file || !user) return;

    setIsImporting(true);
    setResults([]);
    setSummary(null);

    try {
      // Create FormData to send the file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.id);

      // Get the Supabase URL and anon key for the fetch
      const supabaseUrl = 'https://lkgomkokczyvftjrbejq.supabase.co';
      const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrZ29ta29rY3p5dmZ0anJiZWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQzMDU3OTQsImV4cCI6MjA0OTg4MTc5NH0.IyXGukdJPtjlE8SvbFbvN2j0G1OsGwH0KXmG81PRuHA';

      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${supabaseUrl}/functions/v1/import-images-zip`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token || supabaseAnonKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Import failed: ${errorText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Import failed');
      }

      setResults(data.results || []);
      setSummary(data.summary);

      toast({
        title: "Import completed",
        description: `Created ${data.summary.created} sculptures, skipped ${data.summary.skipped}`,
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
  }, [file, user, toast]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'skipped':
        return <SkipForward className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'created':
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Created</Badge>;
      case 'skipped':
        return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">Skipped</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Import Sculptures from ZIP
          </CardTitle>
          <CardDescription>
            Upload a ZIP file containing sculpture images (PNG, JPG, JPEG, WEBP). 
            Each image filename becomes the sculpture name. Existing sculptures are skipped.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drag and drop zone */}
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-8
              transition-colors duration-200 cursor-pointer
              ${dragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }
              ${isImporting ? 'pointer-events-none opacity-50' : ''}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".zip"
              onChange={handleInputChange}
              className="hidden"
              disabled={isImporting}
            />
            <div className="flex flex-col items-center justify-center gap-3 text-center">
              <div className="p-3 rounded-full bg-muted">
                <FileArchive className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">
                  {dragActive ? "Drop your ZIP file here" : "Drag & drop a ZIP file here"}
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse
                </p>
              </div>
            </div>
          </div>

          {file && (
            <Alert>
              <FileArchive className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>Selected: <strong>{file.name}</strong> ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFile(null);
                    setResults([]);
                    setSummary(null);
                  }}
                  disabled={isImporting}
                >
                  Clear
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {file && !isImporting && !summary && (
            <Button onClick={handleImport} className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              Start Import
            </Button>
          )}

          {isImporting && (
            <div className="space-y-2">
              <Progress value={undefined} className="animate-pulse" />
              <p className="text-sm text-muted-foreground text-center">
                Processing ZIP file... This may take a moment.
              </p>
            </div>
          )}

          {summary && (
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4 text-center">
                  <p className="text-2xl font-bold">{summary.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <p className="text-2xl font-bold text-green-500">{summary.created}</p>
                  <p className="text-xs text-muted-foreground">Created</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <p className="text-2xl font-bold text-yellow-500">{summary.skipped}</p>
                  <p className="text-xs text-muted-foreground">Skipped</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <p className="text-2xl font-bold text-red-500">{summary.errors}</p>
                  <p className="text-xs text-muted-foreground">Errors</p>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Import Results</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {results.map((result, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-3 p-2 rounded border bg-card"
                  >
                    {getActionIcon(result.action)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{result.sculptureName}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {result.filename} • {result.message}
                      </p>
                    </div>
                    {getActionBadge(result.action)}
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
