
interface SculpturePromptProps {
  prompt: string;
}

export function SculpturePrompt({ prompt }: SculpturePromptProps) {
  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Prompt</h3>
      <p className="text-muted-foreground">{prompt}</p>
    </div>
  );
}
