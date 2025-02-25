
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useAIGeneration() {
  const { toast } = useToast();
  const [isGeneratingName, setIsGeneratingName] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  const generateAIContent = useCallback(async (
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

      // System message based on type with specific rules
      const systemMessage = type === 'name' 
        ? "You are an art curator responsible for naming sculptures. Create a brief name (1-2 words maximum) for the sculpture in the image. The name should be clean and simple with NO special characters, NO quotation marks, and NO extra spaces before or after. Just return the name, nothing else."
        : `You are a designer talking casually to another designer about a sculpture named "${name}". Your description MUST start with the sculpture name in capital letters and you cannot mention the name again in the description. In 2-3 concise sentences, describe how this sculpture enhances its space. Focus on the shape, materials, and what they could symbolize. Be conversational but professional.`;

      // Generate AI content
      const { data, error } = await supabase.functions.invoke('generate-sculpture-metadata', {
        body: { 
          imageUrl: publicUrl, 
          type,
          systemMessage
        }
      });

      if (error) throw error;

      if (type === 'name') {
        // Clean the name to ensure it follows the rules
        const cleanName = data.name
          .replace(/['"]/g, '') // Remove quotes
          .replace(/^\s+|\s+$/g, '') // Remove leading/trailing spaces
          .replace(/[^\w\s-]/g, ''); // Remove special characters except spaces and hyphens
        onSuccess(cleanName);
      } else {
        // Validate and format the description to ensure it starts with the name in capitals
        let description = data.description.trim();
        
        // If the description doesn't start with the name in capitals, add it
        if (!description.toUpperCase().startsWith(name.toUpperCase())) {
          description = `${name.toUpperCase()} ${description}`;
        } else {
          // If it does start with the name but not in capitals, capitalize it
          const nameLength = name.length;
          description = description.substring(0, nameLength).toUpperCase() + description.substring(nameLength);
        }

        onSuccess(description);
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
  }, [toast]);

  return {
    isGeneratingName,
    isGeneratingDescription,
    generateAIContent,
  };
}
