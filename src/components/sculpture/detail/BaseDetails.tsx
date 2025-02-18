
import { useState } from "react";
import { SculptureMaterialFinish } from "./SculptureMaterialFinish";
import { SculptureMethod } from "./SculptureMethod";
import { SculptureDimensions } from "./SculptureDimensions";
import { SculptureWeight } from "./SculptureWeight";
import { Sculpture } from "@/types/sculpture";

interface BaseDetailsProps {
  sculptureId: string;
  sculpture: Sculpture;
}

export function BaseDetails({ sculptureId, sculpture }: BaseDetailsProps) {
  return (
    <div className="space-y-4">
      <div>
        <SculptureMaterialFinish
          sculptureId={sculptureId}
          materialId={sculpture.base_material_id}
          isBase={true}
        />
      </div>

      <SculptureMethod
        sculptureId={sculptureId}
        methodId={sculpture.base_method_id}
        isBase={true}
      />

      <SculptureDimensions
        sculptureId={sculptureId}
        height={sculpture.base_height_in}
        width={sculpture.base_width_in}
        depth={sculpture.base_depth_in}
        isBase={true}
      />

      <SculptureWeight
        sculptureId={sculptureId}
        weightKg={sculpture.base_weight_kg}
        weightLbs={sculpture.base_weight_lbs}
        isBase={true}
      />
    </div>
  );
}
