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
          display_name: string;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      movies: {
        Row: {
          id: string;
          tmdb_id: number | null;
          title: string;
          year: number | null;
          poster_url: string | null;
          description: string | null;
          added_by: string;
          created_at: string;
          is_current: boolean;
        };
        Insert: {
          id?: string;
          tmdb_id?: number | null;
          title: string;
          year?: number | null;
          poster_url?: string | null;
          description?: string | null;
          added_by: string;
          created_at?: string;
          is_current?: boolean;
        };
        Update: {
          id?: string;
          tmdb_id?: number | null;
          title?: string;
          year?: number | null;
          poster_url?: string | null;
          description?: string | null;
          added_by?: string;
          created_at?: string;
          is_current?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "movies_added_by_fkey";
            columns: ["added_by"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      movie_ratings: {
        Row: {
          id: string;
          movie_id: string;
          user_id: string;
          watched: boolean;
          score: number | null;
          review: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          movie_id: string;
          user_id: string;
          watched?: boolean;
          score?: number | null;
          review?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          movie_id?: string;
          user_id?: string;
          watched?: boolean;
          score?: number | null;
          review?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "movie_ratings_movie_id_fkey";
            columns: ["movie_id"];
            referencedRelation: "movies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "movie_ratings_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Helper types for easier access
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Movie = Database["public"]["Tables"]["movies"]["Row"];
export type MovieRating = Database["public"]["Tables"]["movie_ratings"]["Row"];

// Extended types for the UI
export type MovieWithRatings = Movie & {
  ratings: (MovieRating & { profile: Profile })[];
};

