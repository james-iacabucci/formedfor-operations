
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
    if (!user || !file) return;
    
    setIsLoading(true);
    try {
      // Upload image
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('sculptures')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('sculptures')
        .getPublicUrl(fileName);

      // Create sculpture record
      const { data: sculpture, error } = await supabase
        .from('sculptures')
        .insert([
          {
            user_id: user.id,
            is_manual: true,
            manual_name: name,
            manual_description: description,
            image_url: publicUrl,
            prompt: "Manually added sculpture",
            ai_engine: "manual"
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setName("");
      setDescription("");
      setFile(null);
      setPreviewUrl(null);
      onOpenChange(false);
      toast({
        title: "Success",
        description: "Sculpture added successfully",
      });
      
      // Refresh the sculptures list
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
      <SheetContent className="sm:max-w-md">
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
              className="min-h-[250px] resize-y"
              rows={10}
              required
            />
          </AIField>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Adding..." : "Add Sculpture"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
