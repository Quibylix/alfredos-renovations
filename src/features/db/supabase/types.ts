export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      boss: {
        Row: {
          id: string
        }
        Insert: {
          id: string
        }
        Update: {
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "boss_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
      }
      employee: {
        Row: {
          id: string
        }
        Insert: {
          id: string
        }
        Update: {
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
      }
      message: {
        Row: {
          content: string
          id: number
          profile_id: string
          sent_date: string
          task_id: number
        }
        Insert: {
          content: string
          id?: number
          profile_id: string
          sent_date?: string
          task_id: number
        }
        Update: {
          content?: string
          id?: number
          profile_id?: string
          sent_date?: string
          task_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "message_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "task"
            referencedColumns: ["id"]
          },
        ]
      }
      message_media: {
        Row: {
          id: number
          message_id: number
          type: string
          url: string
        }
        Insert: {
          id?: number
          message_id: number
          type: string
          url: string
        }
        Update: {
          id?: number
          message_id?: number
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_media_progress_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "message"
            referencedColumns: ["id"]
          },
        ]
      }
      notification: {
        Row: {
          description: string
          id: number
          profile_id: string
          redirection_link: string
          title: string
        }
        Insert: {
          description: string
          id?: never
          profile_id: string
          redirection_link: string
          title: string
        }
        Update: {
          description?: string
          id?: never
          profile_id?: string
          redirection_link?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
      }
      profile: {
        Row: {
          full_name: string
          id: string
          registration_date: string | null
        }
        Insert: {
          full_name: string
          id: string
          registration_date?: string | null
        }
        Update: {
          full_name?: string
          id?: string
          registration_date?: string | null
        }
        Relationships: []
      }
      project: {
        Row: {
          id: number
          title: string
        }
        Insert: {
          id?: number
          title: string
        }
        Update: {
          id?: number
          title?: string
        }
        Relationships: []
      }
      task: {
        Row: {
          boss_id: string
          completed: boolean
          created_at: string
          description: string
          duration: number
          id: number
          project_id: number
          start_date: string
          title: string
        }
        Insert: {
          boss_id: string
          completed?: boolean
          created_at?: string
          description: string
          duration: number
          id?: number
          project_id: number
          start_date: string
          title: string
        }
        Update: {
          boss_id?: string
          completed?: boolean
          created_at?: string
          description?: string
          duration?: number
          id?: number
          project_id?: number
          start_date?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_boss_id_fkey"
            columns: ["boss_id"]
            isOneToOne: false
            referencedRelation: "boss"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
        ]
      }
      task_assignment: {
        Row: {
          created_at: string
          employee_id: string
          task_id: number
        }
        Insert: {
          created_at?: string
          employee_id: string
          task_id: number
        }
        Update: {
          created_at?: string
          employee_id?: string
          task_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "task_assignment_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_assignment_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "task"
            referencedColumns: ["id"]
          },
        ]
      }
      task_media: {
        Row: {
          created_at: string
          id: number
          task_id: number
          type: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: number
          task_id: number
          type: string
          url: string
        }
        Update: {
          created_at?: string
          id?: number
          task_id?: number
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_media_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "task"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_employee_progress: {
        Args: { e_id: string }
        Returns: {
          id: number
          title: string
          description: string
          image_url: string
          sent_date: string
          parent_id: number
          media: Json
          project: Json
          employee: Json
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

