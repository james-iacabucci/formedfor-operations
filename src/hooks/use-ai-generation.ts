
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function useAIGeneration() {
  const [isGeneratingName, setIsGeneratingName] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  const generateAIContent = async (
    type: 'name' | 'description',
    file: File,
    name: string,
    onSuccess: (content: string) => void
  ) => {
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
        onSuccess(data.name.replace(/['"]/g, ''));
      } else {
        const sculptureDescription = name 
          ? data.description.replace(/\b(this sculpture|the sculpture|it)\b/gi, name)
          : data.description;
        onSuccess(sculptureDescription);
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

  return {
    isGeneratingName,
    isGeneratingDescription,
    generateAIContent,
  };
}
