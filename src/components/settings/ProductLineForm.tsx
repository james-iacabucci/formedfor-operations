
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProductLine } from "@/types/product-line";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ImageIcon, X } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

interface ProductLineFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<ProductLine>) => Promise<void>;
  initialData?: ProductLine;
  title: string;
}

export function ProductLineForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  title,
}: ProductLineFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [name, setName] = useState(initialData?.name || "");
  const [contactEmail, setContactEmail] = useState(initialData?.contact_email || "");
  const [address, setAddress] = useState(initialData?.address || "");
  const [logoUrl, setLogoUrl] = useState(initialData?.logo_url || "");

  useEffect(() => {
    if (open && initialData) {
      setName(initialData.name);
      setContactEmail(initialData.contact_email || "");
      setAddress(initialData.address || "");
      setLogoUrl(initialData.logo_url || "");
    }
  }, [open, initialData]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    if (!user) {
      toast.error("You must be logged in to upload files");
      return;
    }

    try {
      setIsUploading(true);
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      // Add file size check
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error("File size must be less than 5MB");
        return;
      }

      const { error: uploadError, data } = await supabase.storage
        .from('product_line_logos')
        .upload(`${user.id}/${fileName}`, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error("Failed to upload logo. Please try again.");
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product_line_logos')
        .getPublicUrl(`${user.id}/${fileName}`);

      setLogoUrl(publicUrl);
      toast.success("Logo uploaded successfully");
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error("Failed to upload logo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to save changes");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit({
        name,
        contact_email: contactEmail,
        address,
        logo_url: logoUrl,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to save product line");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter product line name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Logo</Label>
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-lg border bg-muted">
                {logoUrl ? (
                  <>
                    <img
                      src={logoUrl}
                      alt="Product line logo"
                      className="h-full w-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-6 w-6 rounded-bl bg-background/80 p-0.5"
                      onClick={handleRemoveLogo}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={isUploading}
                  className="w-full"
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Contact Email</Label>
            <Input
              id="email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="Enter contact email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter address"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
