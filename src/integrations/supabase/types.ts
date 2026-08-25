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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          address: string | null
          created_at: string
          customer_name: string
          email: string
          id: string
          items: Json
          notes: string | null
          phone: string | null
          status: Database["public"]["Enums"]["order_status"]
          total: number
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          customer_name: string
          email: string
          id?: string
          items?: Json
          notes?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total?: number
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          customer_name?: string
          email?: string
          id?: string
          items?: Json
          notes?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          brand: string
          color: string | null
          condition: Database["public"]["Enums"]["atv_condition"]
          created_at: string
          description: string | null
          engine_size: string | null
          id: string
          images: string[]
          is_available: boolean
          is_featured: boolean
          listing_status: Database["public"]["Enums"]["listing_status"]
          mileage: number | null
          model: string
          name: string
          price: number
          short_description: string | null
          slug: string
          specs: Json
          stock: number
          transmission: string | null
          type: Database["public"]["Enums"]["atv_type"]
          updated_at: string
          year: number | null
        }
        Insert: {
          brand?: string
          color?: string | null
          condition?: Database["public"]["Enums"]["atv_condition"]
          created_at?: string
          description?: string | null
          engine_size?: string | null
          id?: string
          images?: string[]
          is_available?: boolean
          is_featured?: boolean
          listing_status?: Database["public"]["Enums"]["listing_status"]
          mileage?: number | null
          model?: string
          name: string
          price?: number
          short_description?: string | null
          slug: string
          specs?: Json
          stock?: number
          transmission?: string | null
          type?: Database["public"]["Enums"]["atv_type"]
          updated_at?: string
          year?: number | null
        }
        Update: {
          brand?: string
          color?: string | null
          condition?: Database["public"]["Enums"]["atv_condition"]
          created_at?: string
          description?: string | null
          engine_size?: string | null
          id?: string
          images?: string[]
          is_available?: boolean
          is_featured?: boolean
          listing_status?: Database["public"]["Enums"]["listing_status"]
          mileage?: number | null
          model?: string
          name?: string
          price?: number
          short_description?: string | null
          slug?: string
          specs?: Json
          stock?: number
          transmission?: string | null
          type?: Database["public"]["Enums"]["atv_type"]
          updated_at?: string
          year?: number | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author_name: string
          avatar_url: string | null
          body: string
          created_at: string
          id: string
          product_id: string | null
          rating: number
        }
        Insert: {
          author_name: string
          avatar_url?: string | null
          body?: string
          created_at?: string
          id?: string
          product_id?: string | null
          rating?: number
        }
        Update: {
          author_name?: string
          avatar_url?: string | null
          body?: string
          created_at?: string
          id?: string
          product_id?: string | null
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
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
          role?: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      atv_condition: "new" | "used" | "certified_pre_owned"
      atv_type: "sport" | "utility" | "youth" | "side_by_side"
      listing_status: "available" | "reserved" | "sold"
      order_status: "pending" | "contacted" | "completed" | "cancelled"
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
      app_role: ["admin", "user"],
      atv_condition: ["new", "used", "certified_pre_owned"],
      atv_type: ["sport", "utility", "youth", "side_by_side"],
      listing_status: ["available", "reserved", "sold"],
      order_status: ["pending", "contacted", "completed", "cancelled"],
    },
  },
} as const
