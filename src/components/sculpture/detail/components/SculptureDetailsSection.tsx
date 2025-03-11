
import { SculptureMaterialFinish } from "../SculptureMaterialFinish";
import { SculptureMethod } from "../SculptureMethod";
import { SculptureDimensions } from "../SculptureDimensions";
import { SculptureWeight } from "../SculptureWeight";
import { NewQuote } from "@/types/fabrication-quote-form";

interface SculptureDetailsSectionProps {
  sculptureId: string;
  newQuote: NewQuote;
  onQuoteChange: (quote: NewQuote) => void;
  isBase?: boolean;
}

export function SculptureDetailsSection({
  sculptureId,
  newQuote,
  onQuoteChange,
  isBase = false
}: SculptureDetailsSectionProps) {
  const handleDimensionsChange = (field: string, value: number | null) => {
    onQuoteChange({ ...newQuote, [field]: value });
  };

  // Determine which props to use based on isBase
  const materialId = isBase ? newQuote.base_material_id : newQuote.material_id;
  const methodId = isBase ? newQuote.base_method_id : newQuote.method_id;
  const height = isBase ? newQuote.base_height_in : newQuote.height_in;
  const width = isBase ? newQuote.base_width_in : newQuote.width_in;
  const depth = isBase ? newQuote.base_depth_in : newQuote.depth_in;
  const weightKg = isBase ? newQuote.base_weight_kg : newQuote.weight_kg;
  const weightLbs = isBase ? newQuote.base_weight_lbs : newQuote.weight_lbs;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{isBase ? "Base Details" : "Sculpture Details"}</h3>
      <div className="space-y-4">
        <SculptureMaterialFinish
          sculptureId={sculptureId}
          materialId={materialId}
          onMaterialChange={(materialId) => 
            onQuoteChange({ 
              ...newQuote, 
              [isBase ? 'base_material_id' : 'material_id']: materialId 
            })
          }
          isBase={isBase}
          isQuoteForm={true}
        />
        
        <SculptureMethod
          sculptureId={sculptureId}
          methodId={methodId}
          onMethodChange={(methodId) => 
            onQuoteChange({ 
              ...newQuote, 
              [isBase ? 'base_method_id' : 'method_id']: methodId 
            })
          }
          isBase={isBase}
          isQuoteForm={true}
        />
        
        <SculptureDimensions
          sculptureId={sculptureId}
          height={height}
          width={width}
          depth={depth}
          onDimensionsChange={(field, value) => handleDimensionsChange(field, value)}
          isBase={isBase}
          isQuoteForm={true}
        />
        
        <SculptureWeight
          sculptureId={sculptureId}
          weightKg={weightKg}
          weightLbs={weightLbs}
          onWeightChange={(field, value) => handleDimensionsChange(field, value)}
          isBase={isBase}
          isQuoteForm={true}
        />
      </div>
    </div>
  );
}
