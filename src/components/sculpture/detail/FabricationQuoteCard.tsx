
import { Button } from "@/components/ui/button";
import { FabricationQuote } from "@/types/fabrication-quote";
import { format } from "date-fns";
import { PencilIcon, Trash2Icon, CheckCircle2Icon } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface FabricationQuoteCardProps {
  quote: FabricationQuote;
  fabricatorName?: string;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  calculateTotal: (quote: FabricationQuote) => number;
  calculateTradePrice: (quote: FabricationQuote) => number;
  calculateRetailPrice: (tradePrice: number) => number;
  formatNumber: (num: number) => string;
  isEditing?: boolean;
}

export function FabricationQuoteCard({
  quote,
  fabricatorName,
  onSelect,
  onEdit,
  onDelete,
  calculateTotal,
  calculateTradePrice,
  calculateRetailPrice,
  formatNumber,
  isEditing
}: FabricationQuoteCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Fetch material and method names
  const { data: materials } = useQuery({
    queryKey: ['value-lists', 'material'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('value_lists')
        .select('*')
        .eq('type', 'material')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: methods } = useQuery({
    queryKey: ['value-lists', 'method'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('value_lists')
        .select('*')
        .eq('type', 'method')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const getMaterialName = (materialId: string | null) => {
    if (!materialId || !materials) return "Not specified";
    const material = materials.find(m => m.id === materialId);
    return material ? material.name : "Not specified";
  };

  const getMethodName = (methodId: string | null) => {
    if (!methodId || !methods) return "Not specified";
    const method = methods.find(m => m.id === methodId);
    return method ? method.name : "Not specified";
  };

  const formatDimensionString = (h: number | null, w: number | null, d: number | null) => {
    if (!h && !w && !d) return "Not specified";
    
    const formatValue = (val: number | null) => {
      if (val === null) return '-';
      return val;
    };
    
    const formatValueCm = (val: number | null) => {
      if (val === null) return '-';
      return (val * 2.54).toFixed(1);
    };
    
    const imperial = `${formatValue(h)} x ${formatValue(w)} x ${formatValue(d)} (in)`;
    const metric = `${formatValueCm(h)} x ${formatValueCm(w)} x ${formatValueCm(d)} (cm)`;
    
    return `${imperial} | ${metric}`;
  };

  const formatWeightString = (kg: number | null, lbs: number | null) => {
    if (!kg && !lbs) return "Not specified";
    
    const formatValue = (val: number | null) => {
      if (val === null) return '-';
      return val.toFixed(2);
    };
    
    return `${formatValue(lbs)} (lbs) | ${formatValue(kg)} (kg)`;
  };

  return (
    <div 
      className={`border rounded-lg p-4 space-y-4 transition-colors ${
        quote.is_selected ? 'border-primary bg-primary/5' : ''
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">
            {fabricatorName}
          </h3>
          <p className="text-sm text-muted-foreground">
            {format(new Date(quote.quote_date), "PPP")}
          </p>
        </div>
        <div className="flex gap-2">
          {!quote.is_selected && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSelect}
              title="Select this quote"
            >
              <CheckCircle2Icon className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            title="Edit quote"
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          {isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-destructive hover:text-destructive"
              title="Delete quote"
            >
              <Trash2Icon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <Button 
        variant="ghost" 
        className="w-full justify-start p-0 text-sm font-medium" 
        onClick={() => setShowDetails(!showDetails)}
      >
        {showDetails ? "Hide Details" : "Show Details"}
      </Button>

      {showDetails && (
        <>
          {/* Sculpture Details Section */}
          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-semibold">Sculpture Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-muted-foreground">Material</p>
                <p>{getMaterialName(quote.material_id)}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Method</p>
                <p>{getMethodName(quote.method_id)}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Dimensions (HWD)</p>
                <p>{formatDimensionString(quote.height_in, quote.width_in, quote.depth_in)}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Weight</p>
                <p>{formatWeightString(quote.weight_kg, quote.weight_lbs)}</p>
              </div>
            </div>
          </div>
          
          {/* Base Details Section */}
          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-semibold">Base Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-muted-foreground">Material</p>
                <p>{getMaterialName(quote.base_material_id)}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Method</p>
                <p>{getMethodName(quote.base_method_id)}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Dimensions (HWD)</p>
                <p>{formatDimensionString(quote.base_height_in, quote.base_width_in, quote.base_depth_in)}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Weight</p>
                <p>{formatWeightString(quote.base_weight_kg, quote.base_weight_lbs)}</p>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Pricing Details Section */}
      <div className="space-y-3 pt-2">
        <h4 className="text-sm font-semibold">Pricing Details</h4>
        <div className="grid grid-cols-5 gap-4 text-sm">
          <div>
            <p className="font-medium text-muted-foreground">Fabrication</p>
            <p>${formatNumber(quote.fabrication_cost)}</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Shipping</p>
            <p>${formatNumber(quote.shipping_cost)}</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Customs</p>
            <p>${formatNumber(quote.customs_cost)}</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Other</p>
            <p>${formatNumber(quote.other_cost)}</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Total Cost</p>
            <p>${formatNumber(calculateTotal(quote))}</p>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4 text-sm">
          <div>
            <p className="font-medium text-muted-foreground">Markup</p>
            <p>{quote.markup}x</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Trade Price</p>
            <p>${formatNumber(calculateTradePrice(quote))}</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Retail Price</p>
            <p>${formatNumber(calculateRetailPrice(calculateTradePrice(quote)))}</p>
          </div>
          <div className="col-span-2" />
        </div>
      </div>

      {quote.notes && (
        <div className="text-sm">
          <p className="font-medium text-muted-foreground">Notes</p>
          <p className="whitespace-pre-line">{quote.notes}</p>
        </div>
      )}

      {quote.is_selected && (
        <div className="flex items-center gap-2 text-sm text-primary">
          <CheckCircle2Icon className="h-4 w-4" />
          <span>Selected Quote</span>
        </div>
      )}
    </div>
  );
}
