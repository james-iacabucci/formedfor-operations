import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface Tag {
  id: string;
  name: string;
}

interface TagsListProps {
  title: string;
  tags: Tag[];
  variant?: "default" | "secondary" | "outline";
  onTagClick: (tagId: string) => void;
  showRemoveIcon?: boolean;
}

export function TagsList({ 
  title, 
  tags, 
  variant = "default",
  onTagClick,
  showRemoveIcon = false
}: TagsListProps) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">{title}</div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge
            key={tag.id}
            variant={variant}
            className="cursor-pointer"
            onClick={() => onTagClick(tag.id)}
          >
            {tag.name}
            {showRemoveIcon && <X className="ml-1 h-3 w-3" />}
          </Badge>
        ))}
      </div>
    </div>
  );
}