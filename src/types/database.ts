/**
 * Supabase-generated Database type definitions for Coop Order Exchange.
 *
 * Matches the schema defined in supabase/migrations/001_tables.sql.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          role_preference: 'buyer' | 'seller' | 'admin';
          rating_avg: number;
          completed_count: number;
          cancel_count: number;
          avatar_url: string | null;
          push_token: string | null;
          is_banned: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          role_preference?: 'buyer' | 'seller' | 'admin';
          rating_avg?: number;
          completed_count?: number;
          cancel_count?: number;
          avatar_url?: string | null;
          push_token?: string | null;
          is_banned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          role_preference?: 'buyer' | 'seller' | 'admin';
          rating_avg?: number;
          completed_count?: number;
          cancel_count?: number;
          avatar_url?: string | null;
          push_token?: string | null;
          is_banned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      posts: {
        Row: {
          id: string;
          seller_id: string;
          status: 'open' | 'closed';
          capacity_total: number;
          capacity_remaining: number;
          location: string | null;
          notes: string | null;
          max_value_hint: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          seller_id: string;
          status?: 'open' | 'closed';
          capacity_total: number;
          capacity_remaining: number;
          location?: string | null;
          notes?: string | null;
          max_value_hint?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          seller_id?: string;
          status?: 'open' | 'closed';
          capacity_total?: number;
          capacity_remaining?: number;
          location?: string | null;
          notes?: string | null;
          max_value_hint?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'posts_seller_id_fkey';
            columns: ['seller_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };

      requests: {
        Row: {
          id: string;
          post_id: string;
          buyer_id: string;
          seller_id: string;
          status:
            | 'requested'
            | 'accepted'
            | 'ordered'
            | 'picked_up'
            | 'completed'
            | 'cancelled'
            | 'disputed';
          items_text: string;
          instructions: string | null;
          est_total: number | null;
          ordered_proof_path: string | null;
          order_id_text: string | null;
          buyer_completed: boolean;
          seller_completed: boolean;
          cancel_reason: string | null;
          cancelled_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          buyer_id: string;
          seller_id: string;
          status?:
            | 'requested'
            | 'accepted'
            | 'ordered'
            | 'picked_up'
            | 'completed'
            | 'cancelled'
            | 'disputed';
          items_text: string;
          instructions?: string | null;
          est_total?: number | null;
          ordered_proof_path?: string | null;
          order_id_text?: string | null;
          buyer_completed?: boolean;
          seller_completed?: boolean;
          cancel_reason?: string | null;
          cancelled_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          buyer_id?: string;
          seller_id?: string;
          status?:
            | 'requested'
            | 'accepted'
            | 'ordered'
            | 'picked_up'
            | 'completed'
            | 'cancelled'
            | 'disputed';
          items_text?: string;
          instructions?: string | null;
          est_total?: number | null;
          ordered_proof_path?: string | null;
          order_id_text?: string | null;
          buyer_completed?: boolean;
          seller_completed?: boolean;
          cancel_reason?: string | null;
          cancelled_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'requests_post_id_fkey';
            columns: ['post_id'];
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'requests_buyer_id_fkey';
            columns: ['buyer_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'requests_seller_id_fkey';
            columns: ['seller_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'requests_cancelled_by_fkey';
            columns: ['cancelled_by'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };

      messages: {
        Row: {
          id: string;
          request_id: string;
          sender_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          request_id: string;
          sender_id: string;
          body: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          request_id?: string;
          sender_id?: string;
          body?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'messages_request_id_fkey';
            columns: ['request_id'];
            referencedRelation: 'requests';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'messages_sender_id_fkey';
            columns: ['sender_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };

      ratings: {
        Row: {
          id: string;
          request_id: string;
          rater_id: string;
          ratee_id: string;
          stars: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          request_id: string;
          rater_id: string;
          ratee_id: string;
          stars: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          request_id?: string;
          rater_id?: string;
          ratee_id?: string;
          stars?: number;
          comment?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'ratings_request_id_fkey';
            columns: ['request_id'];
            referencedRelation: 'requests';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'ratings_rater_id_fkey';
            columns: ['rater_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'ratings_ratee_id_fkey';
            columns: ['ratee_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };

      disputes: {
        Row: {
          id: string;
          request_id: string;
          opener_id: string;
          reason: string;
          description: string | null;
          status: 'open' | 'resolved';
          resolution: string | null;
          resolved_by: string | null;
          created_at: string;
          resolved_at: string | null;
        };
        Insert: {
          id?: string;
          request_id: string;
          opener_id: string;
          reason: string;
          description?: string | null;
          status?: 'open' | 'resolved';
          resolution?: string | null;
          resolved_by?: string | null;
          created_at?: string;
          resolved_at?: string | null;
        };
        Update: {
          id?: string;
          request_id?: string;
          opener_id?: string;
          reason?: string;
          description?: string | null;
          status?: 'open' | 'resolved';
          resolution?: string | null;
          resolved_by?: string | null;
          created_at?: string;
          resolved_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'disputes_request_id_fkey';
            columns: ['request_id'];
            referencedRelation: 'requests';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'disputes_opener_id_fkey';
            columns: ['opener_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'disputes_resolved_by_fkey';
            columns: ['resolved_by'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };

      audit_log: {
        Row: {
          id: string;
          request_id: string | null;
          actor_id: string | null;
          action: string;
          from_status: string | null;
          to_status: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          request_id?: string | null;
          actor_id?: string | null;
          action: string;
          from_status?: string | null;
          to_status?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          request_id?: string | null;
          actor_id?: string | null;
          action?: string;
          from_status?: string | null;
          to_status?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'audit_log_request_id_fkey';
            columns: ['request_id'];
            referencedRelation: 'requests';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'audit_log_actor_id_fkey';
            columns: ['actor_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };

    Views: {
      [_ in never]: never;
    };

    Functions: {
      accept_request: {
        Args: { p_request_id: string };
        Returns: Database['public']['Tables']['requests']['Row'];
      };
      decline_request: {
        Args: { p_request_id: string };
        Returns: Database['public']['Tables']['requests']['Row'];
      };
      mark_ordered: {
        Args: {
          p_request_id: string;
          p_ordered_proof_path?: string;
          p_order_id_text?: string;
        };
        Returns: Database['public']['Tables']['requests']['Row'];
      };
      mark_picked_up: {
        Args: { p_request_id: string };
        Returns: Database['public']['Tables']['requests']['Row'];
      };
      mark_completed: {
        Args: { p_request_id: string };
        Returns: Database['public']['Tables']['requests']['Row'];
      };
      cancel_request: {
        Args: {
          p_request_id: string;
          p_reason?: string;
        };
        Returns: Database['public']['Tables']['requests']['Row'];
      };
      open_dispute: {
        Args: {
          p_request_id: string;
          p_reason: string;
          p_description?: string;
        };
        Returns: Database['public']['Tables']['disputes']['Row'];
      };
      resolve_dispute: {
        Args: {
          p_dispute_id: string;
          p_resolution: string;
        };
        Returns: Database['public']['Tables']['disputes']['Row'];
      };
      submit_rating: {
        Args: {
          p_request_id: string;
          p_stars: number;
          p_comment?: string;
        };
        Returns: Database['public']['Tables']['ratings']['Row'];
      };
    };

    Enums: {
      [_ in never]: never;
    };

    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

/* ------------------------------------------------------------------ */
/* Convenience aliases                                                */
/* ------------------------------------------------------------------ */

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type InsertDto<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type UpdateDto<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

export type Profile = Tables<'profiles'>;
export type Post = Tables<'posts'>;
export type Request = Tables<'requests'>;
export type Message = Tables<'messages'>;
export type Rating = Tables<'ratings'>;
export type Dispute = Tables<'disputes'>;
export type AuditLogEntry = Tables<'audit_log'>;
