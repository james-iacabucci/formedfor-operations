
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { ImageUpload } from "./sculpture/ImageUpload";
import { AIField } from "./sculpture/AIField";
import { useAIGeneration } from "@/hooks/use-ai-generation";
import { FileUploadField } from "./sculpture/FileUploadField";
import { FileUpload } from "@/types/sculpture";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { ProductLine } from "@/types/product-line";

interface AddSculptureSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddSculptureSheet({ open, onOpenChange }: AddSculptureSheetProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { isGeneratingName, isGeneratingDescription, generateAIContent } = useAIGeneration();

  const [status, setStatus] = useState<"idea" | "pending" | "approved" | "archived">("idea");
  const [models, setModels] = useState<FileUpload[]>([]);
  const [renderings, setRenderings] = useState<FileUpload[]>([]);
  const [dimensions, setDimensions] = useState<FileUpload[]>([]);
  const [heightIn, setHeightIn] = useState<string>("");
  const [widthIn, setWidthIn] = useState<string>("");
  const [depthIn, setDepthIn] = useState<string>("");
  const [productLineId, setProductLineId] = useState<string>("");

  // Fetch product lines
  const { data: productLines } = useQuery({
    queryKey: ["product_lines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_lines")
        .select("*")
        .order('name', { ascending: true });

      if (error) throw error;
      return data as ProductLine[];
    },
  });

  const handleDimensionChange = (value: string, setter: (value: string) => void) => {
    const sanitizedValue = value.replace(/[^0-9.]/g, '');
    setter(sanitizedValue);
  };

  const calculateCm = (inches: string): number => {
    return parseFloat(inches) * 2.54;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !file || !productLineId) return;
    
    setIsLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('sculptures')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('sculptures')
        .getPublicUrl(fileName);

      const { data: sculpture, error } = await supabase
        .from('sculptures')
        .insert([
          {
            user_id: user.id,
            created_by: user.id,
            is_manual: true,
            name: name,
            ai_description: description,
            image_url: publicUrl,
            prompt: "Manually added sculpture",
            ai_engine: "manual",
            status: status,
            models,
            renderings,
            dimensions,
            height_in: heightIn ? parseFloat(heightIn) : null,
            width_in: widthIn ? parseFloat(widthIn) : null,
            depth_in: depthIn ? parseFloat(depthIn) : null,
            height_cm: heightIn ? calculateCm(heightIn) : null,
            width_cm: widthIn ? calculateCm(widthIn) : null,
            depth_cm: depthIn ? calculateCm(depthIn) : null,
            product_line_id: productLineId,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setName("");
      setDescription("");
      setFile(null);
      setPreviewUrl(null);
      setStatus("idea");
      setModels([]);
      setRenderings([]);
      setDimensions([]);
      setHeightIn("");
      setWidthIn("");
      setDepthIn("");
      setProductLineId("");
      
      onOpenChange(false);
      toast({
        title: "Success",
        description: "Sculpture added successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ["sculptures"] });
      
    } catch (error) {
      console.error('Error adding sculpture:', error);
      toast({
        title: "Error",
        description: "Could not add sculpture. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add New Sculpture</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <ImageUpload previewUrl={previewUrl} onFileChange={handleFileChange} />

          <AIField
            label="Name"
            isGenerating={isGeneratingName}
            disabled={isGeneratingName || !file}
            onGenerate={() => {
              if (file) {
                generateAIContent('name', file, name, setName);
              }
            }}
          >
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter sculpture name"
              required
            />
          </AIField>

          <AIField
            label="Description"
            isGenerating={isGeneratingDescription}
            disabled={isGeneratingDescription || !file}
            onGenerate={() => {
              if (file) {
                generateAIContent('description', file, name, setDescription);
              }
            }}
          >
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe how this sculpture enhances its space..."
              className="min-h-[100px] resize-y"
              required
            />
          </AIField>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Product Line *</label>
              <Select 
                value={productLineId} 
                onValueChange={setProductLineId}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product line" />
                </SelectTrigger>
                <SelectContent>
                  {productLines?.map((productLine) => (
                    <SelectItem key={productLine.id} value={productLine.id}>
                      {productLine.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select 
                value={status} 
                onValueChange={(value: "idea" | "pending" | "approved" | "archived") => setStatus(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="idea">Idea</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <FileUploadField
              label="Models"
              files={models}
              onFilesChange={setModels}
            />

            <FileUploadField
              label="Renderings"
              files={renderings}
              onFilesChange={setRenderings}
            />

            <FileUploadField
              label="Dimensions"
              files={dimensions}
              onFilesChange={setDimensions}
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Dimensions (inches)</label>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    placeholder="Height"
                    value={heightIn}
                    onChange={(e) => handleDimensionChange(e.target.value, setHeightIn)}
                  />
                  <Input
                    placeholder="Width"
                    value={widthIn}
                    onChange={(e) => handleDimensionChange(e.target.value, setWidthIn)}
                  />
                  <Input
                    placeholder="Depth"
                    value={depthIn}
                    onChange={(e) => handleDimensionChange(e.target.value, setDepthIn)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Dimensions (cm)</label>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    value={heightIn ? calculateCm(heightIn).toFixed(2) : ""}
                    readOnly
                    disabled
                    placeholder="Height"
                  />
                  <Input
                    value={widthIn ? calculateCm(widthIn).toFixed(2) : ""}
                    readOnly
                    disabled
                    placeholder="Width"
                  />
                  <Input
                    value={depthIn ? calculateCm(depthIn).toFixed(2) : ""}
                    readOnly
                    disabled
                    placeholder="Depth"
                  />
                </div>
              </div>
            </div>
          </div>

          <Button type="submit" disabled={isLoading || !productLineId} className="w-full">
            {isLoading ? "Adding..." : "Add Sculpture"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
