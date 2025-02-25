
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface SculptureVariationsProps {
  sculptureId: string;
  prompt: string;
}

export function SculptureVariations({ sculptureId, prompt }: SculptureVariationsProps) {
  const navigate = useNavigate();
  
  const { data: variations } = useQuery({
    queryKey: ["sculpture-variations", sculptureId],
    queryFn: async () => {
      console.log("Fetching variations for sculpture:", sculptureId);
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("sculptures")
        .select("*")
        .eq("original_sculpture_id", sculptureId)
        .eq("user_id", user.user.id);

      if (error) throw error;
      console.log("Fetched variations:", data);
      return data;
    },
  });

  if (!variations?.length) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4">Variations</h2>
      <div className="grid grid-cols-4 gap-4">
        {variations.map((variation) => (
          <div
            key={variation.id}
            className="relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-muted hover:opacity-80 transition-opacity"
            onClick={() => navigate(`/sculpture/${variation.id}`)}
          >
            <img
              src={variation.image_url}
              alt={variation.prompt}
              className="object-cover w-full h-full"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2">
              <span className="capitalize">{variation.creativity_level} variation</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
