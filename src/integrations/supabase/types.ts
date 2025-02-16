export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      product_lines: {
        Row: {
          address: string | null
          contact_email: string | null
          created_at: string
          id: string
          logo_url: string | null
          name: string
          user_id: string
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          user_id: string
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_lines_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
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
      sculptures: {
        Row: {
          ai_description: string | null
          ai_engine: string
          ai_generated_name: string | null
          created_at: string
          creativity_level: string | null
          depth_cm: number | null
          depth_in: number | null
          dimensions: Json | null
          height_cm: number | null
          height_in: number | null
          id: string
          image_url: string | null
          is_manual: boolean | null
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
          user_id: string
          weight_kg: number | null
          weight_lbs: number | null
          width_cm: number | null
          width_in: number | null
        }
        Insert: {
          ai_description?: string | null
          ai_engine?: string
          ai_generated_name?: string | null
          created_at?: string
          creativity_level?: string | null
          depth_cm?: number | null
          depth_in?: number | null
          dimensions?: Json | null
          height_cm?: number | null
          height_in?: number | null
          id?: string
          image_url?: string | null
          is_manual?: boolean | null
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
          user_id: string
          weight_kg?: number | null
          weight_lbs?: number | null
          width_cm?: number | null
          width_in?: number | null
        }
        Update: {
          ai_description?: string | null
          ai_engine?: string
          ai_generated_name?: string | null
          created_at?: string
          creativity_level?: string | null
          depth_cm?: number | null
          depth_in?: number | null
          dimensions?: Json | null
          height_cm?: number | null
          height_in?: number | null
          id?: string
          image_url?: string | null
          is_manual?: boolean | null
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
          user_id?: string
          weight_kg?: number | null
          weight_lbs?: number | null
          width_cm?: number | null
          width_in?: number | null
        }
        Relationships: [
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
          {
            foreignKeyName: "sculptures_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      [_ in never]: never
    }
    Enums: {
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
