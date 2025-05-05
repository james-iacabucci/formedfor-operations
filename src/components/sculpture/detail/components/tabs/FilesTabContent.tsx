
import { SculptureFiles } from "../../SculptureFiles";
import { FileUpload } from "@/types/sculpture";

interface FilesTabContentProps {
  sculptureId: string;
  models: FileUpload[];
  renderings: FileUpload[];
  dimensions: FileUpload[];
}

export function FilesTabContent({ 
  sculptureId, 
  models, 
  renderings, 
  dimensions 
}: FilesTabContentProps) {
  return (
    <SculptureFiles 
      sculptureId={sculptureId}
      models={models}
      renderings={renderings}
      dimensions={dimensions}
    />
  );
}
