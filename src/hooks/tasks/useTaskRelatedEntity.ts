
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TaskRelatedType } from "@/types/task";

export interface EntityOption {
  id: string;
  name: string;
}

export function useTaskRelatedEntity(
  open: boolean,
  relatedType: TaskRelatedType | string | null,
  initialEntityId?: string | null,
  initialCategoryName?: string | null
) {
  const [entityId, setEntityId] = useState<string | null>(initialEntityId || null);
  const [categoryName, setCategoryName] = useState<string | null>(initialCategoryName || null);
  const [categories, setCategories] = useState<string[]>([]);
  
  // Fetch available sculptures for the dropdown
  const { data: sculptures = [], isLoading: sculpturesLoading } = useQuery({
    queryKey: ["sculptures-minimal"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sculptures")
        .select("id, ai_generated_name")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching sculptures:", error);
        throw error;
      }
      
      return (data || []).map(s => ({
        id: s.id,
        name: s.ai_generated_name || "Unnamed Sculpture"
      })) as EntityOption[];
    },
    enabled: open && relatedType === "sculpture",
  });

  // Fetch available clients for the dropdown
  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ["clients-minimal"],
    queryFn: async () => {
      // This is a placeholder - replace with actual client data once available
      return [] as EntityOption[];
    },
    enabled: open && relatedType === "client",
  });

  // Fetch available leads for the dropdown
  const { data: leads = [], isLoading: leadsLoading } = useQuery({
    queryKey: ["leads-minimal"],
    queryFn: async () => {
      // This is a placeholder - replace with actual lead data once available
      return [] as EntityOption[];
    },
    enabled: open && relatedType === "lead",
  });

  // Fetch available orders for the dropdown
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["orders-minimal"],
    queryFn: async () => {
      // This is a placeholder - replace with actual order data once available
      return [] as EntityOption[];
    },
    enabled: open && relatedType === "order",
  });

  // Fetch available categories
  const { data: fetchedCategories = [] } = useQuery({
    queryKey: ["task-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("category_name")
        .not("category_name", "is", null)
        .order("category_name", { ascending: true });
      
      if (error) {
        console.error("Error fetching task categories:", error);
        throw error;
      }
      
      // Extract unique category names
      const uniqueCategories = [...new Set(
        (data || [])
          .map(task => task.category_name)
          .filter(Boolean) as string[]
      )];
      
      return uniqueCategories;
    },
    enabled: open && relatedType === "general",
  });

  // Set categories when fetched
  useEffect(() => {
    if (fetchedCategories.length > 0) {
      setCategories(fetchedCategories);
    }
  }, [fetchedCategories]);

  // Reset entity ID and category when related type changes
  useEffect(() => {
    if (relatedType === "general") {
      setEntityId(null);
      setCategoryName(initialCategoryName || null);
    } else {
      setCategoryName(null);
      setEntityId(initialEntityId || null);
    }
  }, [initialEntityId, initialCategoryName, relatedType]);

  const handleEntitySelection = (id: string) => {
    if (id === "none") {
      setEntityId(null);
    } else {
      setEntityId(id);
    }
  };

  const handleCategoryChange = (category: string) => {
    setCategoryName(category || null);
  };

  const addCategory = (newCategory: string) => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories(prev => [...prev, newCategory]);
      setCategoryName(newCategory);
    }
  };

  return {
    entityId,
    setEntityId,
    categoryName,
    setCategoryName,
    categories,
    addCategory,
    handleCategoryChange,
    sculptures,
    sculpturesLoading,
    clients,
    clientsLoading,
    leads,
    leadsLoading,
    orders,
    ordersLoading,
    handleEntitySelection
  };
}
