
import { SculptureMaterialFinish } from "../SculptureMaterialFinish";
import { SculptureMethod } from "../SculptureMethod";
import { SculptureDimensions } from "../SculptureDimensions";
import { SculptureWeight } from "../SculptureWeight";

interface VariantDetailsSectionProps {
  sculptureId: string;
  variantId: string;
  details: {
    materialId: string | null;
    methodId: string | null;
    heightIn: number | null;
    widthIn: number | null;
    depthIn: number | null;
    weightKg: number | null;
    weightLbs: number | null;
  };
  isBase?: boolean;
  onAttributeChange: (field: string, value: any) => void;
}

export function VariantDetailsSection({
  sculptureId,
  variantId,
  details,
  isBase = false,
  onAttributeChange
}: VariantDetailsSectionProps) {
  const prefix = isBase ? "base" : "";
  const titleCase = isBase ? "Base" : "Sculpture";
  
  return (
    <div className="space-y-4">
      <h3 className="text-md font-semibold mb-2">{titleCase} Details</h3>
      <div className="space-y-4">
        <SculptureMaterialFinish
          sculptureId={sculptureId}
          materialId={details.materialId}
          onMaterialChange={(materialId) => onAttributeChange(`${prefix}materialId`, materialId)}
          isBase={isBase}
          isVariantForm={true}
          variantId={variantId}
        />
        
        <SculptureMethod
          sculptureId={sculptureId}
          methodId={details.methodId}
          onMethodChange={(methodId) => onAttributeChange(`${prefix}methodId`, methodId)}
          isBase={isBase}
          isVariantForm={true}
          variantId={variantId}
        />
        
        <SculptureDimensions
          sculptureId={sculptureId}
          height={details.heightIn}
          width={details.widthIn}
          depth={details.depthIn}
          onDimensionsChange={(field, value) => onAttributeChange(field, value)}
          isBase={isBase}
          isVariantForm={true}
          variantId={variantId}
        />
        
        <SculptureWeight
          sculptureId={sculptureId}
          weightKg={details.weightKg}
          weightLbs={details.weightLbs}
          onWeightChange={(field, value) => onAttributeChange(field, value)}
          isBase={isBase}
          isVariantForm={true}
          variantId={variantId}
        />
      </div>
    </div>
  );
}
