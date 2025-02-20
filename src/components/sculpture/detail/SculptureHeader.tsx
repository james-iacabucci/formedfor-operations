
import { Sculpture } from "@/types/sculpture";
import { SculptureStatus } from "./SculptureStatus";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileIcon, ImageIcon, MoreHorizontalIcon, RefreshCwIcon, ShuffleIcon, Trash2Icon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductLine } from "@/types/product-line";
import { ProductLineButton } from "./ProductLineButton";
import { useState } from "react";
import { useSculptureRegeneration } from "@/hooks/use-sculpture-regeneration";
import { useQueryClient } from "@tanstack/react-query";
import { SCULPTURE_STATUS } from "@/lib/status";

interface SculptureHeaderProps {
  sculpture: Sculpture;
}

export function SculptureHeader({ sculpture }: SculptureHeaderProps) {
  const { toast } = useToast();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isRegenerationSheetOpen, setIsRegenerationSheetOpen] = useState(false);
  const queryClient = useQueryClient();
  const { regenerateImage } = useSculptureRegeneration();

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      await regenerateImage(sculpture.id);
      await queryClient.invalidateQueries({ queryKey: ["sculpture", sculpture.id] });
      toast({
        title: "Success",
        description: "Image regenerated successfully.",
      });
    } catch (error) {
      console.error("Error regenerating:", error);
      toast({
        title: "Error",
        description: "Failed to regenerate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleDownload = () => {
    if (sculpture?.image_url) {
      const link = document.createElement("a");
      link.href = sculpture.image_url;
      link.download = `${sculpture.ai_generated_name || 'sculpture'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: "Download started",
        description: "Your image download has started.",
      });
    }
  };

  const handleDownloadPDF = () => {
    if (sculpture) {
      const link = document.createElement("a");
      link.href = `/sculpture-spec/${sculpture.id}.pdf`;
      link.download = `${sculpture.ai_generated_name || 'sculpture'}-spec.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: "Download started",
        description: "Your spec sheet download has started.",
      });
    }
  };

  const handleDelete = () => {
    if (sculpture) {
      const deleteDialog = document.getElementById(`delete-sculpture-${sculpture.id}`);
      if (deleteDialog instanceof HTMLDialogElement) {
        deleteDialog.showModal();
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="default"
        className="gap-2 font-mono uppercase"
      >
        FF
      </Button>
      <SculptureStatus
        sculptureId={sculpture.id}
        status={sculpture.status}
      />
      {(!sculpture.status || sculpture.status === SCULPTURE_STATUS.IDEA.code) && (
        <Button
          variant="outline"
          size="icon"
          onClick={handleRegenerate}
          disabled={isRegenerating}
        >
          <RefreshCwIcon className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
        </Button>
      )}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsRegenerationSheetOpen(true)}
      >
        <ShuffleIcon className="h-4 w-4" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="icon"
          >
            <MoreHorizontalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleDownload}>
            <ImageIcon className="h-4 w-4 mr-2" />
            Download Image
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDownloadPDF}>
            <FileIcon className="h-4 w-4 mr-2" />
            Download Spec Sheet
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} className="text-destructive">
            <Trash2Icon className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
