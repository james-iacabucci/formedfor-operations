
interface SculptureImageProps {
  imageUrl: string;
  prompt: string;
  isRegenerating: boolean;
  onImageClick: () => void;
}

export function SculptureImage({
  imageUrl,
  prompt,
  isRegenerating,
  onImageClick,
}: SculptureImageProps) {
  return (
    <img
      src={imageUrl}
      alt={prompt}
      className="object-cover w-full h-full"
      onClick={onImageClick}
    />
  );
}
