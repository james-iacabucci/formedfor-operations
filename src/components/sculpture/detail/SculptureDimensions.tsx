
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PenIcon, CheckIcon, XIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SculptureDimensionsProps {
  sculptureId: string;
  height: number | null;
  width: number | null;
  depth: number | null;
}

export function SculptureDimensions({ sculptureId, height, width, depth }: SculptureDimensionsProps) {
  const [isEditingDimensions, setIsEditingDimensions] = useState(false);
  const [dimensions, setDimensions] = useState({
    height: height?.toString() || "",
    width: width?.toString() || "",
    depth: depth?.toString() || ""
  });

  const calculateCm = (inches: number): number => {
    return inches * 2.54;
  };

  const handleDimensionsUpdate = async () => {
    const { error } = await supabase
      .from('sculptures')
      .update({
        height_in: dimensions.height ? parseFloat(dimensions.height) : null,
        width_in: dimensions.width ? parseFloat(dimensions.width) : null,
        depth_in: dimensions.depth ? parseFloat(dimensions.depth) : null
      })
      .eq('id', sculptureId);

    if (error) {
      console.error('Error updating dimensions:', error);
      return;
    }

    setIsEditingDimensions(false);
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Dimensions</h2>
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Inches</label>
            {isEditingDimensions ? (
              <div className="flex gap-2">
                <Button
                  onClick={handleDimensionsUpdate}
                  size="sm"
                  variant="ghost"
                >
                  <CheckIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDimensions({
                      height: height?.toString() || "",
                      width: width?.toString() || "",
                      depth: depth?.toString() || ""
                    });
                    setIsEditingDimensions(false);
                  }}
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingDimensions(true)}
              >
                <PenIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {isEditingDimensions ? (
              <>
                <Input
                  type="number"
                  value={dimensions.height}
                  onChange={(e) => setDimensions(prev => ({ ...prev, height: e.target.value }))}
                  placeholder="Height"
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <Input
                  type="number"
                  value={dimensions.width}
                  onChange={(e) => setDimensions(prev => ({ ...prev, width: e.target.value }))}
                  placeholder="Width"
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <Input
                  type="number"
                  value={dimensions.depth}
                  onChange={(e) => setDimensions(prev => ({ ...prev, depth: e.target.value }))}
                  placeholder="Depth"
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </>
            ) : (
              <>
                <Input
                  value={height?.toString() || ""}
                  readOnly
                  placeholder="Height"
                  className="cursor-pointer"
                  onClick={() => setIsEditingDimensions(true)}
                />
                <Input
                  value={width?.toString() || ""}
                  readOnly
                  placeholder="Width"
                  className="cursor-pointer"
                  onClick={() => setIsEditingDimensions(true)}
                />
                <Input
                  value={depth?.toString() || ""}
                  readOnly
                  placeholder="Depth"
                  className="cursor-pointer"
                  onClick={() => setIsEditingDimensions(true)}
                />
              </>
            )}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Centimeters</label>
          <div className="grid grid-cols-3 gap-2">
            <Input
              value={height ? calculateCm(height).toFixed(2) : ""}
              readOnly
              disabled
              placeholder="Height"
            />
            <Input
              value={width ? calculateCm(width).toFixed(2) : ""}
              readOnly
              disabled
              placeholder="Width"
            />
            <Input
              value={depth ? calculateCm(depth).toFixed(2) : ""}
              readOnly
              disabled
              placeholder="Depth"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
