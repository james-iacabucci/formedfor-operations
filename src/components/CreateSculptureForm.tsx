import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface FormData {
  prompt: string;
}

export function CreateSculptureForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Try to create the sculpture directly with the user's ID
      // Since we now have a trigger that creates profiles automatically,
      // the user_id (which references profiles.id) should exist
      const { error } = await supabase
        .from('sculptures')
        .insert([
          {
            prompt: data.prompt,
            user_id: user.id
          }
        ]);

      if (error) {
        console.error('Error creating sculpture:', error);
        toast({
          title: "Error",
          description: "Could not create sculpture. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      reset();
      toast({
        title: "Success",
        description: "Sculpture created successfully",
      });
      console.log('Sculpture created successfully');
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