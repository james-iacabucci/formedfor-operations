export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          attachments: Json[] | null
          content: string
          created_at: string
          edited_at: string | null
          id: string
          mentions: Json[] | null
          reactions: Json[] | null
          thread_id: string
          user_id: string
        }
        Insert: {
          attachments?: Json[] | null
          content: string
          created_at?: string
          edited_at?: string | null
          id?: string
          mentions?: Json[] | null
          reactions?: Json[] | null
          thread_id: string
          user_id: string
        }
        Update: {
          attachments?: Json[] | null
          content?: string
          created_at?: string
          edited_at?: string | null
          id?: string
          mentions?: Json[] | null
          reactions?: Json[] | null
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "chat_threads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_thread_participants: {
        Row: {
          can_view: boolean
          can_write: boolean
          created_at: string
          thread_id: string
          user_id: string
        }
        Insert: {
          can_view?: boolean
          can_write?: boolean
          created_at?: string
          thread_id: string
          user_id: string
        }
        Update: {
          can_view?: boolean
          can_write?: boolean
          created_at?: string
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_thread_participants_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "chat_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_threads: {
        Row: {
          created_at: string
          fabrication_quote_id: string | null
          id: string
          sculpture_id: string
          topic: Database["public"]["Enums"]["chat_topic"] | null
          user_id: string | null
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          fabrication_quote_id?: string | null
          id?: string
          sculpture_id: string
          topic?: Database["public"]["Enums"]["chat_topic"] | null
          user_id?: string | null
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          fabrication_quote_id?: string | null
          id?: string
          sculpture_id?: string
          topic?: Database["public"]["Enums"]["chat_topic"] | null
          user_id?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_threads_fabrication_quote_id_fkey"
            columns: ["fabrication_quote_id"]
            isOneToOne: false
            referencedRelation: "fabrication_quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_threads_sculpture_id_fkey"
            columns: ["sculpture_id"]
            isOneToOne: false
            referencedRelation: "sculptures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_threads_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "sculpture_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      fabrication_quotes: {
        Row: {
          base_depth_cm: number | null
          base_depth_in: number | null
          base_height_cm: number | null
          base_height_in: number | null
          base_material_id: string | null
          base_method_id: string | null
          base_weight_kg: number | null
          base_weight_lbs: number | null
          base_width_cm: number | null
          base_width_in: number | null
          created_at: string
          customs_cost: number | null
          depth_cm: number | null
          depth_in: number | null
          fabrication_cost: number | null
          fabricator_id: string
          height_cm: number | null
          height_in: number | null
          id: string
          is_selected: boolean | null
          markup: number
          material_id: string | null
          method_id: string | null
          notes: string | null
          other_cost: number | null
          quote_date: string
          sculpture_id: string
          shipping_cost: number | null
          status: string
          variant_id: string | null
          weight_kg: number | null
          weight_lbs: number | null
          width_cm: number | null
          width_in: number | null
        }
        Insert: {
          base_depth_cm?: number | null
          base_depth_in?: number | null
          base_height_cm?: number | null
          base_height_in?: number | null
          base_material_id?: string | null
          base_method_id?: string | null
          base_weight_kg?: number | null
          base_weight_lbs?: number | null
          base_width_cm?: number | null
          base_width_in?: number | null
          created_at?: string
          customs_cost?: number | null
          depth_cm?: number | null
          depth_in?: number | null
          fabrication_cost?: number | null
          fabricator_id: string
          height_cm?: number | null
          height_in?: number | null
          id?: string
          is_selected?: boolean | null
          markup?: number
          material_id?: string | null
          method_id?: string | null
          notes?: string | null
          other_cost?: number | null
          quote_date?: string
          sculpture_id: string
          shipping_cost?: number | null
          status?: string
          variant_id?: string | null
          weight_kg?: number | null
          weight_lbs?: number | null
          width_cm?: number | null
          width_in?: number | null
        }
        Update: {
          base_depth_cm?: number | null
          base_depth_in?: number | null
          base_height_cm?: number | null
          base_height_in?: number | null
          base_material_id?: string | null
          base_method_id?: string | null
          base_weight_kg?: number | null
          base_weight_lbs?: number | null
          base_width_cm?: number | null
          base_width_in?: number | null
          created_at?: string
          customs_cost?: number | null
          depth_cm?: number | null
          depth_in?: number | null
          fabrication_cost?: number | null
          fabricator_id?: string
          height_cm?: number | null
          height_in?: number | null
          id?: string
          is_selected?: boolean | null
          markup?: number
          material_id?: string | null
          method_id?: string | null
          notes?: string | null
          other_cost?: number | null
          quote_date?: string
          sculpture_id?: string
          shipping_cost?: number | null
          status?: string
          variant_id?: string | null
          weight_kg?: number | null
          weight_lbs?: number | null
          width_cm?: number | null
          width_in?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fabrication_quotes_base_material_id_fkey"
            columns: ["base_material_id"]
            isOneToOne: false
            referencedRelation: "value_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fabrication_quotes_base_method_id_fkey"
            columns: ["base_method_id"]
            isOneToOne: false
            referencedRelation: "value_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fabrication_quotes_fabricator_id_fkey"
            columns: ["fabricator_id"]
            isOneToOne: false
            referencedRelation: "value_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fabrication_quotes_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "value_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fabrication_quotes_method_id_fkey"
            columns: ["method_id"]
            isOneToOne: false
            referencedRelation: "value_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fabrication_quotes_sculpture_id_fkey"
            columns: ["sculpture_id"]
            isOneToOne: false
            referencedRelation: "sculptures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fabrication_quotes_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "sculpture_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      import_batches: {
        Row: {
          completed_at: string | null
          created_at: string | null
          created_by: string
          failed_rows: number | null
          file_name: string | null
          id: string
          status: string | null
          successful_rows: number | null
          total_rows: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          created_by: string
          failed_rows?: number | null
          file_name?: string | null
          id?: string
          status?: string | null
          successful_rows?: number | null
          total_rows?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string
          failed_rows?: number | null
          file_name?: string | null
          id?: string
          status?: string | null
          successful_rows?: number | null
          total_rows?: number | null
        }
        Relationships: []
      }
      import_logs: {
        Row: {
          batch_id: string
          created_at: string | null
          id: string
          level: string
          message: string
          row_data: Json | null
          row_number: number | null
          timestamp: string | null
        }
        Insert: {
          batch_id: string
          created_at?: string | null
          id?: string
          level: string
          message: string
          row_data?: Json | null
          row_number?: number | null
          timestamp?: string | null
        }
        Update: {
          batch_id?: string
          created_at?: string | null
          id?: string
          level?: string
          message?: string
          row_data?: Json | null
          row_number?: number | null
          timestamp?: string | null
        }
        Relationships: []
      }
      product_lines: {
        Row: {
          address: string | null
          black_logo_url: string | null
          contact_email: string | null
          created_at: string
          id: string
          name: string
          product_line_code: string | null
          white_logo_url: string | null
        }
        Insert: {
          address?: string | null
          black_logo_url?: string | null
          contact_email?: string | null
          created_at?: string
          id?: string
          name: string
          product_line_code?: string | null
          white_logo_url?: string | null
        }
        Update: {
          address?: string | null
          black_logo_url?: string | null
          contact_email?: string | null
          created_at?: string
          id?: string
          name?: string
          product_line_code?: string | null
          white_logo_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          phone: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          phone?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          phone?: string | null
          username?: string | null
        }
        Relationships: []
      }
      sculpture_tags: {
        Row: {
          created_at: string
          sculpture_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          sculpture_id: string
          tag_id: string
        }
        Update: {
          created_at?: string
          sculpture_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sculpture_tags_sculpture_id_fkey"
            columns: ["sculpture_id"]
            isOneToOne: false
            referencedRelation: "sculptures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sculpture_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      sculpture_variants: {
        Row: {
          base_depth_in: number | null
          base_height_in: number | null
          base_material_id: string | null
          base_method_id: string | null
          base_weight_kg: number | null
          base_weight_lbs: number | null
          base_width_in: number | null
          created_at: string
          depth_in: number | null
          height_in: number | null
          id: string
          is_archived: boolean
          material_id: string | null
          method_id: string | null
          order_index: number
          sculpture_id: string
          weight_kg: number | null
          weight_lbs: number | null
          width_in: number | null
        }
        Insert: {
          base_depth_in?: number | null
          base_height_in?: number | null
          base_material_id?: string | null
          base_method_id?: string | null
          base_weight_kg?: number | null
          base_weight_lbs?: number | null
          base_width_in?: number | null
          created_at?: string
          depth_in?: number | null
          height_in?: number | null
          id?: string
          is_archived?: boolean
          material_id?: string | null
          method_id?: string | null
          order_index?: number
          sculpture_id: string
          weight_kg?: number | null
          weight_lbs?: number | null
          width_in?: number | null
        }
        Update: {
          base_depth_in?: number | null
          base_height_in?: number | null
          base_material_id?: string | null
          base_method_id?: string | null
          base_weight_kg?: number | null
          base_weight_lbs?: number | null
          base_width_in?: number | null
          created_at?: string
          depth_in?: number | null
          height_in?: number | null
          id?: string
          is_archived?: boolean
          material_id?: string | null
          method_id?: string | null
          order_index?: number
          sculpture_id?: string
          weight_kg?: number | null
          weight_lbs?: number | null
          width_in?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sculpture_variants_base_material_id_fkey"
            columns: ["base_material_id"]
            isOneToOne: false
            referencedRelation: "value_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sculpture_variants_base_method_id_fkey"
            columns: ["base_method_id"]
            isOneToOne: false
            referencedRelation: "value_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sculpture_variants_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "value_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sculpture_variants_method_id_fkey"
            columns: ["method_id"]
            isOneToOne: false
            referencedRelation: "value_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sculpture_variants_sculpture_id_fkey"
            columns: ["sculpture_id"]
            isOneToOne: false
            referencedRelation: "sculptures"
            referencedColumns: ["id"]
          },
        ]
      }
      sculptures: {
        Row: {
          ai_description: string | null
          ai_engine: string
          ai_generated_name: string | null
          base_depth_cm: number | null
          base_depth_in: number | null
          base_height_cm: number | null
          base_height_in: number | null
          base_material_id: string | null
          base_method_id: string | null
          base_weight_kg: number | null
          base_weight_lbs: number | null
          base_width_cm: number | null
          base_width_in: number | null
          created_at: string
          created_by: string
          creativity_level: string | null
          depth_cm: number | null
          depth_in: number | null
          dimensions: Json | null
          height_cm: number | null
          height_in: number | null
          id: string
          image_url: string | null
          import_batch_id: string | null
          import_metadata: Json | null
          import_source: string | null
          is_manual: boolean | null
          last_import_date: string | null
          manual_description: string | null
          manual_name: string | null
          material_id: string | null
          method_id: string | null
          models: Json | null
          original_sculpture_id: string | null
          product_line_id: string | null
          prompt: string
          renderings: Json | null
          status: string | null
          weight_kg: number | null
          weight_lbs: number | null
          width_cm: number | null
          width_in: number | null
        }
        Insert: {
          ai_description?: string | null
          ai_engine?: string
          ai_generated_name?: string | null
          base_depth_cm?: number | null
          base_depth_in?: number | null
          base_height_cm?: number | null
          base_height_in?: number | null
          base_material_id?: string | null
          base_method_id?: string | null
          base_weight_kg?: number | null
          base_weight_lbs?: number | null
          base_width_cm?: number | null
          base_width_in?: number | null
          created_at?: string
          created_by: string
          creativity_level?: string | null
          depth_cm?: number | null
          depth_in?: number | null
          dimensions?: Json | null
          height_cm?: number | null
          height_in?: number | null
          id?: string
          image_url?: string | null
          import_batch_id?: string | null
          import_metadata?: Json | null
          import_source?: string | null
          is_manual?: boolean | null
          last_import_date?: string | null
          manual_description?: string | null
          manual_name?: string | null
          material_id?: string | null
          method_id?: string | null
          models?: Json | null
          original_sculpture_id?: string | null
          product_line_id?: string | null
          prompt: string
          renderings?: Json | null
          status?: string | null
          weight_kg?: number | null
          weight_lbs?: number | null
          width_cm?: number | null
          width_in?: number | null
        }
        Update: {
          ai_description?: string | null
          ai_engine?: string
          ai_generated_name?: string | null
          base_depth_cm?: number | null
          base_depth_in?: number | null
          base_height_cm?: number | null
          base_height_in?: number | null
          base_material_id?: string | null
          base_method_id?: string | null
          base_weight_kg?: number | null
          base_weight_lbs?: number | null
          base_width_cm?: number | null
          base_width_in?: number | null
          created_at?: string
          created_by?: string
          creativity_level?: string | null
          depth_cm?: number | null
          depth_in?: number | null
          dimensions?: Json | null
          height_cm?: number | null
          height_in?: number | null
          id?: string
          image_url?: string | null
          import_batch_id?: string | null
          import_metadata?: Json | null
          import_source?: string | null
          is_manual?: boolean | null
          last_import_date?: string | null
          manual_description?: string | null
          manual_name?: string | null
          material_id?: string | null
          method_id?: string | null
          models?: Json | null
          original_sculpture_id?: string | null
          product_line_id?: string | null
          prompt?: string
          renderings?: Json | null
          status?: string | null
          weight_kg?: number | null
          weight_lbs?: number | null
          width_cm?: number | null
          width_in?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sculptures_base_material_id_fkey"
            columns: ["base_material_id"]
            isOneToOne: false
            referencedRelation: "value_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sculptures_base_method_id_fkey"
            columns: ["base_method_id"]
            isOneToOne: false
            referencedRelation: "value_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sculptures_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "value_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sculptures_method_id_fkey"
            columns: ["method_id"]
            isOneToOne: false
            referencedRelation: "value_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sculptures_original_sculpture_id_fkey"
            columns: ["original_sculpture_id"]
            isOneToOne: false
            referencedRelation: "sculptures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sculptures_product_line_id_fkey"
            columns: ["product_line_id"]
            isOneToOne: false
            referencedRelation: "product_lines"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          attachments: Json | null
          category_name: string | null
          client_id: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          lead_id: string | null
          order_id: string | null
          priority_order: number
          product_line_id: string | null
          related_type: string | null
          sculpture_id: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          attachments?: Json | null
          category_name?: string | null
          client_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          lead_id?: string | null
          order_id?: string | null
          priority_order?: number
          product_line_id?: string | null
          related_type?: string | null
          sculpture_id?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          attachments?: Json | null
          category_name?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          lead_id?: string | null
          order_id?: string | null
          priority_order?: number
          product_line_id?: string | null
          related_type?: string | null
          sculpture_id?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_product_line_id_fkey"
            columns: ["product_line_id"]
            isOneToOne: false
            referencedRelation: "product_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_sculpture_id_fkey"
            columns: ["sculpture_id"]
            isOneToOne: false
            referencedRelation: "sculptures"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string
          id: string
          settings: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          settings?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          settings?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      value_lists: {
        Row: {
          code: string | null
          created_at: string
          id: string
          name: string
          type: Database["public"]["Enums"]["value_list_type"]
        }
        Insert: {
          code?: string | null
          created_at?: string
          id?: string
          name: string
          type: Database["public"]["Enums"]["value_list_type"]
        }
        Update: {
          code?: string | null
          created_at?: string
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["value_list_type"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_next_priority_order: {
        Args: { p_entity_id: string; p_related_type: string }
        Returns: number
      }
      get_user_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      update_message_reactions: {
        Args: { message_id: string; reaction_data: Json[] }
        Returns: undefined
      }
      update_task_priorities: {
        Args: {
          p_adjustment: number
          p_end_order: number
          p_sculpture_id: string
          p_start_order: number
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "sales" | "fabrication" | "orders"
      chat_topic: "pricing" | "fabrication" | "operations" | "general"
      value_list_type:
        | "finish"
        | "material"
        | "fabricator"
        | "texture"
        | "method"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "sales", "fabrication", "orders"],
      chat_topic: ["pricing", "fabrication", "operations", "general"],
      value_list_type: [
        "finish",
        "material",
        "fabricator",
        "texture",
        "method",
      ],
    },
  },
} as const
