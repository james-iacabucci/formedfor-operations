
import { Edit, Reply, Trash2, Copy, ThumbsUp, Eye, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { Message } from "./types";

interface MessageItemActionsProps {
  isHovered: boolean;
  isOwnMessage: boolean;
  isDeleted: boolean;
  handleEdit: () => void;
  handleDelete: () => void;
  handleCopy: () => void;
  handleReaction: (reactionType: string) => void;
}

export function MessageItemActions({
  isHovered,
  isOwnMessage,
  isDeleted,
  handleEdit,
  handleDelete,
  handleCopy,
  handleReaction
}: MessageItemActionsProps) {
  return (
    <div className={`flex items-center transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
      <TooltipProvider delayDuration={300}>
        {isOwnMessage ? (
          <>
            {!isDeleted && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 rounded-md"
                    onClick={handleEdit}
                  >
                    <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit</p>
                </TooltipContent>
              </Tooltip>
            )}
            
            {!isDeleted && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 rounded-md hover:bg-destructive/10"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete</p>
                </TooltipContent>
              </Tooltip>
            )}
          </>
        ) : (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 rounded-md"
                  onClick={() => handleReaction("thumbs-up")}
                >
                  <ThumbsUp className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Like</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 rounded-md"
                  onClick={() => handleReaction("eyes")}
                >
                  <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Seen</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 rounded-md"
                  onClick={() => handleReaction("check")}
                >
                  <Check className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Done</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 rounded-md"
                  onClick={handleCopy}
                >
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy</p>
              </TooltipContent>
            </Tooltip>
          </>
        )}
      </TooltipProvider>
    </div>
  );
}
