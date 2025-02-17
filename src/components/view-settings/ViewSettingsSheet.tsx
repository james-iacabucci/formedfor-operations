
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ViewSettings {
  sortBy: 'created_at' | 'ai_generated_name' | 'updated_at';
  sortOrder: 'asc' | 'desc';
  productLineId: string | null;
  materialIds: string[];
  status: string | null;
  heightOperator: 'eq' | 'gt' | 'lt' | null;
  heightValue: number | null;
}

interface ViewSettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: ViewSettings;
  onApply: (settings: ViewSettings) => void;
}

export function ViewSettingsSheet({ 
  open, 
  onOpenChange,
  settings: initialSettings,
  onApply,
}: ViewSettingsSheetProps) {
  const [settings, setSettings] = useState<ViewSettings>({ ...initialSettings });

  const { data: productLines } = useQuery({
    queryKey: ["product_lines"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("product_lines")
        .select("*")
        .eq("user_id", user.user.id);

      if (error) throw error;
      return data;
    },
  });

  const { data: materials } = useQuery({
    queryKey: ["value_lists_materials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("value_lists")
        .select("*")
        .eq("type", "material");

      if (error) throw error;
      return data;
    },
  });

  const handleApply = () => {
    onApply(settings);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSettings({ ...initialSettings });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        className="sm:max-w-md flex flex-col"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={() => handleCancel()}
      >
        <SheetHeader>
          <SheetTitle>View Settings</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 py-6">
            {/* Sorting */}
            <div className="space-y-4">
              <Label>Sort By</Label>
              <div className="grid grid-cols-2 gap-4">
                <Select
                  value={settings.sortBy}
                  onValueChange={(value: ViewSettings['sortBy']) => 
                    setSettings(prev => ({ ...prev, sortBy: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at">Creation Date</SelectItem>
                    <SelectItem value="ai_generated_name">Sculpture Name</SelectItem>
                    <SelectItem value="updated_at">Last Modified</SelectItem>
                  </SelectContent>
                </Select>

                <RadioGroup
                  value={settings.sortOrder}
                  onValueChange={(value: 'asc' | 'desc') => 
                    setSettings(prev => ({ ...prev, sortOrder: value }))
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="asc" id="asc" />
                    <Label htmlFor="asc" className="flex items-center gap-1">
                      <ArrowUpIcon className="h-4 w-4" />
                      ASC
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="desc" id="desc" />
                    <Label htmlFor="desc" className="flex items-center gap-1">
                      <ArrowDownIcon className="h-4 w-4" />
                      DESC
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Filters */}
            <div className="space-y-4">
              <Label>Filters</Label>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm">Product Line</Label>
                  <Select
                    value={settings.productLineId || 'all'}
                    onValueChange={(value) => 
                      setSettings(prev => ({ 
                        ...prev, 
                        productLineId: value === 'all' ? null : value 
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product line" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Product Lines</SelectItem>
                      {productLines?.map((pl) => (
                        <SelectItem key={pl.id} value={pl.id}>
                          {pl.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm">Status</Label>
                  <Select
                    value={settings.status || 'all'}
                    onValueChange={(value) => 
                      setSettings(prev => ({ 
                        ...prev, 
                        status: value === 'all' ? null : value 
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="idea">Idea</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm">Height</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      value={settings.heightOperator || 'none'}
                      onValueChange={(value) => 
                        setSettings(prev => ({ 
                          ...prev, 
                          heightOperator: value === 'none' ? null : value as 'eq' | 'gt' | 'lt'
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Operator" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Any</SelectItem>
                        <SelectItem value="eq">Equal to</SelectItem>
                        <SelectItem value="gt">Greater than</SelectItem>
                        <SelectItem value="lt">Less than</SelectItem>
                      </SelectContent>
                    </Select>
                    <input
                      type="number"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Value (in)"
                      value={settings.heightValue || ''}
                      onChange={(e) => 
                        setSettings(prev => ({ 
                          ...prev, 
                          heightValue: e.target.value === '' ? null : Number(e.target.value)
                        }))
                      }
                      disabled={!settings.heightOperator}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-4 flex justify-end gap-4">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleApply}>
            Apply
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
