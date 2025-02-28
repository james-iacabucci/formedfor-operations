
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useAIGeneration() {
  const { toast } = useToast();
  const [isGeneratingName, setIsGeneratingName] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  const cleanDescription = (description: string): string => {
    // Remove common placeholder names that might be included in the response
    const cleanedText = description
      .replace(/^(untitled|unnamed|sculpture|artwork)[\s:]*\s*/i, '')
      .replace(/^(the\s+sculpture|this\s+piece|the\s+artwork)/gi, '')
      .replace(/(the\s+sculpture|this\s+piece|the\s+artwork)/gi, 'it')
      .replace(/^\s+/, '')
      .replace(/^,\s*/, '')
      .replace(/^and\s+/i, '')
      .replace(/^features?\s+/i, '')
      .replace(/^presents?\s+/i, '')
      .replace(/^displays?\s+/i, '')
      .replace(/^shows?\s+/i, '');
      
    return cleanedText;
  };

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

      // Generate AI content
      const { data, error } = await supabase.functions.invoke('generate-sculpture-metadata', {
        body: { 
          imageUrl: publicUrl, 
          type,
          existingName: name
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
        // Clean the description and format it with the name in capitals
        const cleanedDescription = cleanDescription(data.description);
        
        // Make the first letter of the description lowercase to ensure it flows naturally from the name
        let formattedDescription = cleanedDescription;
        if (formattedDescription.length > 0) {
          formattedDescription = formattedDescription.charAt(0).toLowerCase() + formattedDescription.slice(1);
        }
        
        const finalDescription = `${name.toUpperCase()} ${formattedDescription}`;
        onSuccess(finalDescription);
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
