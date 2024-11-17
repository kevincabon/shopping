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
      stores: {
        Row: {
          id: number
          created_at: string
          name: string
          user_id: string
        }
        Insert: {
          id?: number
          created_at?: string
          name: string
          user_id: string
        }
        Update: {
          id?: number
          created_at?: string
          name?: string
          user_id?: string
        }
      }
      products: {
        Row: {
          id: number
          created_at: string
          name: string
          price: number
          store_id: number
          barcode?: string
          image_url?: string
          user_id: string
          purchase_count: number
          in_list: boolean
          quantity: number
        }
        Insert: {
          id?: number
          created_at?: string
          name: string
          price: number
          store_id: number
          barcode?: string
          image_url?: string
          user_id: string
          purchase_count?: number
          in_list?: boolean
          quantity?: number
        }
        Update: {
          id?: number
          created_at?: string
          name?: string
          price?: number
          store_id?: number
          barcode?: string
          image_url?: string
          user_id?: string
          purchase_count?: number
          in_list?: boolean
          quantity?: number
        }
      }
      price_history: {
        Row: {
          id: number
          created_at: string
          product_id: number
          price: number
          user_id: string
        }
        Insert: {
          id?: number
          created_at?: string
          product_id: number
          price: number
          user_id: string
        }
        Update: {
          id?: number
          created_at?: string
          product_id?: number
          price?: number
          user_id?: string
        }
      }
      shopping_lists: {
        Row: {
          id: number
          created_at: string
          store_id: number
          total: number
          week_number: number
          user_id: string
        }
        Insert: {
          id?: number
          created_at?: string
          store_id: number
          total: number
          week_number: number
          user_id: string
        }
        Update: {
          id?: number
          created_at?: string
          store_id?: number
          total?: number
          week_number?: number
          user_id?: string
        }
      }
      shopping_list_items: {
        Row: {
          id: number
          created_at: string
          shopping_list_id: number
          product_id: number
          quantity: number
          price: number
          user_id: string
        }
        Insert: {
          id?: number
          created_at?: string
          shopping_list_id: number
          product_id: number
          quantity: number
          price: number
          user_id: string
        }
        Update: {
          id?: number
          created_at?: string
          shopping_list_id?: number
          product_id?: number
          quantity?: number
          price?: number
          user_id?: string
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
  }
}