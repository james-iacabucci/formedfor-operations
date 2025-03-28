
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ImageIcon, MoreHorizontalIcon, Trash2Icon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

interface ActionsDropdownProps {
  imageUrl?: string;
  sculptureName?: string;
  onDelete: () => void;
}

export function ActionsDropdown({ imageUrl, sculptureName, onDelete }: ActionsDropdownProps) {
  const { toast } = useToast();

  // Clean up portals when component unmounts
  useEffect(() => {
    return () => {
      // Add a small delay to ensure animations have completed
      setTimeout(() => {
        try {
          const portals = document.querySelectorAll('[data-state="closed"]');
          portals.forEach(portal => {
            try {
              // Only target dropdown-specific portals
              if (portal.classList.contains('dropdown-content') || 
                  (portal.getAttribute('role') === 'menu')) {
                const parent = portal.parentNode;
                if (parent && parent.contains(portal)) {
                  parent.removeChild(portal);
                }
              }
            } catch (error) {
              // Silently handle individual portal cleanup errors
              console.error('Portal child removal error:', error);
            }
          });
        } catch (error) {
          console.error('Portal cleanup error:', error);
        }
      }, 100);
    };
  }, []);

  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = `${sculptureName || 'sculpture'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: "Download started",
        description: "Your image download has started.",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
        >
          <MoreHorizontalIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 dropdown-content">
        <DropdownMenuItem onClick={handleDownload}>
          <ImageIcon className="h-4 w-4 mr-2" />
          Download Image
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDelete} className="text-destructive">
          <Trash2Icon className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
