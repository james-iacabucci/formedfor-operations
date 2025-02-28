
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useAIGeneration() {
  const { toast } = useToast();
  const [isGeneratingName, setIsGeneratingName] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  const cleanDescription = (description: string): string => {
    // Define approved connecting phrases
    const connectingPhrases = [
      "is a", "represents", "embodies", "captures", 
      "conveys", "expresses", "evokes", "showcases"
    ];
    
    // Check if the description already starts with an approved phrase
    const startsWithApprovedPhrase = connectingPhrases.some(phrase => 
      description.toLowerCase().startsWith(phrase)
    );
    
    if (startsWithApprovedPhrase) {
      // Already in correct format, do nothing
      return description;
    }
    
    // Handle common incorrect formats
    
    // 1. Starts with material name: "Bronze, featuring..." or "Bronze. The..."
    const materialPattern = /^(bronze|steel|marble|wood|glass|metal|ceramic|stone|aluminum|copper|iron|gold|silver)[,.]/i;
    if (materialPattern.test(description)) {
      // Extract the material name
      const material = description.match(materialPattern)?.[1] || "";
      // Remove the material prefix and clean up
      let cleanedDesc = description.replace(materialPattern, "").trim();
      // Make first letter lowercase if needed
      if (/^[A-Z]/.test(cleanedDesc)) {
        cleanedDesc = cleanedDesc.charAt(0).toLowerCase() + cleanedDesc.slice(1);
      }
      // Add connecting phrase
      return `is a ${material.toLowerCase()} sculpture that ${cleanedDesc}`;
    }
    
    // 2. Starts with "This sculpture..." or similar
    const thisPatterns = /^(this|the) (sculpture|piece|artwork|creation|work)/i;
    if (thisPatterns.test(description)) {
      // Remove the "This sculpture" beginning and clean up
      let cleanedDesc = description.replace(thisPatterns, "").trim();
      // Remove leading punctuation
      cleanedDesc = cleanedDesc.replace(/^[,.:;-]\s*/, "");
      // Make first letter lowercase if needed
      if (/^[A-Z]/.test(cleanedDesc)) {
        cleanedDesc = cleanedDesc.charAt(0).toLowerCase() + cleanedDesc.slice(1);
      }
      return `is a sculpture that ${cleanedDesc}`;
    }
    
    // 3. Starts with descriptive adjective: "Dynamic and flowing..."
    const adjectivePattern = /^[A-Z][a-z]+\b/;
    if (adjectivePattern.test(description)) {
      // Convert to lowercase and prefix
      const firstWord = description.match(adjectivePattern)?.[0].toLowerCase() || "";
      // Join with rest of description
      const restOfDesc = description.substring(firstWord.length).trim();
      return `is a ${firstWord} sculpture that${restOfDesc}`;
    }
    
    // 4. Default fallback - just prefix with "is a"
    return `is a ${description.charAt(0).toLowerCase() + description.slice(1)}`;
  };

  // Ensure description is not too long (limit to 2-3 sentences)
  const limitSentences = (description: string, maxSentences: number = 3): string => {
    // Split by sentence-ending punctuation followed by space or end of string
    const sentencePattern = /[.!?]+(?:\s|$)/;
    const sentences = description.split(sentencePattern).filter(s => s.trim().length > 0);
    
    // If we have more sentences than our max, truncate
    if (sentences.length > maxSentences) {
      let result = "";
      for (let i = 0; i < maxSentences; i++) {
        // Add sentence and its punctuation back
        const match = description.match(new RegExp(`${sentences[i].trim()}[.!?]+(?:\\s|$)`));
        if (match) {
          result += match[0];
        } else {
          result += sentences[i].trim() + ". ";
        }
      }
      return result.trim();
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
        
        // 1. Clean the initial format
        let cleanedDescription = cleanDescription(data.description);
        
        // 2. Limit to 2-3 sentences
        cleanedDescription = limitSentences(cleanedDescription, 3);
        
        // 3. Combine with the name in all caps
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
