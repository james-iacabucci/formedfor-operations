
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProductLine } from "@/types/product-line";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
            <Label htmlFor="logo">Logo URL</Label>
            <Input
              id="logo"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="Enter logo URL"
            />
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
