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
      // First, get the profile id for the current user
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        toast({
          title: "Error",
          description: "Could not create sculpture. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Now create the sculpture using the profile id
      const { error } = await supabase
        .from('sculptures')
        .insert([
          {
            prompt: data.prompt,
            user_id: profile.id
          }
        ]);

      if (error) throw error;
      
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