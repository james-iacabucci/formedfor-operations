import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

type Sculpture = {
  id: string;
  prompt: string;
  image_url: string | null;
  created_at: string;
};

export function SculpturesList() {
  const { data: sculptures, isLoading } = useQuery({
    queryKey: ["sculptures"],
    queryFn: async () => {
      console.log("Fetching sculptures...");
      const { data, error } = await supabase
        .from("sculptures")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching sculptures:", error);
        throw error;
      }

      console.log("Fetched sculptures:", data);
      return data as Sculpture[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!sculptures?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No sculptures created yet. Try creating one above!
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Description</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sculptures.map((sculpture) => (
          <TableRow key={sculpture.id}>
            <TableCell className="font-medium">{sculpture.prompt}</TableCell>
            <TableCell>
              {format(new Date(sculpture.created_at), "MMM d, yyyy")}
            </TableCell>
            <TableCell>
              {sculpture.image_url ? (
                <span className="text-green-600">Generated</span>
              ) : (
                <span className="text-yellow-600">Pending</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}