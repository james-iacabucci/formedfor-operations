
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SculptureDetailContent } from "@/components/sculpture/detail/SculptureDetailContent";
import { Sculpture, FileUpload } from "@/types/sculpture";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  PlusIcon, 
  UploadIcon,
  LayoutTemplateIcon,
} from "lucide-react";
import { UserMenu } from "@/components/UserMenu";
import { useState } from "react";
import { CreateSculptureSheet } from "@/components/CreateSculptureSheet";
import { AddSculptureSheet } from "@/components/AddSculptureSheet";

export default function SculptureDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);

  const { data: sculpture, isLoading: isLoadingSculpture } = useQuery({
    queryKey: ["sculpture", id],
    queryFn: async () => {
      console.log("Fetching sculpture details:", id);
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("sculptures")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      
      const validatedData: Sculpture = {
        ...data,
        models: Array.isArray(data.models) ? data.models as FileUpload[] : [],
        renderings: Array.isArray(data.renderings) ? data.renderings as FileUpload[] : [],
        dimensions: Array.isArray(data.dimensions) ? data.dimensions as FileUpload[] : [],
        status: (data.status || 'idea') as "idea" | "pending" | "approved" | "archived",
        ai_engine: data.ai_engine as "runware" | "manual",
        creativity_level: data.creativity_level as Sculpture["creativity_level"],
        product_line_id: data.product_line_id
      };
      
      console.log("Fetched sculpture:", validatedData);
      return validatedData;
    },
  });

  const { data: originalSculpture } = useQuery({
    queryKey: ["sculpture", sculpture?.original_sculpture_id],
    enabled: !!sculpture?.original_sculpture_id,
    queryFn: async () => {
      console.log("Fetching original sculpture:", sculpture?.original_sculpture_id);
      const { data, error } = await supabase
        .from("sculptures")
        .select("*")
        .eq("id", sculpture.original_sculpture_id)
        .single();

      if (error) throw error;

      const validatedData: Sculpture = {
        ...data,
        models: Array.isArray(data.models) ? data.models as FileUpload[] : [],
        renderings: Array.isArray(data.renderings) ? data.renderings as FileUpload[] : [],
        dimensions: Array.isArray(data.dimensions) ? data.dimensions as FileUpload[] : [],
        status: (data.status || 'idea') as "idea" | "pending" | "approved",
        ai_engine: data.ai_engine as "runware" | "manual",
        creativity_level: data.creativity_level as Sculpture["creativity_level"],
        product_line_id: data.product_line_id
      };
      
      console.log("Fetched original sculpture:", validatedData);
      return validatedData;
    },
  });

  const { data: tags } = useQuery({
    queryKey: ["sculpture_tags", id],
    enabled: !!id,
    queryFn: async () => {
      console.log("Fetching sculpture tags");
      const { data, error } = await supabase
        .from("sculpture_tags")
        .select(`
          tag_id,
          tags (
            id,
            name
          )
        `)
        .eq("sculpture_id", id);

      if (error) throw error;
      console.log("Fetched sculpture tags:", data);
      return data.map((st: any) => st.tags);
    },
  });

  if (isLoadingSculpture) {
    return <div>Loading...</div>;
  }

  if (!sculpture) {
    return <div>Sculpture not found</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="mx-auto max-w-7xl p-6">
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-2xl font-bold shrink-0">Sculptify</h1>
            <div className="flex items-center gap-4 ml-auto">
              <Button 
                onClick={() => setIsAddSheetOpen(true)}
                variant="outline"
                className="gap-2 shrink-0"
              >
                <UploadIcon className="h-4 w-4" />
                Add
              </Button>
              <Button 
                onClick={() => setIsCreateSheetOpen(true)}
                className="gap-2 shrink-0"
              >
                <PlusIcon className="h-4 w-4" />
                Create
              </Button>
              <UserMenu />
            </div>
          </div>
        </div>
      </div>
      
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sculptures
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => navigate(`/sculpture/${id}/tabs`)}
          >
            <LayoutTemplateIcon className="h-4 w-4" />
            Switch to Tabbed View
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl p-6">
        <SculptureDetailContent
          sculpture={sculpture}
          originalSculpture={originalSculpture}
          tags={tags || []}
        />
      </div>

      <CreateSculptureSheet 
        open={isCreateSheetOpen} 
        onOpenChange={setIsCreateSheetOpen}
      />
      <AddSculptureSheet
        open={isAddSheetOpen}
        onOpenChange={setIsAddSheetOpen}
      />
    </div>
  );
}
