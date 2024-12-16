import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tag, TagIcon, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

  const handleClearTags = () => {
    onTagsChange([]);
  };

  const handleTagClick = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter((id) => id !== tagId));
    } else {
      onTagsChange([...selectedTags, tagId]);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <TagIcon className="h-4 w-4 text-muted-foreground" />
      <div className="flex flex-wrap items-center gap-2">
        {selectedTags.length === 0 ? (
          <span className="text-sm text-muted-foreground">All Sculptures</span>
        ) : (
          <>
            {tags
              ?.filter((tag) => selectedTags.includes(tag.id))
              .map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => handleTagClick(tag.id)}
                >
                  {tag.name}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearTags}
              className="h-7 px-2"
            >
              Clear
            </Button>
          </>
        )}
      </div>
      <div className="flex-1" />
      <div className="flex flex-wrap items-center gap-2">
        {tags
          ?.filter((tag) => !selectedTags.includes(tag.id))
          .map((tag) => (
            <Badge
              key={tag.id}
              variant="outline"
              className="cursor-pointer"
              onClick={() => handleTagClick(tag.id)}
            >
              {tag.name}
            </Badge>
          ))}
      </div>
    </div>
  );
}