
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { Label } from "./ui/label";

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
  const [isGeneratingName, setIsGeneratingName] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const generateAIContent = async (type: 'name' | 'description') => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please upload an image first",
        variant: "destructive",
      });
      return;
    }

    try {
      if (type === 'name') {
        setIsGeneratingName(true);
      } else {
        setIsGeneratingDescription(true);
      }

      // Upload image to get a temporary URL
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('sculptures')
        .upload(`temp/${fileName}`, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('sculptures')
        .getPublicUrl(`temp/${fileName}`);

      // Generate AI content
      const { data, error } = await supabase.functions.invoke('generate-sculpture-metadata', {
        body: { imageUrl: publicUrl, type }
      });

      if (error) throw error;

      if (type === 'name') {
        setName(data.name);
      } else {
        setDescription(data.description);
      }

      // Clean up temporary file
      await supabase.storage
        .from('sculptures')
        .remove([`temp/${fileName}`]);

    } catch (error) {
      console.error(`Error generating ${type}:`, error);
      toast({
        title: "Error",
        description: `Could not generate ${type}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      if (type === 'name') {
        setIsGeneratingName(false);
      } else {
        setIsGeneratingDescription(false);
      }
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
          <div className="space-y-2">
            <Label htmlFor="image">Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="name">Name</Label>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                disabled={isGeneratingName || !file}
                onClick={() => generateAIContent('name')}
              >
                <Sparkles className="h-4 w-4" />
              </Button>
            </div>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter sculpture name"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="description">Description</Label>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                disabled={isGeneratingDescription || !file}
                onClick={() => generateAIContent('description')}
              >
                <Sparkles className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe how this sculpture enhances its space..."
              className="min-h-[100px] resize-y"
              required
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Adding..." : "Add Sculpture"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
