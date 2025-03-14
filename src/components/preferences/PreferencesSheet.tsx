
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { User } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/sculpture/ImageUpload";
import { toast } from "sonner";
import { useAuth } from "../AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { AppearanceSection } from "./AppearanceSection";
import { useUserRoles } from "@/hooks/use-user-roles";
import { RoleManagement } from "../admin/RoleManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PreferencesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ProfileData {
  username: string | null;
  phone: string | null;
  avatar_url: string | null;
}

export function PreferencesSheet({ open, onOpenChange }: PreferencesSheetProps) {
  const { user } = useAuth();
  const { isAdmin } = useUserRoles();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    username: "",
    phone: "",
    avatar_url: ""
  });
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (open && user) {
      fetchProfile();
    }
  }, [open, user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url, phone')
        .eq('id', user?.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setProfileData({
          username: data.username,
          phone: data.phone,
          avatar_url: data.avatar_url
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error("Failed to load profile data");
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: profileData.username,
          phone: profileData.phone,
          avatar_url: profileData.avatar_url
        })
        .eq('id', user.id);

      if (error) throw error;
      toast.success("Profile updated successfully");
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      // Create storage bucket if it doesn't exist
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

      console.log('Attempting to upload file:', {
        fileName: file.name,
        fileType: file.type,
        filePath: filePath
      });

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('File uploaded successfully:', uploadData);

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log('Generated public URL:', publicUrl);

      setProfileData(prev => ({ ...prev, avatar_url: publicUrl }));
      toast.success("Profile picture uploaded successfully");
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("Failed to upload image");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl flex flex-col p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          <SheetHeader className="sticky top-0 z-10 bg-background px-6 py-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Preferences
            </SheetTitle>
            <SheetDescription className="sr-only">
              Manage your profile preferences
            </SheetDescription>
          </SheetHeader>
          
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <TabsList className="px-6 pt-2 justify-start border-b rounded-none">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              {isAdmin && <TabsTrigger value="roles">User Roles</TabsTrigger>}
            </TabsList>
            
            <div className="flex-1 overflow-y-auto px-6">
              <TabsContent value="profile" className="mt-0 py-6 h-full">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Profile</h3>
                  <div className="rounded-xl border border-muted p-6">
                    <div className="flex gap-6">
                      <div className="h-[108px] w-[108px]">
                        <ImageUpload 
                          previewUrl={profileData.avatar_url || null}
                          onFileChange={handleImageUpload}
                          className="hover:opacity-90 transition-opacity cursor-pointer"
                        />
                      </div>
                      <div className="flex-1 space-y-3">
                        <Input
                          id="name"
                          value={profileData.username || ""}
                          onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                          placeholder="Your name"
                          className="bg-muted/50 border-0 h-12 text-base placeholder:text-muted-foreground/50"
                        />
                        <Input
                          id="phone"
                          value={profileData.phone || ""}
                          onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Your phone number"
                          type="tel"
                          className="bg-muted/50 border-0 h-12 text-base placeholder:text-muted-foreground/50"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="appearance" className="mt-0 py-6 h-full">
                <AppearanceSection />
              </TabsContent>
              
              {isAdmin && (
                <TabsContent value="roles" className="mt-0 py-6 h-full">
                  <RoleManagement />
                </TabsContent>
              )}
            </div>
          </Tabs>

          <div className="sticky bottom-0 border-t bg-background px-6 py-4 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            {activeTab === "profile" && (
              <Button 
                onClick={handleSave}
                disabled={loading}
              >
                Save Changes
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
