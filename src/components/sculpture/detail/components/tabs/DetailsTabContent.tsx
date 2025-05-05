
import { format } from "date-fns";
import { Sculpture } from "@/types/sculpture";
import { SculptureDescription } from "../SculptureDescription";
import { SculpturePrompt } from "../../SculpturePrompt";

interface DetailsTabContentProps {
  sculptureId: string;
  imageUrl: string | null;
  description: string | null;
  name: string | null;
  prompt: string;
  creativityLevel: string | null;
  createdAt: string;
}

export function DetailsTabContent({ 
  sculptureId, 
  imageUrl, 
  description, 
  name,
  prompt,
  creativityLevel,
  createdAt
}: DetailsTabContentProps) {
  return (
    <>
      <SculptureDescription 
        sculptureId={sculptureId}
        imageUrl={imageUrl}
        description={description}
        name={name}
      />

      <div className="mt-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">AI Settings</h2>
          <SculpturePrompt prompt={prompt} />
          <dl className="grid grid-cols-1 gap-2 text-sm mt-4">
            {creativityLevel && (
              <div className="flex justify-between py-2 border-b">
                <dt className="font-medium">Variation Creativity</dt>
                <dd className="text-muted-foreground capitalize">
                  {creativityLevel}
                </dd>
              </div>
            )}
            <div className="flex py-2 border-b">
              <dt className="font-medium">Created</dt>
              <dd className="ml-4 text-muted-foreground">
                {format(new Date(createdAt), "PPP")}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </>
  );
}
