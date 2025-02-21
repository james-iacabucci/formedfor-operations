
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ExtendedFileAttachment } from "./types";

interface FileCardProps {
  file: ExtendedFileAttachment;
  canDelete: boolean;
  onDelete: (file: ExtendedFileAttachment) => void;
  onAttachToSculpture: (file: ExtendedFileAttachment, category: "models" | "renderings" | "dimensions") => void;
}

export function FileCard({ file, canDelete, onDelete, onAttachToSculpture }: FileCardProps) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg border bg-muted/30">
      <Avatar className="h-10 w-10">
        <AvatarImage src={file.user?.avatar_url || ""} />
        <AvatarFallback>
          {file.user?.username?.charAt(0) || "U"}
        </AvatarFallback>
      </Avatar>

      {file.type?.startsWith('image/') ? (
        <div className="h-16 w-16 rounded overflow-hidden bg-background border">
          <img 
            src={file.url} 
            alt={file.name}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="h-16 w-16 rounded flex items-center justify-center bg-background border">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{file.name}</div>
        <div className="text-sm text-muted-foreground">
          {format(new Date(file.uploadedAt), 'MMM d, yyyy h:mm a')}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            const link = document.createElement('a');
            link.href = file.url;
            link.download = file.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
        >
          <Download className="h-4 w-4" />
        </Button>

        {canDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(file)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Attach to Sculpture
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onAttachToSculpture(file, "models")}>
              Models
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAttachToSculpture(file, "renderings")}>
              Renderings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAttachToSculpture(file, "dimensions")}>
              Dimensions
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
