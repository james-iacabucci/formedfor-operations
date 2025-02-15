
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface ValueList {
  id: string;
  type: 'finish' | 'material';
  code: string | null;
  name: string;
  created_at: string;
}

export function ValueListsSection() {
  const { data: valueLists, isLoading } = useQuery({
    queryKey: ['value-lists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('value_lists')
        .select('*')
        .order('type')
        .order('code', { nullsLast: true })
        .order('name');
      
      if (error) throw error;
      return data as ValueList[];
    }
  });

  const finishes = valueLists?.filter(item => item.type === 'finish') || [];
  const materials = valueLists?.filter(item => item.type === 'material') || [];

  if (isLoading) {
    return <div>Loading value lists...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Value Lists</h3>
        <p className="text-sm text-muted-foreground">
          Manage materials and finishes available for sculptures
        </p>
      </div>
      <Separator />

      <Tabs defaultValue="materials" className="w-full">
        <TabsList>
          <TabsTrigger value="materials">
            Materials
            <Badge variant="secondary" className="ml-2">
              {materials.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="finishes">
            Finishes
            <Badge variant="secondary" className="ml-2">
              {finishes.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="materials" className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Code</TableHead>
                <TableHead>Name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map((material) => (
                <TableRow key={material.id}>
                  <TableCell className="font-mono">{material.code}</TableCell>
                  <TableCell>{material.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="finishes" className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {finishes.map((finish) => (
                <TableRow key={finish.id}>
                  <TableCell>{finish.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
}
