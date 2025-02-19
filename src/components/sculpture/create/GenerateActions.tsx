
import { Button } from "@/components/ui/button";
import { CheckIcon, Loader2Icon, RefreshCwIcon } from "lucide-react";

interface GenerateActionsProps {
  onClose: () => void;
  onSave: () => void;
  onGenerate: () => void;
  isSaving: boolean;
  isGenerating: boolean;
  hasPrompt: boolean;
  selectedCount: number;
  hasGeneratedImages: boolean;
}

export function GenerateActions({
  onClose,
  onSave,
  onGenerate,
  isSaving,
  isGenerating,
  hasPrompt,
  selectedCount,
  hasGeneratedImages
}: GenerateActionsProps) {
  return (
    <div className="flex justify-end gap-2 mt-4">
      <Button variant="outline" onClick={onClose}>
        Cancel
      </Button>
      
      {selectedCount > 0 && (
        <Button 
          variant="secondary"
          onClick={onSave}
          disabled={isSaving}
          className="gap-2"
        >
          {isSaving ? (
            <>
              <Loader2Icon className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckIcon className="h-4 w-4" />
              Save to Library
            </>
          )}
        </Button>
      )}
      
      <Button 
        onClick={onGenerate}
        disabled={isGenerating || isSaving || !hasPrompt}
        className="gap-2"
      >
        {isGenerating ? (
          <>
            <Loader2Icon className="h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            {hasGeneratedImages ? (
              <>
                <RefreshCwIcon className="h-4 w-4" />
                Regenerate
              </>
            ) : (
              'Generate'
            )}
          </>
        )}
      </Button>
    </div>
  );
}
