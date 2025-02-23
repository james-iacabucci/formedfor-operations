
import { Sculpture } from "@/types/sculpture";
import { SculptureStatus } from "./SculptureStatus";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  FileIcon, 
  ImageIcon, 
  MessageCircleIcon, 
  MoreHorizontalIcon, 
  RefreshCwIcon, 
  Trash2Icon, 
  Wand2Icon,
  ChevronDownIcon 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useSculptureRegeneration } from "@/hooks/use-sculpture-regeneration";
import { useQueryClient } from "@tanstack/react-query";
import { RegenerationSheet } from "../RegenerationSheet";
import { ChatSheet } from "@/components/chat/ChatSheet";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SculptureHeaderProps {
  sculpture: Sculpture;
}

export function SculptureHeader({ sculpture }: SculptureHeaderProps) {
  const { toast: useToastHook } = useToast();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isRegenerationSheetOpen, setIsRegenerationSheetOpen] = useState(false);
  const [isChatSheetOpen, setIsChatSheetOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const queryClient = useQueryClient();
  const { regenerateImage, generateVariant } = useSculptureRegeneration();

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      await regenerateImage(sculpture.id);
      await queryClient.invalidateQueries({ queryKey: ["sculpture", sculpture.id] });
      useToastHook({
        title: "Success",
        description: "Image regenerated successfully.",
      });
    } catch (error) {
      console.error("Error regenerating:", error);
      useToastHook({
        title: "Error",
        description: "Failed to regenerate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const generatePDF = async (pricingMode: 'none' | 'trade' | 'retail') => {
    if (isGeneratingPDF) return;

    try {
      setIsGeneratingPDF(true);
      console.log("Starting PDF generation for sculpture:", sculpture.id, "with pricing mode:", pricingMode);
      
      const { data: response, error } = await supabase.functions.invoke(
        'generate-sculpture-pdf',
        {
          body: { 
            sculptureId: sculpture.id,
            pricingMode
          },
        }
      );

      console.log("Edge function response:", { data: response, error });

      if (error) throw error;
      if (!response?.data) throw new Error("No PDF data received");

      // Convert base64 to blob
      const byteCharacters = atob(response.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${sculpture.ai_generated_name || 'sculpture'}.pdf`);
      
      console.log("Created download link:", url);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("PDF generated successfully");
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate PDF", {
        description: "Please try again later"
      });
    } finally {
      setIsGeneratingPDF(false);
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
      useToastHook({
        title: "Download started",
        description: "Your image download has started.",
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

  const showRegenerateButton = !sculpture.status || sculpture.status === "idea";

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
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsRegenerationSheetOpen(true)}
      >
        <Wand2Icon className="h-4 w-4" />
      </Button>
      {showRegenerateButton && (
        <Button
          variant="outline"
          size="icon"
          onClick={handleRegenerate}
          disabled={isRegenerating}
        >
          <RefreshCwIcon className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
        </Button>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            disabled={isGeneratingPDF}
          >
            <FileIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => generatePDF('none')}>
            No Pricing
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => generatePDF('trade')}>
            Trade Pricing
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => generatePDF('retail')}>
            Trade & Retail Pricing
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsChatSheetOpen(true)}
      >
        <MessageCircleIcon className="h-4 w-4" />
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
          <DropdownMenuItem onClick={handleDelete} className="text-destructive">
            <Trash2Icon className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RegenerationSheet
        open={isRegenerationSheetOpen}
        onOpenChange={setIsRegenerationSheetOpen}
        onRegenerate={(options) => generateVariant(sculpture.id, sculpture.user_id, sculpture.prompt, options)}
        isRegenerating={isRegenerating}
        defaultPrompt={sculpture.prompt}
      />

      <ChatSheet
        open={isChatSheetOpen}
        onOpenChange={setIsChatSheetOpen}
        threadId={sculpture.id}
      />
    </div>
  );
}

