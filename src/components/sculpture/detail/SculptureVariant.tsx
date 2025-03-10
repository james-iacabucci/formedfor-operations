
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SculptureMaterialFinish } from "./SculptureMaterialFinish";
import { SculptureMethod } from "./SculptureMethod";
import { SculptureDimensions } from "./SculptureDimensions";
import { SculptureWeight } from "./SculptureWeight";

export interface SculptureVariantDetails {
  id: string;
  sculptureId: string;
  materialId: string | null;
  methodId: string | null;
  heightIn: number | null;
  widthIn: number | null;
  depthIn: number | null;
  weightKg: number | null;
  weightLbs: number | null;
  baseMaterialId: string | null;
  baseMethodId: string | null;
  baseHeightIn: number | null;
  baseWidthIn: number | null;
  baseDepthIn: number | null;
  baseWeightKg: number | null;
  baseWeightLbs: number | null;
  orderIndex: number;
}

interface SculptureVariantProps {
  variants: SculptureVariantDetails[];
  onVariantChange: (variantId: string) => void;
  selectedVariantId: string | null;
}

export function SculptureVariant({ 
  variants, 
  onVariantChange,
  selectedVariantId 
}: SculptureVariantProps) {
  const [currentIndex, setCurrentIndex] = useState(() => {
    const selectedIndex = variants.findIndex(v => v.id === selectedVariantId);
    return selectedIndex >= 0 ? selectedIndex : 0;
  });

  const currentVariant = variants[currentIndex];
  
  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      onVariantChange(variants[newIndex].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < variants.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      onVariantChange(variants[newIndex].id);
    }
  };

  if (!currentVariant) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardContent className="pt-6 px-4 pb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Variant {currentIndex + 1} of {variants.length}</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              disabled={currentIndex === variants.length - 1}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-md font-semibold mb-2">Sculpture Details</h3>
          <div className="space-y-4">
            <SculptureMaterialFinish
              sculptureId={currentVariant.sculptureId}
              materialId={currentVariant.materialId}
              onMaterialChange={(materialId) => console.log("Material changed to:", materialId)}
              isVariantForm={true}
              variantId={currentVariant.id}
            />
            
            <SculptureMethod
              sculptureId={currentVariant.sculptureId}
              methodId={currentVariant.methodId}
              onMethodChange={(methodId) => console.log("Method changed to:", methodId)}
              isVariantForm={true}
              variantId={currentVariant.id}
            />
            
            <SculptureDimensions
              sculptureId={currentVariant.sculptureId}
              height={currentVariant.heightIn}
              width={currentVariant.widthIn}
              depth={currentVariant.depthIn}
              onDimensionsChange={(field, value) => console.log(field, "changed to:", value)}
              isVariantForm={true}
              variantId={currentVariant.id}
            />
            
            <SculptureWeight
              sculptureId={currentVariant.sculptureId}
              weightKg={currentVariant.weightKg}
              weightLbs={currentVariant.weightLbs}
              onWeightChange={(field, value) => console.log(field, "changed to:", value)}
              isVariantForm={true}
              variantId={currentVariant.id}
            />
          </div>
        </div>
        
        <div className="space-y-4 mt-6">
          <h3 className="text-md font-semibold mb-2">Base Details</h3>
          <div className="space-y-4">
            <SculptureMaterialFinish
              sculptureId={currentVariant.sculptureId}
              materialId={currentVariant.baseMaterialId}
              onMaterialChange={(materialId) => console.log("Base material changed to:", materialId)}
              isBase={true}
              isVariantForm={true}
              variantId={currentVariant.id}
            />
            
            <SculptureMethod
              sculptureId={currentVariant.sculptureId}
              methodId={currentVariant.baseMethodId}
              onMethodChange={(methodId) => console.log("Base method changed to:", methodId)}
              isBase={true}
              isVariantForm={true}
              variantId={currentVariant.id}
            />
            
            <SculptureDimensions
              sculptureId={currentVariant.sculptureId}
              height={currentVariant.baseHeightIn}
              width={currentVariant.baseWidthIn}
              depth={currentVariant.baseDepthIn}
              onDimensionsChange={(field, value) => console.log(field, "changed to:", value)}
              isBase={true}
              isVariantForm={true}
              variantId={currentVariant.id}
            />
            
            <SculptureWeight
              sculptureId={currentVariant.sculptureId}
              weightKg={currentVariant.baseWeightKg}
              weightLbs={currentVariant.baseWeightLbs}
              onWeightChange={(field, value) => console.log(field, "changed to:", value)}
              isBase={true}
              isVariantForm={true}
              variantId={currentVariant.id}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
