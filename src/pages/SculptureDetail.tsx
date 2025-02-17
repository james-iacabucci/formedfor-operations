
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
  ChevronDownIcon,
  FileIcon,
  ImageIcon,
  Trash2Icon
} from "lucide-react";
import { UserMenu } from "@/components/UserMenu";
import { useState } from "react";
import { CreateSculptureSheet } from "@/components/CreateSculptureSheet";
import { AddSculptureSheet } from "@/components/AddSculptureSheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

export default function SculptureDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const { toast } = useToast();

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

  const handleDownloadImage = () => {
    if (sculpture?.image_url) {
      const link = document.createElement("a");
      link.href = sculpture.image_url;
      link.download = `${sculpture.ai_generated_name || 'sculpture'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: "Download started",
        description: "Your image download has started.",
      });
    }
  };

  const handleDownloadPDF = () => {
    if (sculpture) {
      const link = document.createElement("a");
      link.href = `/sculpture-spec/${sculpture.id}.pdf`;
      link.download = `${sculpture.ai_generated_name || 'sculpture'}-spec.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: "Download started",
        description: "Your spec sheet download has started.",
      });
    }
  };

  const handleDelete = () => {
    if (sculpture) {
      const deleteDialog = document.getElementById(`delete-sculpture-${sculpture.id}`);
      if (deleteDialog instanceof HTMLDialogElement) {
        deleteDialog.showModal();
      }
    }
  };

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
            variant="ghost"
            className="flex items-center gap-2"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sculptures
          </Button>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <FileIcon className="h-4 w-4" />
                  Download
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleDownloadImage}>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Sculpture Image
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadPDF}>
                  <FileIcon className="h-4 w-4 mr-2" />
                  Sculpture Spec Sheet
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              variant="outline" 
              className="gap-2" 
              onClick={handleDelete}
            >
              <Trash2Icon className="h-4 w-4" />
              Delete
            </Button>
          </div>
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
