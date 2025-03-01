
import { ZoomIn } from "lucide-react";

interface SculpturePreviewProps {
  imageUrl: string | null;
  prompt: string;
  onClick: () => void;
}

export function SculpturePreview({ imageUrl, prompt, onClick }: SculpturePreviewProps) {
  return (
    <div className="relative w-14 h-14 rounded-md overflow-hidden group">
      <img 
        src={imageUrl || ''} 
        alt={prompt}
        className="object-cover w-full h-full cursor-zoom-in"
        onClick={onClick}
      />
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <ZoomIn className="w-5 h-5 text-white" />
      </div>
    </div>
  );
}
