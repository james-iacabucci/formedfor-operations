
import { EditableField } from "./EditableField";
import { Sculpture } from "@/types/sculpture";
import { SculptureStatus } from "./SculptureStatus";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileIcon, ImageIcon, MoreHorizontalIcon, Trash2Icon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SculptureHeaderProps {
  sculpture: Sculpture;
}

export function SculptureHeader({ sculpture }: SculptureHeaderProps) {
  const { toast } = useToast();

  const handleDownloadImage = () => {
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
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <EditableField
            value={sculpture.ai_generated_name || "Untitled Sculpture"}
            type="input"
            sculptureId={sculpture.id}
            field="ai_generated_name"
            className="text-4xl font-bold tracking-tight"
          />
        </div>
        <div className="flex items-center gap-2">
          <SculptureStatus
            sculptureId={sculpture.id}
            status={sculpture.status}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleDownloadImage}>
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
      </div>

      <div>
        <EditableField
          value={sculpture.ai_description || "Sculpture description not defined"}
          type="textarea"
          sculptureId={sculpture.id}
          field="ai_description"
          className="text-muted-foreground italic"
        />
      </div>
    </div>
  );
}
