
import { useState, useEffect } from "react";
import { NewQuote } from "@/types/fabrication-quote-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface SculptureDetailsSectionProps {
  sculptureId: string;
  newQuote: NewQuote;
  onQuoteChange: (quote: NewQuote) => void;
  isBase?: boolean;
  isReadOnly?: boolean;
}

export function SculptureDetailsSection({
  sculptureId,
  newQuote,
  onQuoteChange,
  isBase = false,
  isReadOnly = false
}: SculptureDetailsSectionProps) {
  // Fetch materials
  const { data: materials } = useQuery({
    queryKey: ["value_lists", "material"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("value_lists")
        .select("*")
        .eq("type", "material");

      if (error) throw error;
      return data;
    },
  });

  // Fetch methods
  const { data: methods } = useQuery({
    queryKey: ["value_lists", "method"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("value_lists")
        .select("*")
        .eq("type", "method");

      if (error) throw error;
      return data;
    },
  });

  const handleChange = (field: keyof NewQuote, value: any) => {
    onQuoteChange({
      ...newQuote,
      [field]: value === "" ? null : value
    });
  };

  const handleNumberChange = (field: keyof NewQuote, value: string) => {
    onQuoteChange({
      ...newQuote,
      [field]: value === "" ? null : Number(value)
    });
  };

  // Define field mapping based on isBase
  const fieldPrefix = isBase ? "base_" : "";
  const materialIdField = `${fieldPrefix}material_id` as keyof NewQuote;
  const methodIdField = `${fieldPrefix}method_id` as keyof NewQuote;
  const heightField = `${fieldPrefix}height_in` as keyof NewQuote;
  const widthField = `${fieldPrefix}width_in` as keyof NewQuote;
  const depthField = `${fieldPrefix}depth_in` as keyof NewQuote;
  const weightKgField = `${fieldPrefix}weight_kg` as keyof NewQuote;
  const weightLbsField = `${fieldPrefix}weight_lbs` as keyof NewQuote;

  // Extract current values
  const materialId = newQuote[materialIdField] as string | null;
  const methodId = newQuote[methodIdField] as string | null;
  const height = newQuote[heightField] as number | null;
  const width = newQuote[widthField] as number | null;
  const depth = newQuote[depthField] as number | null;
  const weightKg = newQuote[weightKgField] as number | null;
  const weightLbs = newQuote[weightLbsField] as number | null;

  // Get material and method names for read-only display
  const materialName = materials?.find(m => m.id === materialId)?.name || "None";
  const methodName = methods?.find(m => m.id === methodId)?.name || "None";

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{isBase ? "Base Details" : "Sculpture Details"}</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${fieldPrefix}material`}>Material</Label>
          {isReadOnly ? (
            <div className="h-10 px-3 py-2 rounded-md border border-input bg-background text-muted-foreground">
              {materialName}
            </div>
          ) : (
            <Select
              value={materialId || ''}
              onValueChange={(value) => handleChange(materialIdField, value)}
            >
              <SelectTrigger id={`${fieldPrefix}material`}>
                <SelectValue placeholder="Select material" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {materials?.map((material) => (
                  <SelectItem key={material.id} value={material.id}>
                    {material.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`${fieldPrefix}method`}>Method</Label>
          {isReadOnly ? (
            <div className="h-10 px-3 py-2 rounded-md border border-input bg-background text-muted-foreground">
              {methodName}
            </div>
          ) : (
            <Select
              value={methodId || ''}
              onValueChange={(value) => handleChange(methodIdField, value)}
            >
              <SelectTrigger id={`${fieldPrefix}method`}>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {methods?.map((method) => (
                  <SelectItem key={method.id} value={method.id}>
                    {method.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${fieldPrefix}height`}>Height (in)</Label>
          {isReadOnly ? (
            <div className="h-10 px-3 py-2 rounded-md border border-input bg-background text-muted-foreground">
              {height !== null ? height : "Not specified"}
            </div>
          ) : (
            <Input
              id={`${fieldPrefix}height`}
              type="number"
              value={height ?? ''}
              onChange={(e) => handleNumberChange(heightField, e.target.value)}
              placeholder="Height"
              min="0"
              step="0.1"
            />
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`${fieldPrefix}width`}>Width (in)</Label>
          {isReadOnly ? (
            <div className="h-10 px-3 py-2 rounded-md border border-input bg-background text-muted-foreground">
              {width !== null ? width : "Not specified"}
            </div>
          ) : (
            <Input
              id={`${fieldPrefix}width`}
              type="number"
              value={width ?? ''}
              onChange={(e) => handleNumberChange(widthField, e.target.value)}
              placeholder="Width"
              min="0"
              step="0.1"
            />
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`${fieldPrefix}depth`}>Depth (in)</Label>
          {isReadOnly ? (
            <div className="h-10 px-3 py-2 rounded-md border border-input bg-background text-muted-foreground">
              {depth !== null ? depth : "Not specified"}
            </div>
          ) : (
            <Input
              id={`${fieldPrefix}depth`}
              type="number"
              value={depth ?? ''}
              onChange={(e) => handleNumberChange(depthField, e.target.value)}
              placeholder="Depth"
              min="0"
              step="0.1"
            />
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${fieldPrefix}weight_kg`}>Weight (kg)</Label>
          {isReadOnly ? (
            <div className="h-10 px-3 py-2 rounded-md border border-input bg-background text-muted-foreground">
              {weightKg !== null ? weightKg : "Not specified"}
            </div>
          ) : (
            <Input
              id={`${fieldPrefix}weight_kg`}
              type="number"
              value={weightKg ?? ''}
              onChange={(e) => handleNumberChange(weightKgField, e.target.value)}
              placeholder="Weight in kg"
              min="0"
              step="0.01"
            />
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`${fieldPrefix}weight_lbs`}>Weight (lbs)</Label>
          {isReadOnly ? (
            <div className="h-10 px-3 py-2 rounded-md border border-input bg-background text-muted-foreground">
              {weightLbs !== null ? weightLbs : "Not specified"}
            </div>
          ) : (
            <Input
              id={`${fieldPrefix}weight_lbs`}
              type="number"
              value={weightLbs ?? ''}
              onChange={(e) => handleNumberChange(weightLbsField, e.target.value)}
              placeholder="Weight in lbs"
              min="0"
              step="0.01"
            />
          )}
        </div>
      </div>
    </div>
  );
}
