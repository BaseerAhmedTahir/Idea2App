import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string;
          idea: string;
          features: any;
          tech_stack: any;
          generated_code: any;
          status: 'draft' | 'generating' | 'completed' | 'deployed';
          preview_url: string | null;
          github_repo: string | null;
          deployment_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description: string;
          idea: string;
          features?: any;
          tech_stack?: any;
          generated_code?: any;
          status?: 'draft' | 'generating' | 'completed' | 'deployed';
          preview_url?: string | null;
          github_repo?: string | null;
          deployment_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string;
          idea?: string;
          features?: any;
          tech_stack?: any;
          generated_code?: any;
          status?: 'draft' | 'generating' | 'completed' | 'deployed';
          preview_url?: string | null;
          github_repo?: string | null;
          deployment_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url: string | null;
          github_username: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          avatar_url?: string | null;
          github_username?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar_url?: string | null;
          github_username?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};