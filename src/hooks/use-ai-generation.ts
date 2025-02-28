
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useAIGeneration() {
  const { toast } = useToast();
  const [isGeneratingName, setIsGeneratingName] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  const cleanDescription = (description: string): string => {
    // Check if the description starts with a proper connecting phrase
    const starterVerbs = ["is ", "represents ", "embodies ", "captures ", "conveys ", "expresses ", "evokes ", "showcases "];
    const startsWithProperVerb = starterVerbs.some(verb => description.toLowerCase().startsWith(verb));
    
    // If not, we'll fix it by adding a default connecting phrase
    if (!startsWithProperVerb && !description.startsWith("is ")) {
      // Check if first word is capitalized - if so, make it lowercase
      if (/^[A-Z]/.test(description)) {
        description = description.charAt(0).toLowerCase() + description.slice(1);
      }
      // Add "is " to the beginning if needed
      if (!description.startsWith("is ")) {
        description = "is " + description;
      }
    }
    
    return description;
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
        // Process the description according to rules
        let cleanedDescription = data.description;
        
        // Ensure the description properly connects with the name
        cleanedDescription = cleanDescription(cleanedDescription);
        
        // Combine with the name in all caps
        const finalDescription = `${name.toUpperCase()} ${cleanedDescription}`;
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
