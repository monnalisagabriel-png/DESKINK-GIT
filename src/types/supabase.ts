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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      academy_attendance_logs: {
        Row: {
          action: string
          course_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          new_value: number | null
          previous_value: number | null
          student_id: string
        }
        Insert: {
          action: string
          course_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          new_value?: number | null
          previous_value?: number | null
          student_id: string
        }
        Update: {
          action?: string
          course_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          new_value?: number | null
          previous_value?: number | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_attendance_logs_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "academy_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_courses: {
        Row: {
          created_at: string | null
          description: string | null
          duration: string | null
          id: string
          materials: Json | null
          price: number | null
          studio_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          materials?: Json | null
          price?: number | null
          studio_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          materials?: Json | null
          price?: number | null
          studio_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      academy_daily_attendance: {
        Row: {
          course_id: string
          created_at: string | null
          date: string
          status: string | null
          student_id: string
        }
        Insert: {
          course_id: string
          created_at?: string | null
          date: string
          status?: string | null
          student_id: string
        }
        Update: {
          course_id?: string
          created_at?: string | null
          date?: string
          status?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_daily_attendance_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "academy_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_enrollments: {
        Row: {
          allowed_days: number | null
          attendance_updated_at: string | null
          attendance_updated_by: string | null
          attended_days: number | null
          course_id: string
          created_at: string | null
          deposits: Json | null
          student_id: string
          total_cost: number | null
        }
        Insert: {
          allowed_days?: number | null
          attendance_updated_at?: string | null
          attendance_updated_by?: string | null
          attended_days?: number | null
          course_id: string
          created_at?: string | null
          deposits?: Json | null
          student_id: string
          total_cost?: number | null
        }
        Update: {
          allowed_days?: number | null
          attendance_updated_at?: string | null
          attendance_updated_by?: string | null
          attended_days?: number | null
          course_id?: string
          created_at?: string | null
          deposits?: Json | null
          student_id?: string
          total_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "academy_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "academy_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          artist_id: string | null
          client_id: string | null
          created_at: string | null
          deposit: number | null
          end_time: string
          google_event_id: string | null
          id: string
          images: string[] | null
          notes: string | null
          price: number | null
          service_name: string
          start_time: string
          status: string
          studio_id: string | null
          updated_at: string | null
        }
        Insert: {
          artist_id?: string | null
          client_id?: string | null
          created_at?: string | null
          deposit?: number | null
          end_time: string
          google_event_id?: string | null
          id?: string
          images?: string[] | null
          notes?: string | null
          price?: number | null
          service_name: string
          start_time: string
          status?: string
          studio_id?: string | null
          updated_at?: string | null
        }
        Update: {
          artist_id?: string | null
          client_id?: string | null
          created_at?: string | null
          deposit?: number | null
          end_time?: string
          google_event_id?: string | null
          id?: string
          images?: string[] | null
          notes?: string | null
          price?: number | null
          service_name?: string
          start_time?: string
          status?: string
          studio_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      artist_contracts: {
        Row: {
          address: string | null
          artist_id: string | null
          commission_rate: number | null
          created_at: string | null
          fiscal_code: string | null
          iban: string | null
          id: string
          presence_cycle_end: string | null
          presence_cycle_start: string | null
          presence_package_limit: number | null
          presence_price: number | null
          rent_fixed_amount: number | null
          rent_percent_rate: number | null
          rent_type: string
          studio_id: string | null
          updated_at: string | null
          used_presences: number | null
          vat_number: string | null
        }
        Insert: {
          address?: string | null
          artist_id?: string | null
          commission_rate?: number | null
          created_at?: string | null
          fiscal_code?: string | null
          iban?: string | null
          id?: string
          presence_cycle_end?: string | null
          presence_cycle_start?: string | null
          presence_package_limit?: number | null
          presence_price?: number | null
          rent_fixed_amount?: number | null
          rent_percent_rate?: number | null
          rent_type: string
          studio_id?: string | null
          updated_at?: string | null
          used_presences?: number | null
          vat_number?: string | null
        }
        Update: {
          address?: string | null
          artist_id?: string | null
          commission_rate?: number | null
          created_at?: string | null
          fiscal_code?: string | null
          iban?: string | null
          id?: string
          presence_cycle_end?: string | null
          presence_cycle_start?: string | null
          presence_package_limit?: number | null
          presence_price?: number | null
          rent_fixed_amount?: number | null
          rent_percent_rate?: number | null
          rent_type?: string
          studio_id?: string | null
          updated_at?: string | null
          used_presences?: number | null
          vat_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artist_contracts_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artist_contracts_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      client_consents: {
        Row: {
          client_id: string
          created_at: string | null
          id: string
          role: string | null
          signature_url: string | null
          signed_at: string | null
          template_id: string
          template_version: number
        }
        Insert: {
          client_id: string
          created_at?: string | null
          id?: string
          role?: string | null
          signature_url?: string | null
          signed_at?: string | null
          template_id: string
          template_version: number
        }
        Update: {
          client_id?: string
          created_at?: string | null
          id?: string
          role?: string | null
          signature_url?: string | null
          signed_at?: string | null
          template_id?: string
          template_version?: number
        }
        Relationships: [
          {
            foreignKeyName: "client_consents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_consents_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "consent_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          email: string | null
          fiscal_code: string | null
          full_name: string
          id: string
          images: Json | null
          notes: string | null
          phone: string | null
          preferred_styles: string[] | null
          studio_id: string | null
          updated_at: string | null
          whatsapp_broadcast_opt_in: boolean | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          fiscal_code?: string | null
          full_name: string
          id?: string
          images?: Json | null
          notes?: string | null
          phone?: string | null
          preferred_styles?: string[] | null
          studio_id?: string | null
          updated_at?: string | null
          whatsapp_broadcast_opt_in?: boolean | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          fiscal_code?: string | null
          full_name?: string
          id?: string
          images?: Json | null
          notes?: string | null
          phone?: string | null
          preferred_styles?: string[] | null
          studio_id?: string | null
          updated_at?: string | null
          whatsapp_broadcast_opt_in?: boolean | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_replies: {
        Row: {
          author_id: string
          author_name: string | null
          communication_id: string | null
          content: string
          created_at: string | null
          id: string
        }
        Insert: {
          author_id: string
          author_name?: string | null
          communication_id?: string | null
          content: string
          created_at?: string | null
          id?: string
        }
        Update: {
          author_id?: string
          author_name?: string | null
          communication_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_replies_communication_id_fkey"
            columns: ["communication_id"]
            isOneToOne: false
            referencedRelation: "communications"
            referencedColumns: ["id"]
          },
        ]
      }
      communications: {
        Row: {
          author_id: string
          author_name: string | null
          content: string
          created_at: string | null
          id: string
          is_important: boolean | null
          studio_id: string
        }
        Insert: {
          author_id: string
          author_name?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_important?: boolean | null
          studio_id: string
        }
        Update: {
          author_id?: string
          author_name?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_important?: boolean | null
          studio_id?: string
        }
        Relationships: []
      }
      consent_templates: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_active: boolean | null
          required_resign: boolean | null
          studio_id: string
          title: string
          updated_at: string | null
          version: number
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          required_resign?: boolean | null
          studio_id: string
          title: string
          updated_at?: string | null
          version?: number
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          required_resign?: boolean | null
          studio_id?: string
          title?: string
          updated_at?: string | null
          version?: number
        }
        Relationships: []
      }
      courses: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          start_date: string | null
          student_ids: string[] | null
          studio_id: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          student_ids?: string[] | null
          studio_id?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          student_ids?: string[] | null
          studio_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      presence_logs: {
        Row: {
          action: string
          artist_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          note: string | null
          studio_id: string | null
        }
        Insert: {
          action: string
          artist_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          note?: string | null
          studio_id?: string | null
        }
        Update: {
          action?: string
          artist_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          note?: string | null
          studio_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "presence_logs_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presence_logs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presence_logs_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          day_of_month: number | null
          id: string
          name: string
          studio_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          day_of_month?: number | null
          id?: string
          name: string
          studio_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          day_of_month?: number | null
          id?: string
          name?: string
          studio_id?: string
        }
        Relationships: []
      }
      saas_plans: {
        Row: {
          created_at: string | null
          currency: string | null
          features: Json | null
          id: string
          max_artists: number
          max_managers: number
          name: string
          price_monthly: number
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          features?: Json | null
          id: string
          max_artists: number
          max_managers: number
          name: string
          price_monthly: number
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          features?: Json | null
          id?: string
          max_artists?: number
          max_managers?: number
          name?: string
          price_monthly?: number
        }
        Relationships: []
      }
      saas_subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          id: string
          plan_id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          studio_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          plan_id: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          studio_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          plan_id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          studio_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saas_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "saas_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saas_subscriptions_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: true
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      studio_invitations: {
        Row: {
          created_at: string
          email: string | null
          expires_at: string
          id: string
          invited_by: string | null
          role: Database["public"]["Enums"]["user_role"]
          studio_id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          expires_at?: string
          id?: string
          invited_by?: string | null
          role: Database["public"]["Enums"]["user_role"]
          studio_id: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          expires_at?: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          studio_id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "studio_invitations_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      studio_memberships: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          studio_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          studio_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          studio_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "studio_memberships_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      studios: {
        Row: {
          academy_terms: string | null
          academy_terms_version: number | null
          address: string | null
          ai_settings: Json | null
          city: string | null
          company_name: string | null
          created_at: string
          created_by: string | null
          fiscal_code: string | null
          google_review_url: string | null
          google_sheets_config: Json | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          vat_number: string | null
          website: string | null
        }
        Insert: {
          academy_terms?: string | null
          academy_terms_version?: number | null
          address?: string | null
          ai_settings?: Json | null
          city?: string | null
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          fiscal_code?: string | null
          google_review_url?: string | null
          google_sheets_config?: Json | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          vat_number?: string | null
          website?: string | null
        }
        Update: {
          academy_terms?: string | null
          academy_terms_version?: number | null
          address?: string | null
          ai_settings?: Json | null
          city?: string | null
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          fiscal_code?: string | null
          google_review_url?: string | null
          google_sheets_config?: Json | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          vat_number?: string | null
          website?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          appointment_id: string | null
          artist_id: string | null
          category: string
          created_at: string | null
          date: string
          description: string | null
          id: string
          payment_method: string | null
          studio_id: string | null
          type: string
        }
        Insert: {
          amount: number
          appointment_id?: string | null
          artist_id?: string | null
          category: string
          created_at?: string | null
          date: string
          description?: string | null
          id?: string
          payment_method?: string | null
          studio_id?: string | null
          type: string
        }
        Update: {
          amount?: number
          appointment_id?: string | null
          artist_id?: string | null
          category?: string
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          payment_method?: string | null
          studio_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      user_integrations: {
        Row: {
          access_token: string
          created_at: string | null
          expires_at: string
          id: string
          provider: string
          refresh_token: string
          settings: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string | null
          expires_at: string
          id?: string
          provider: string
          refresh_token: string
          settings?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          provider?: string
          refresh_token?: string
          settings?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          academy_terms_accepted_at: string | null
          academy_terms_accepted_version: number | null
          avatar_url: string | null
          calendar_color: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          role: string
          studio_id: string | null
          updated_at: string | null
        }
        Insert: {
          academy_terms_accepted_at?: string | null
          academy_terms_accepted_version?: number | null
          avatar_url?: string | null
          calendar_color?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string
          studio_id?: string | null
          updated_at?: string | null
        }
        Update: {
          academy_terms_accepted_at?: string | null
          academy_terms_accepted_version?: number | null
          avatar_url?: string | null
          calendar_color?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string
          studio_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist: {
        Row: {
          client_name: string
          client_phone: string | null
          created_at: string | null
          id: string
          notes: string | null
          preferred_days: string | null
          service_request: string | null
          status: string
          studio_id: string | null
        }
        Insert: {
          client_name: string
          client_phone?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          preferred_days?: string | null
          service_request?: string | null
          status?: string
          studio_id?: string | null
        }
        Update: {
          client_name?: string
          client_phone?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          preferred_days?: string | null
          service_request?: string | null
          status?: string
          studio_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist_entries: {
        Row: {
          artist_pref_id: string | null
          client_id: string | null
          client_name: string | null
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          images: string[] | null
          interest_type: string | null
          phone: string | null
          preferred_artist_id: string | null
          status: string | null
          studio_id: string
          styles: string[] | null
        }
        Insert: {
          artist_pref_id?: string | null
          client_id?: string | null
          client_name?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          images?: string[] | null
          interest_type?: string | null
          phone?: string | null
          preferred_artist_id?: string | null
          status?: string | null
          studio_id: string
          styles?: string[] | null
        }
        Update: {
          artist_pref_id?: string | null
          client_id?: string | null
          client_name?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          images?: string[] | null
          interest_type?: string | null
          phone?: string | null
          preferred_artist_id?: string | null
          status?: string | null
          studio_id?: string
          styles?: string[] | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_client_public: {
        Args: {
          p_address: string
          p_city: string
          p_email: string
          p_fiscal_code: string
          p_full_name: string
          p_phone: string
          p_preferred_styles: string[]
          p_studio_id: string
          p_whatsapp_broadcast_opt_in: boolean
          p_zip_code: string
        }
        Returns: Json
      }
      create_waitlist_entry_public: {
        Args: {
          p_artist_pref_id: string
          p_client_id: string
          p_client_name: string
          p_description: string
          p_email: string
          p_images: string[]
          p_interest_type: string
          p_phone: string
          p_studio_id: string
          p_styles: string[]
        }
        Returns: Json
      }
      delete_team_member: {
        Args: { studio_id_input: string; target_user_id: string }
        Returns: undefined
      }
      get_client_by_contact: {
        Args: { p_email: string; p_phone: string; p_studio_id: string }
        Returns: string
      }
      get_client_by_contact_v2: {
        Args: { p_email: string; p_phone: string; p_studio_id: string }
        Returns: string
      }
      get_invitation_by_token_v2: {
        Args: { token_input: string }
        Returns: {
          created_at: string
          email: string
          id: string
          invited_by: string
          role: string
          studio_id: string
          token: string
          used_at: string
        }[]
      }
      get_my_pending_invitations: {
        Args: never
        Returns: {
          created_at: string
          role: string
          studio_name: string
          token: string
        }[]
      }
      recover_orphaned_owner: {
        Args: never
        Returns: {
          recovered_studio_name: string
        }[]
      }
    }
    Enums: {
      user_role: "owner" | "manager" | "artist" | "student"
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
      user_role: ["owner", "manager", "artist", "student"],
    },
  },
} as const
