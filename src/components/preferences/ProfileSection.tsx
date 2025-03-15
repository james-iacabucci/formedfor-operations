
import { useState, useEffect } from "react";
import { ImageUpload } from "@/components/sculpture/ImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "../AuthProvider";
import { ProfileField } from "./ProfileField";
import { Skeleton } from "@/components/ui/skeleton";
import { AppRole } from "@/types/roles";

interface ProfileData {
  username: string | null;
  phone: string | null;
  avatar_url: string | null;
}

interface ProfileSectionProps {
  roleLoading: boolean;
  role: string;
}

export function ProfileSection({ roleLoading, role }: ProfileSectionProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    username: "",
    phone: "",
    avatar_url: ""
  });
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      console.log('Fetching profile data');
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url, phone')
        .eq('id', user?.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        console.log('Profile data fetched:', data);
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

  const saveProfileField = async (field: keyof ProfileData, value: string | null) => {
    if (!user) return;
    
    if (profileData[field] === value) return;
    
    setLoading(true);
    
    try {
      const updateData = { [field]: value };
      
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;
      
      setProfileData(prev => ({ ...prev, [field]: value }));
      
      toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully`);
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      toast.error(`Failed to update ${field}`);
      
      setProfileData(prev => ({ ...prev }));
    } finally {
      setLoading(false);
    }
  };

  const handleTextFieldChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    const timeout = setTimeout(() => {
      saveProfileField(field, value);
    }, 1000);
    
    setTypingTimeout(timeout);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setLoading(true);
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

      await saveProfileField('avatar_url', publicUrl);
      
      toast.success("Profile picture uploaded successfully");
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  const formatRole = (role: string) => {
    // Format each word in the role (e.g., "sales_manager" becomes "Sales Manager")
    if (!role) return '';
    
    return role.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Profile</h3>
      <div className="rounded-xl border border-muted p-6">
        <div className="flex gap-6">
          <div className="h-[108px] w-[108px]">
            <ImageUpload 
              previewUrl={profileData.avatar_url || null}
              onFileChange={handleImageUpload}
              className="hover:opacity-90 transition-opacity cursor-pointer"
              disabled={loading}
            />
          </div>
          <div className="flex-1 space-y-3">
            <ProfileField
              id="name"
              value={profileData.username || ""}
              onChange={(value) => handleTextFieldChange('username', value)}
              placeholder="Your name"
              disabled={loading}
            />
            <ProfileField
              id="phone"
              value={profileData.phone || ""}
              onChange={(value) => handleTextFieldChange('phone', value)}
              placeholder="Your phone number"
              type="tel"
              disabled={loading}
            />
          </div>
        </div>
                    
        <div className="mt-4 pt-4 border-t border-muted">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium mb-1">Role</label>
            {roleLoading ? (
              <Skeleton className="h-12 w-full" />
            ) : (
              <div className="bg-muted/50 border-0 rounded-md h-12 px-3 flex items-center text-base">
                {formatRole(role)}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Your system role determines what permissions you have. Contact an administrator to change this.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
