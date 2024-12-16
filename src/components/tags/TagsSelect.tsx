import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TagsSelectProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export function TagsSelect({ selectedTags, onTagsChange }: TagsSelectProps) {
  const { data: tags } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      console.log("Fetching tags...");
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("name");

      if (error) throw error;
      console.log("Fetched tags:", data);
      return data;
    },
  });

  const handleTagClick = (tagId: string) => {
    if (tagId === "all") {
      // If "All Sculptures" is clicked, clear all other selections
      onTagsChange([]);
    } else {
      let newSelectedTags: string[];
      if (selectedTags.includes(tagId)) {
        // Remove tag if already selected
        newSelectedTags = selectedTags.filter((id) => id !== tagId);
      } else {
        // Add tag and ensure "All Sculptures" is not selected
        newSelectedTags = [...selectedTags, tagId];
      }
      onTagsChange(newSelectedTags);
    }
  };

  const isAllSelected = selectedTags.length === 0;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <Badge
        variant={isAllSelected ? "secondary" : "outline"}
        className={cn(
          "cursor-pointer transition-colors",
          isAllSelected ? "hover:bg-secondary/80" : "hover:bg-secondary/50 border-dashed"
        )}
        onClick={() => handleTagClick("all")}
      >
        All Sculptures
      </Badge>

      {tags?.map((tag) => (
        <Badge
          key={tag.id}
          variant={selectedTags.includes(tag.id) ? "secondary" : "outline"}
          className={cn(
            "cursor-pointer transition-colors",
            selectedTags.includes(tag.id)
              ? "hover:bg-secondary/80"
              : "hover:bg-secondary/50 border-dashed"
          )}
          onClick={() => handleTagClick(tag.id)}
        >
          {tag.name}
        </Badge>
      ))}
    </div>
  );
}