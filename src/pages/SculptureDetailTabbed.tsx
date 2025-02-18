import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sculpture, FileUpload } from "@/types/sculpture";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  PlusIcon, 
  UploadIcon,
  LayoutIcon,
} from "lucide-react";
import { UserMenu } from "@/components/UserMenu";
import { useState } from "react";
import { CreateSculptureSheet } from "@/components/CreateSculptureSheet";
import { AddSculptureSheet } from "@/components/AddSculptureSheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SculptureHeader } from "@/components/sculpture/detail/SculptureHeader";
import { SculptureAttributes } from "@/components/sculpture/detail/SculptureAttributes";
import { SculptureFiles } from "@/components/sculpture/detail/SculptureFiles";
import { SculptureImage } from "@/components/sculpture/detail/SculptureImage";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { SculpturePreviewDialog } from "@/components/sculpture/SculpturePreviewDialog";
import { ImageUpload } from "@/components/sculpture/ImageUpload";
import { BaseDetails } from "@/components/sculpture/detail/BaseDetails";

export default function SculptureDetailTabbed() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: sculpture, isLoading: isLoadingSculpture } = useQuery({
    queryKey: ["sculpture", id],
    queryFn: async () => {
      console.log("Fetching sculpture details:", id);
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("No user found");
      if (!id) throw new Error("No sculpture ID provided");

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
    enabled: !!id, // Only run the query if we have an id
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
    enabled: !!id, // Only run the query if we have an id
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
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
        <div className="flex items-center justify-between mb-6">
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
            onClick={() => navigate(`/sculpture/${id}`)}
          >
            <LayoutIcon className="h-4 w-4" />
            Switch to Regular View
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-4 md:col-span-1">
            <div className="w-full cursor-pointer" onClick={() => setIsImagePreviewOpen(true)}>
              <AspectRatio ratio={1}>
                <SculptureImage
                  imageUrl={sculpture.image_url || ""}
                  prompt={sculpture.prompt}
                  isRegenerating={false}
                  onManageTags={() => {}}
                  onRegenerate={() => {}}
                />
              </AspectRatio>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <ImageUpload
                previewUrl={null}
                onFileChange={handleFileChange}
              />
            </div>
          </div>

          <div className="md:col-span-3">
            <Tabs defaultValue="details" className="w-full">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{sculpture.ai_generated_name || "Untitled Sculpture"}</h2>
                </div>
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="attachments">Attachments</TabsTrigger>
                  <TabsTrigger value="comments">Comments</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="details">
                <div className="space-y-8">
                  <p className="text-muted-foreground">{sculpture.ai_description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">Sculpture Details</h3>
                      <SculptureAttributes
                        sculpture={sculpture}
                        originalSculpture={originalSculpture}
                        tags={tags || []}
                        hideHeaderInfo
                      />
                    </div>
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">Base Details</h3>
                      <BaseDetails
                        sculptureId={sculpture.id}
                        sculpture={sculpture}
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Fabrication Quotes</h3>
                    <div className="text-muted-foreground italic">Fabrication quotes coming soon...</div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">AI Attributes</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium">Prompt</h4>
                        <p className="text-muted-foreground">{sculpture.prompt}</p>
                      </div>
                      {sculpture.creativity_level && (
                        <div>
                          <h4 className="text-sm font-medium">Variation Type</h4>
                          <p className="text-muted-foreground capitalize">{sculpture.creativity_level}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="attachments">
                <SculptureFiles
                  sculptureId={sculpture.id}
                  models={sculpture.models}
                  renderings={sculpture.renderings}
                  dimensions={sculpture.dimensions}
                />
              </TabsContent>

              <TabsContent value="comments">
                <div className="text-muted-foreground italic">
                  Comments feature coming soon...
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <CreateSculptureSheet 
        open={isCreateSheetOpen} 
        onOpenChange={setIsCreateSheetOpen}
      />
      <AddSculptureSheet
        open={isAddSheetOpen}
        onOpenChange={setIsAddSheetOpen}
      />
      <SculpturePreviewDialog
        sculpture={sculpture}
        open={isImagePreviewOpen}
        onOpenChange={setIsImagePreviewOpen}
      />
    </div>
  );
}
