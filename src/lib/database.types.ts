export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          date_of_birth: string
          province: string
          relationship_status: string
          couple_id: string | null
          contribution_limits: Json
          is_primary: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          email: string
          date_of_birth: string
          province: string
          relationship_status?: string
          couple_id?: string | null
          contribution_limits?: Json
          is_primary?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string
          date_of_birth?: string
          province?: string
          relationship_status?: string
          couple_id?: string | null
          contribution_limits?: Json
          is_primary?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
      }
      accounts: {
        Row: {
          id: string
          user_id: string
          type: string
          institution_name: string
          account_number: string
          current_balance: number
          contribution_room: number
          year_to_date_contributions: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          institution_name: string
          account_number: string
          current_balance?: number
          contribution_room?: number
          year_to_date_contributions?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          institution_name?: string
          account_number?: string
          current_balance?: number
          contribution_room?: number
          year_to_date_contributions?: number
          created_at?: string | null
          updated_at?: string | null
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          account_id: string
          type: string
          amount: number
          date: string
          description: string
          category: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          account_id: string
          type: string
          amount: number
          date: string
          description: string
          category?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          account_id?: string
          type?: string
          amount?: number
          date?: string
          description?: string
          category?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          title: string
          target_amount: number
          current_amount: number
          target_date: string
          account_types: string[]
          priority: string
          is_shared: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          target_amount: number
          current_amount?: number
          target_date: string
          account_types: string[]
          priority: string
          is_shared?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          target_amount?: number
          current_amount?: number
          target_date?: string
          account_types?: string[]
          priority?: string
          is_shared?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      couples: {
        Row: {
          id: string
          partner1_id: string
          partner2_id: string
          marriage_date: string | null
          shared_goals: string[] | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          partner1_id: string
          partner2_id: string
          marriage_date?: string | null
          shared_goals?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          partner1_id?: string
          partner2_id?: string
          marriage_date?: string | null
          shared_goals?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}