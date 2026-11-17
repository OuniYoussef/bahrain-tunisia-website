export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      moderation_log: {
        Row: {
          action: string;
          admin_id: string | null;
          created_at: string;
          id: number;
          note: string | null;
          report_id: string | null;
          story_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          action: string;
          admin_id?: string | null;
          created_at?: string;
          id?: never;
          note?: string | null;
          report_id?: string | null;
          story_id?: string | null;
        };
        Update: {
          action?: string;
          admin_id?: string | null;
          created_at?: string;
          id?: never;
          note?: string | null;
          report_id?: string | null;
          story_id?: string | null;
        };
        Relationships: [];
      };
      newsletter_subscribers: {
        Row: {
          consent_version: string;
          consented_at: string;
          created_at: string;
          email: string;
          id: string;
          ip_hash: string | null;
          locale: string;
          status: string;
          unsubscribe_token: string;
        };
        ComputedFields: never;
        Insert: {
          consent_version?: string;
          consented_at?: string;
          created_at?: string;
          email: string;
          id?: string;
          ip_hash?: string | null;
          locale?: string;
          status?: string;
          unsubscribe_token?: string;
        };
        Update: {
          consent_version?: string;
          consented_at?: string;
          created_at?: string;
          email?: string;
          id?: string;
          ip_hash?: string | null;
          locale?: string;
          status?: string;
          unsubscribe_token?: string;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          created_at: string;
          details: string | null;
          id: string;
          reason: Database['public']['Enums']['report_reason'];
          reporter_hash: string;
          resolved_at: string | null;
          resolved_by: string | null;
          status: string;
          story_id: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          details?: string | null;
          id?: string;
          reason: Database['public']['Enums']['report_reason'];
          reporter_hash: string;
          resolved_at?: string | null;
          resolved_by?: string | null;
          status?: string;
          story_id: string;
        };
        Update: {
          created_at?: string;
          details?: string | null;
          id?: string;
          reason?: Database['public']['Enums']['report_reason'];
          reporter_hash?: string;
          resolved_at?: string | null;
          resolved_by?: string | null;
          status?: string;
          story_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reports_story_id_fkey';
            columns: ['story_id'];
            isOneToOne: false;
            referencedRelation: 'stories';
            referencedColumns: ['id'];
          },
        ];
      };
      site_alerts: {
        Row: {
          active: boolean;
          created_at: string;
          created_by: string | null;
          expires_at: string | null;
          id: string;
          level: Database['public']['Enums']['alert_level'];
          link_url: string | null;
          message_ar: string;
          message_en: string;
          message_fr: string;
          starts_at: string;
        };
        ComputedFields: never;
        Insert: {
          active?: boolean;
          created_at?: string;
          created_by?: string | null;
          expires_at?: string | null;
          id?: string;
          level?: Database['public']['Enums']['alert_level'];
          link_url?: string | null;
          message_ar: string;
          message_en: string;
          message_fr: string;
          starts_at?: string;
        };
        Update: {
          active?: boolean;
          created_at?: string;
          created_by?: string | null;
          expires_at?: string | null;
          id?: string;
          level?: Database['public']['Enums']['alert_level'];
          link_url?: string | null;
          message_ar?: string;
          message_en?: string;
          message_fr?: string;
          starts_at?: string;
        };
        Relationships: [];
      };
      stories: {
        Row: {
          approved_at: string | null;
          author_name: string;
          body: string;
          category: Database['public']['Enums']['story_category'];
          country: Database['public']['Enums']['story_country'];
          created_at: string;
          excerpt: string | null;
          heart_count: number;
          id: string;
          ip_hash: string | null;
          is_sample: boolean;
          locale: string;
          moderated_by: string | null;
          moderation_note: string | null;
          photo_count: number;
          place_year: string | null;
          sample_image_id: string | null;
          status: Database['public']['Enums']['story_status'];
          title: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          approved_at?: string | null;
          author_name: string;
          body: string;
          category: Database['public']['Enums']['story_category'];
          country: Database['public']['Enums']['story_country'];
          created_at?: string;
          excerpt?: never;
          heart_count?: number;
          id?: string;
          ip_hash?: string | null;
          is_sample?: boolean;
          locale?: string;
          moderated_by?: string | null;
          moderation_note?: string | null;
          photo_count?: number;
          place_year?: string | null;
          sample_image_id?: string | null;
          status?: Database['public']['Enums']['story_status'];
          title: string;
          updated_at?: string;
        };
        Update: {
          approved_at?: string | null;
          author_name?: string;
          body?: string;
          category?: Database['public']['Enums']['story_category'];
          country?: Database['public']['Enums']['story_country'];
          created_at?: string;
          excerpt?: never;
          heart_count?: number;
          id?: string;
          ip_hash?: string | null;
          is_sample?: boolean;
          locale?: string;
          moderated_by?: string | null;
          moderation_note?: string | null;
          photo_count?: number;
          place_year?: string | null;
          sample_image_id?: string | null;
          status?: Database['public']['Enums']['story_status'];
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      story_photos: {
        Row: {
          alt: string | null;
          bucket: string;
          created_at: string;
          height: number;
          id: string;
          path_full: string;
          path_thumb: string;
          position: number;
          story_id: string;
          width: number;
        };
        ComputedFields: never;
        Insert: {
          alt?: string | null;
          bucket: string;
          created_at?: string;
          height: number;
          id?: string;
          path_full: string;
          path_thumb: string;
          position: number;
          story_id: string;
          width: number;
        };
        Update: {
          alt?: string | null;
          bucket?: string;
          created_at?: string;
          height?: number;
          id?: string;
          path_full?: string;
          path_thumb?: string;
          position?: number;
          story_id?: string;
          width?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'story_photos_story_id_fkey';
            columns: ['story_id'];
            isOneToOne: false;
            referencedRelation: 'stories';
            referencedColumns: ['id'];
          },
        ];
      };
      story_reactions: {
        Row: {
          created_at: string;
          story_id: string;
          voter_hash: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          story_id: string;
          voter_hash: string;
        };
        Update: {
          created_at?: string;
          story_id?: string;
          voter_hash?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'story_reactions_story_id_fkey';
            columns: ['story_id'];
            isOneToOne: false;
            referencedRelation: 'stories';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_stories: {
        Args: {
          p_before_approved_at?: string;
          p_before_id?: string;
          p_category?: Database['public']['Enums']['story_category'];
          p_country?: Database['public']['Enums']['story_country'];
          p_limit?: number;
        };
        Returns: {
          approved_at: string;
          author_name: string;
          category: Database['public']['Enums']['story_category'];
          country: Database['public']['Enums']['story_country'];
          cover_alt: string;
          cover_height: number;
          cover_path: string;
          cover_width: number;
          excerpt: string;
          heart_count: number;
          id: string;
          is_sample: boolean;
          photo_count: number;
          place_year: string;
          sample_image_id: string;
          title: string;
        }[];
      };
      get_story: { Args: { p_id: string }; Returns: Json };
      hit_rate_limit: {
        Args: { p_action: string; p_ip_hash: string; p_max: number; p_window: string };
        Returns: boolean;
      };
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
    };
    Enums: {
      alert_level: 'info' | 'warning' | 'critical';
      report_reason: 'not-owner' | 'offensive' | 'private' | 'spam' | 'other';
      story_category: 'story' | 'photo' | 'diary' | 'anecdote';
      story_country: 'tunisia' | 'bahrain' | 'both' | 'other';
      story_status: 'pending' | 'approved' | 'rejected' | 'hidden';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    keyof (DefaultSchema['Tables'] & DefaultSchema['Views']) | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      alert_level: ['info', 'warning', 'critical'],
      report_reason: ['not-owner', 'offensive', 'private', 'spam', 'other'],
      story_category: ['story', 'photo', 'diary', 'anecdote'],
      story_country: ['tunisia', 'bahrain', 'both', 'other'],
      story_status: ['pending', 'approved', 'rejected', 'hidden'],
    },
  },
} as const;
