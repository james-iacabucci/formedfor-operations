
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface FormData {
  prompt: string;
}

export function CreateSculptureForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Create the sculpture
      const { data: sculpture, error } = await supabase
        .from('sculptures')
        .insert([
          {
            prompt: data.prompt,
            created_by: user.id,
            ai_engine: "runware",
            status: "idea"
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating sculpture:', error);
        toast({
          title: "Error",
          description: "Could not create sculpture. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Trigger image generation
      const { error: generateError } = await supabase.functions.invoke('generate-image', {
        body: { prompt: data.prompt, sculptureId: sculpture.id }
      });

      if (generateError) {
        console.error('Error generating image:', generateError);
        toast({
          title: "Warning",
          description: "Sculpture created, but image generation failed. Please try again later.",
        });
      }
      
      reset();
      toast({
        title: "Success",
        description: "Sculpture created successfully. Image generation in progress...",
      });
      
      // Refresh the sculptures list
      queryClient.invalidateQueries({ queryKey: ["sculptures"] });
      
    } catch (error) {
      console.error('Error creating sculpture:', error);
      toast({
        title: "Error",
        description: "Could not create sculpture. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="prompt">Describe your sculpture</Label>
        <Input
          id="prompt"
          placeholder="Enter a description of the sculpture you want to create..."
          {...register("prompt", { required: "Please enter a description" })}
        />
        {errors.prompt && (
          <p className="text-sm text-destructive">{errors.prompt.message}</p>
        )}
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Sculpture"}
      </Button>
    </form>
  );
}
