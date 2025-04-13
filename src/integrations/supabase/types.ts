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
      address_settings: {
        Row: {
          created_at: string
          id: string
          receiver_address: string
          receiver_city: string
          receiver_country: string
          receiver_name: string
          receiver_postal_code: string
          sender_address: string
          sender_city: string
          sender_country: string
          sender_name: string
          sender_postal_code: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          receiver_address: string
          receiver_city: string
          receiver_country: string
          receiver_name: string
          receiver_postal_code: string
          sender_address: string
          sender_city: string
          sender_country: string
          sender_name: string
          sender_postal_code: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          receiver_address?: string
          receiver_city?: string
          receiver_country?: string
          receiver_name?: string
          receiver_postal_code?: string
          sender_address?: string
          sender_city?: string
          sender_country?: string
          sender_name?: string
          sender_postal_code?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          new_data: Json | null
          old_data: Json | null
          shipment_id: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          shipment_id?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          shipment_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      carriers: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string
          id: string
          is_asendia: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_asendia?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_asendia?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      doe: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      eco_formats: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      formats: {
        Row: {
          created_at: string
          id: string
          name: string
          service_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          service_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          service_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "formats_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      prior_formats: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      s3c_formats: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      shipment_details: {
        Row: {
          created_at: string
          customer_id: string | null
          dispatch_number: string | null
          doe_id: string | null
          eco_format_id: string | null
          format_id: string | null
          gross_weight: number
          id: string
          net_weight: number | null
          number_of_bags: number
          number_of_pallets: number
          prior_format_id: string | null
          s3c_format_id: string | null
          service_id: string | null
          shipment_id: string
          tare_weight: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          dispatch_number?: string | null
          doe_id?: string | null
          eco_format_id?: string | null
          format_id?: string | null
          gross_weight: number
          id?: string
          net_weight?: number | null
          number_of_bags?: number
          number_of_pallets?: number
          prior_format_id?: string | null
          s3c_format_id?: string | null
          service_id?: string | null
          shipment_id: string
          tare_weight?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          dispatch_number?: string | null
          doe_id?: string | null
          eco_format_id?: string | null
          format_id?: string | null
          gross_weight?: number
          id?: string
          net_weight?: number | null
          number_of_bags?: number
          number_of_pallets?: number
          prior_format_id?: string | null
          s3c_format_id?: string | null
          service_id?: string | null
          shipment_id?: string
          tare_weight?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipment_details_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipment_details_doe_id_fkey"
            columns: ["doe_id"]
            isOneToOne: false
            referencedRelation: "doe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipment_details_eco_format_id_fkey"
            columns: ["eco_format_id"]
            isOneToOne: false
            referencedRelation: "eco_formats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipment_details_format_id_fkey"
            columns: ["format_id"]
            isOneToOne: false
            referencedRelation: "formats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipment_details_prior_format_id_fkey"
            columns: ["prior_format_id"]
            isOneToOne: false
            referencedRelation: "prior_formats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipment_details_s3c_format_id_fkey"
            columns: ["s3c_format_id"]
            isOneToOne: false
            referencedRelation: "s3c_formats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipment_details_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipment_details_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          arrival_date: string
          carrier_id: string | null
          created_at: string
          created_by: string
          departure_date: string
          driver_name: string
          id: string
          seal_no: string | null
          status: string
          subcarrier_id: string | null
          trailer_reg_no: string | null
          truck_reg_no: string | null
          updated_at: string
        }
        Insert: {
          arrival_date: string
          carrier_id?: string | null
          created_at?: string
          created_by: string
          departure_date: string
          driver_name: string
          id?: string
          seal_no?: string | null
          status?: string
          subcarrier_id?: string | null
          trailer_reg_no?: string | null
          truck_reg_no?: string | null
          updated_at?: string
        }
        Update: {
          arrival_date?: string
          carrier_id?: string | null
          created_at?: string
          created_by?: string
          departure_date?: string
          driver_name?: string
          id?: string
          seal_no?: string | null
          status?: string
          subcarrier_id?: string | null
          trailer_reg_no?: string | null
          truck_reg_no?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipments_carrier_id_fkey"
            columns: ["carrier_id"]
            isOneToOne: false
            referencedRelation: "carriers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_subcarrier_id_fkey"
            columns: ["subcarrier_id"]
            isOneToOne: false
            referencedRelation: "subcarriers"
            referencedColumns: ["id"]
          },
        ]
      }
      subcarriers: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
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
          user_id: string
          required_role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "manager", "user"],
    },
  },
} as const
