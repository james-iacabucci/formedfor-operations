
interface SculpturePromptProps {
  prompt: string;
}

export function SculpturePrompt({ prompt }: SculpturePromptProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">AI Prompt</h2>
      <p className="text-muted-foreground">{prompt}</p>
    </div>
  );
}
