
import { useState, useRef } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTagsManagement } from "@/components/tags/useTagsManagement";

interface ViewSettings {
  sortBy: 'created_at' | 'ai_generated_name' | 'updated_at';
  sortOrder: 'asc' | 'desc';
  productLineId: string | null;
  materialIds: string[];
  status: string | null;
  heightOperator: 'eq' | 'gt' | 'lt' | null;
  heightValue: number | null;
  heightUnit: 'in' | 'cm';
  selectedTagIds: string[];
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
  const [settings, setSettings] = useState<ViewSettings>({ 
    ...initialSettings,
    heightUnit: initialSettings.heightUnit || 'in' // Default to inches if not set
  });
  const { tags } = useTagsManagement(undefined);
  const heightValueInputRef = useRef<HTMLInputElement>(null);

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

  const handleTagSelection = (tagId: string, checked: boolean) => {
    if (tagId === 'all') {
      setSettings(prev => ({
        ...prev,
        selectedTagIds: checked ? ['all'] : []
      }));
    } else {
      setSettings(prev => {
        const newSelectedTags = checked
          ? [...prev.selectedTagIds.filter(id => id !== 'all'), tagId]
          : prev.selectedTagIds.filter(id => id !== tagId);
        return {
          ...prev,
          selectedTagIds: newSelectedTags
        };
      });
    }
  };

  const handleProductLineSelection = (productLineId: string, checked: boolean) => {
    if (productLineId === 'all') {
      setSettings(prev => ({
        ...prev,
        productLineId: checked ? null : undefined
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        productLineId: checked ? productLineId : null
      }));
    }
  };

  const handleStatusSelection = (status: string, checked: boolean) => {
    if (status === 'all') {
      setSettings(prev => ({
        ...prev,
        status: checked ? null : undefined
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        status: checked ? status : null
      }));
    }
  };

  const handleApply = () => {
    onApply(settings);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSettings({ ...initialSettings });
    onOpenChange(false);
  };

  const allTags = [
    { id: 'all', name: 'All Sculptures' },
    ...(tags || [])
  ];

  const allProductLines = [
    { id: 'all', name: 'All Product Lines' },
    ...(productLines || [])
  ];

  const allStatuses = [
    { id: 'all', name: 'All Statuses' },
    { id: 'idea', name: 'Idea' },
    { id: 'pending', name: 'Pending' },
    { id: 'approved', name: 'Approved' },
    { id: 'archived', name: 'Archived' }
  ];

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
              <div className="flex gap-2 items-center">
                <Select
                  value={settings.sortBy}
                  onValueChange={(value: ViewSettings['sortBy']) => 
                    setSettings(prev => ({ ...prev, sortBy: value }))
                  }
                >
                  <SelectTrigger className="w-full focus:ring-0 focus:ring-offset-0">
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at">Creation Date</SelectItem>
                    <SelectItem value="ai_generated_name">Sculpture Name</SelectItem>
                    <SelectItem value="updated_at">Last Modified</SelectItem>
                  </SelectContent>
                </Select>

                <Tabs
                  value={settings.sortOrder}
                  onValueChange={(value: 'asc' | 'desc') => 
                    setSettings(prev => ({ ...prev, sortOrder: value }))
                  }
                  className="w-[120px]"
                >
                  <TabsList className="w-full h-9">
                    <TabsTrigger value="asc" className="flex-1 text-xs px-2">ASC</TabsTrigger>
                    <TabsTrigger value="desc" className="flex-1 text-xs px-2">DESC</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {/* Product Lines */}
            <div className="space-y-4">
              <Label>Product Line</Label>
              <div className="space-y-2">
                {allProductLines.map((pl) => (
                  <div key={pl.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`pl-${pl.id}`}
                      checked={pl.id === 'all' ? settings.productLineId === null : settings.productLineId === pl.id}
                      onCheckedChange={(checked) => 
                        handleProductLineSelection(pl.id, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`pl-${pl.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {pl.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="space-y-4">
              <Label>Status</Label>
              <div className="space-y-2">
                {allStatuses.map((status) => (
                  <div key={status.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status.id}`}
                      checked={status.id === 'all' ? settings.status === null : settings.status === status.id}
                      onCheckedChange={(checked) => 
                        handleStatusSelection(status.id, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`status-${status.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {status.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-4">
              <Label>Tags</Label>
              <div className="space-y-2">
                {allTags.map((tag) => (
                  <div key={tag.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tag-${tag.id}`}
                      checked={settings.selectedTagIds.includes(tag.id)}
                      onCheckedChange={(checked) => 
                        handleTagSelection(tag.id, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`tag-${tag.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {tag.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Height Filter */}
            <div className="space-y-4">
              <Label>Height</Label>
              <div className="flex gap-2 items-start">
                <Select
                  value={settings.heightOperator || 'none'}
                  onValueChange={(value) => {
                    setSettings(prev => ({ 
                      ...prev, 
                      heightOperator: value === 'none' ? null : value as 'eq' | 'gt' | 'lt'
                    }));
                    // Focus on the value input when an operator is selected
                    if (value !== 'none' && heightValueInputRef.current) {
                      setTimeout(() => {
                        heightValueInputRef.current?.focus();
                      }, 0);
                    }
                  }}
                >
                  <SelectTrigger className="w-[140px] focus:ring-0 focus:ring-offset-0">
                    <SelectValue placeholder="Operator" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Any</SelectItem>
                    <SelectItem value="eq">Equal to</SelectItem>
                    <SelectItem value="gt">Greater than</SelectItem>
                    <SelectItem value="lt">Less than</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-2 items-center flex-1">
                  <input
                    ref={heightValueInputRef}
                    type="number"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Value"
                    value={settings.heightValue || ''}
                    onChange={(e) => 
                      setSettings(prev => ({ 
                        ...prev, 
                        heightValue: e.target.value === '' ? null : Number(e.target.value)
                      }))
                    }
                    disabled={!settings.heightOperator}
                  />
                  
                  <Tabs
                    value={settings.heightUnit}
                    onValueChange={(value: 'in' | 'cm') => 
                      setSettings(prev => ({ ...prev, heightUnit: value }))
                    }
                    className="w-[100px]"
                  >
                    <TabsList className="w-full h-9">
                      <TabsTrigger value="in" className="flex-1 text-xs px-2">IN</TabsTrigger>
                      <TabsTrigger value="cm" className="flex-1 text-xs px-2">CM</TabsTrigger>
                    </TabsList>
                  </Tabs>
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
