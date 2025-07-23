// types/supabase.ts
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          updated_at: string | null;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          website: string | null;
          // New enhanced fields
          organization_id: string | null;
          role: 'admin' | 'member' | 'viewer';
          email_verified: boolean;
          last_login_at: string | null;
          preferences: JSON;
          created_at: string;
          phone: string | null;
          location: string | null;
          timezone: string;
          is_active: boolean;
          email_notifications: boolean;
          marketing_emails: boolean;
          job_title: string | null;
          company: string | null;
          bio: string | null;
          social_links: JSON;
          onboarding_completed: boolean;
          onboarding_step: number;
        };
        Insert: {
          id: string;
          updated_at?: string | null;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          website?: string | null;
          organization_id?: string | null;
          role?: 'admin' | 'member' | 'viewer';
          email_verified?: boolean;
          last_login_at?: string | null;
          preferences?: JSON;
          created_at?: string;
          phone?: string | null;
          location?: string | null;
          timezone?: string;
          is_active?: boolean;
          email_notifications?: boolean;
          marketing_emails?: boolean;
          job_title?: string | null;
          company?: string | null;
          bio?: string | null;
          social_links?: JSON;
          onboarding_completed?: boolean;
          onboarding_step?: number;
        };
        Update: {
          id?: string;
          updated_at?: string | null;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          website?: string | null;
          organization_id?: string | null;
          role?: 'admin' | 'member' | 'viewer';
          email_verified?: boolean;
          last_login_at?: string | null;
          preferences?: JSON;
          created_at?: string;
          phone?: string | null;
          location?: string | null;
          timezone?: string;
          is_active?: boolean;
          email_notifications?: boolean;
          marketing_emails?: boolean;
          job_title?: string | null;
          company?: string | null;
          bio?: string | null;
          social_links?: JSON;
          onboarding_completed?: boolean;
          onboarding_step?: number;
        };
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          plan: 'free' | 'pro' | 'enterprise';
          status: 'active' | 'suspended' | 'cancelled';
          settings: JSON;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          plan?: 'free' | 'pro' | 'enterprise';
          status?: 'active' | 'suspended' | 'cancelled';
          settings?: JSON;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          plan?: 'free' | 'pro' | 'enterprise';
          status?: 'active' | 'suspended' | 'cancelled';
          settings?: JSON;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Keep your existing tables...
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}