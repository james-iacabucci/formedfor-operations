import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { DeleteSculptureDialog } from "@/components/sculpture/DeleteSculptureDialog";
import { ManageTagsDialog } from "@/components/tags/ManageTagsDialog";
import { SculptureImage } from "@/components/sculpture/detail/SculptureImage";
import { SculptureAttributes } from "@/components/sculpture/detail/SculptureAttributes";
import { SculptureVariations } from "@/components/sculpture/detail/SculptureVariations";

export default function SculptureDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sculptureToDelete, setSculptureToDelete] = useState<any>(null);
  const [sculptureToManageTags, setSculptureToManageTags] = useState<any>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { toast } = useToast();

  const { data: sculpture, isLoading: isLoadingSculpture } = useQuery({
    queryKey: ["sculpture", id],
    queryFn: async () => {
      console.log("Fetching sculpture details:", id);
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("sculptures")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      console.log("Fetched sculpture:", data);
      return data;
    },
  });

  const { data: originalSculpture } = useQuery({
    queryKey: ["sculpture", sculpture?.original_sculpture_id],
    enabled: !!sculpture?.original_sculpture_id,
    queryFn: async () => {
      console.log("Fetching original sculpture:", sculpture?.original_sculpture_id);
      const { data, error } = await supabase
        .from("sculptures")
        .select("*")
        .eq("id", sculpture.original_sculpture_id)
        .single();

      if (error) throw error;
      console.log("Fetched original sculpture:", data);
      return data;
    },
  });

  const { data: tags } = useQuery({
    queryKey: ["sculpture_tags", id],
    enabled: !!id,
    queryFn: async () => {
      console.log("Fetching sculpture tags");
      const { data, error } = await supabase
        .from("sculpture_tags")
        .select(`
          tag_id,
          tags (
            id,
            name
          )
        `)
        .eq("sculpture_id", id);

      if (error) throw error;
      console.log("Fetched sculpture tags:", data);
      return data.map((st: any) => st.tags);
    },
  });

  const handleRegenerate = async (creativity: "small" | "medium" | "large", changes?: string) => {
    if (isRegenerating) return;

    setIsRegenerating(true);
    try {
      const { error } = await supabase.functions.invoke("regenerate-image", {
        body: {
          prompt: sculpture.prompt + (changes ? `. Changes: ${changes}` : ""),
          sculptureId: sculpture.id,
          creativity,
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "New variation generated successfully.",
      });
    } catch (error) {
      console.error("Error regenerating image:", error);
      toast({
        title: "Error",
        description: "Failed to generate variation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(sculpture.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sculpture-${sculpture.id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading image:", error);
      toast({
        title: "Error",
        description: "Failed to download image. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoadingSculpture) {
    return <div>Loading...</div>;
  }

  if (!sculpture) {
    return <div>Sculpture not found</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl p-6">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/")}
        >
          <ChevronLeftIcon className="w-4 h-4 mr-2" />
          Back to Gallery
        </Button>

        <div className="grid grid-cols-3 gap-8">
          {/* Image Section - Takes up 2/3 of the width */}
          <div className="col-span-2">
            <SculptureImage
              imageUrl={sculpture.image_url}
              prompt={sculpture.prompt}
              isRegenerating={isRegenerating}
              onDelete={() => setSculptureToDelete(sculpture)}
              onDownload={handleDownload}
              onManageTags={() => setSculptureToManageTags(sculpture)}
              onRegenerate={handleRegenerate}
            />
            
            <SculptureVariations sculptureId={sculpture.id} />
          </div>

          {/* Attributes Section - Takes up 1/3 of the width */}
          <div className="col-span-1">
            <SculptureAttributes
              sculpture={sculpture}
              originalSculpture={originalSculpture}
              tags={tags}
            />
          </div>
        </div>
      </div>

      <DeleteSculptureDialog
        sculpture={sculptureToDelete}
        open={!!sculptureToDelete}
        onOpenChange={(open) => !open && setSculptureToDelete(null)}
      />

      <ManageTagsDialog
        sculpture={sculptureToManageTags}
        open={!!sculptureToManageTags}
        onOpenChange={(open) => !open && setSculptureToManageTags(null)}
      />
    </div>
  );
}