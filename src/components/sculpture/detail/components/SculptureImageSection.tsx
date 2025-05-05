
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { SculptureDetailImage } from "../SculptureDetailImage";
import { ChatSheet } from "@/components/chat/ChatSheet";

interface SculptureImageSectionProps {
  sculptureId: string;
  imageUrl: string | null;
  prompt: string;
  isRegenerating: boolean;
  userId: string;
  onRegenerate: () => Promise<void>;
  onManageTags: () => void;
}

export function SculptureImageSection({
  sculptureId,
  imageUrl,
  prompt,
  isRegenerating,
  userId,
  onRegenerate,
  onManageTags
}: SculptureImageSectionProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  return (
    <div className="relative border rounded-lg overflow-hidden">
      <AspectRatio ratio={1}>
        <SculptureDetailImage
          imageUrl={imageUrl || ""}
          prompt={prompt}
          isRegenerating={isRegenerating}
          sculptureId={sculptureId}
          userId={userId}
          onRegenerate={onRegenerate}
          onManageTags={onManageTags}
        />
      </AspectRatio>
      <Button
        variant="outline"
        size="sm"
        className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
        onClick={() => setIsChatOpen(true)}
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        Discussion
      </Button>
      
      <ChatSheet
        open={isChatOpen}
        onOpenChange={setIsChatOpen}
        threadId={sculptureId}
        sculptureId={sculptureId}
      />
    </div>
  );
}
