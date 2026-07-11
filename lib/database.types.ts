/**
 * TypeScript types auto-generated from Supabase schema.
 * After running `npx supabase gen types typescript --local > lib/database.types.ts`
 * this file will be auto-populated. For now it's manually typed.
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
      users: {
        Row: {
          id: string;
          wallet_address: string;
          username: string | null;
          avatar_url: string | null;
          bio: string | null;
          twitter_handle: string | null;
          total_volume_traded: number;
          tokens_launched: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wallet_address: string;
          username?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          twitter_handle?: string | null;
          total_volume_traded?: number;
          tokens_launched?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };
      tokens: {
        Row: {
          id: string;
          mint_address: string;
          name: string;
          ticker: string;
          icon: string;
          description: string | null;
          creator_id: string;
          bonding_curve_progress: number;
          graduated: boolean;
          metadata_uri: string | null;
          category: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          mint_address: string;
          name: string;
          ticker: string;
          icon?: string;
          description?: string | null;
          creator_id: string;
          bonding_curve_progress?: number;
          graduated?: boolean;
          metadata_uri?: string | null;
          category?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tokens"]["Insert"]>;
      };
      trades: {
        Row: {
          id: string;
          token_id: string;
          wallet_address: string;
          type: "buy" | "sell";
          sol_amount: number;
          token_amount: number;
          price_usd: number;
          tx_signature: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          token_id: string;
          wallet_address: string;
          type: "buy" | "sell";
          sol_amount: number;
          token_amount: number;
          price_usd?: number;
          tx_signature: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["trades"]["Insert"]>;
      };
      comments: {
        Row: {
          id: string;
          token_id: string;
          user_id: string;
          text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          token_id: string;
          user_id: string;
          text: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["comments"]["Insert"]>;
      };
      price_alerts: {
        Row: {
          id: string;
          user_id: string;
          token_id: string;
          condition: "above" | "below";
          target_price: number;
          active: boolean;
          triggered_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          token_id: string;
          condition: "above" | "below";
          target_price: number;
          active?: boolean;
          triggered_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["price_alerts"]["Insert"]>;
      };
      watchlist: {
        Row: {
          id: string;
          user_id: string;
          token_id: string;
          added_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          token_id: string;
          added_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["watchlist"]["Insert"]>;
      };
      proposals: {
        Row: {
          id: string;
          title: string;
          description: string;
          author_id: string;
          category: string;
          for_votes: number;
          against_votes: number;
          status: "active" | "passed" | "failed";
          ends_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          author_id: string;
          category?: string;
          for_votes?: number;
          against_votes?: number;
          status?: "active" | "passed" | "failed";
          ends_at: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["proposals"]["Insert"]>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          body: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          body: string;
          read?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
