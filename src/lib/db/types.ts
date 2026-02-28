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
      site_config: {
        Row: {
          id: number
          meta_title: string | null
          title: string | null
          subtitle: string | null
          logo_text: string | null
          logo_icon: string | null
          copyright: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          meta_title?: string | null
          title?: string | null
          subtitle?: string | null
          logo_text?: string | null
          logo_icon?: string | null
          copyright?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          meta_title?: string | null
          title?: string | null
          subtitle?: string | null
          logo_text?: string | null
          logo_icon?: string | null
          copyright?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      pages: {
        Row: {
          slug: string
          title: string
          subtitle: string | null
          content: string | null
          search_hint: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          slug: string
          title: string
          subtitle?: string | null
          content?: string | null
          search_hint?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          slug?: string
          title?: string
          subtitle?: string | null
          content?: string | null
          search_hint?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      categories: {
        Row: {
          id: string
          section: string
          title: string
          icon: string | null
          sort_order: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          section: string
          title: string
          icon?: string | null
          sort_order?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          section?: string
          title?: string
          icon?: string | null
          sort_order?: number | null
          created_at?: string | null
        }
      }
      links: {
        Row: {
          id: string
          category_id: string
          title: string
          url: string
          description: string | null
          icon: string | null
          tags: string[] | null
          sort_order: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          category_id: string
          title: string
          url: string
          description?: string | null
          icon?: string | null
          tags?: string[] | null
          sort_order?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          category_id?: string
          title?: string
          url?: string
          description?: string | null
          icon?: string | null
          tags?: string[] | null
          sort_order?: number | null
          created_at?: string | null
        }
      }
      posts: {
        Row: {
          id: string
          title: string
          excerpt: string | null
          content: string | null
          cover_image: string | null
          tags: string[] | null
          published_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          title: string
          excerpt?: string | null
          content?: string | null
          cover_image?: string | null
          tags?: string[] | null
          published_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          excerpt?: string | null
          content?: string | null
          cover_image?: string | null
          tags?: string[] | null
          published_at?: string | null
          created_at?: string | null
        }
      }
      moments: {
        Row: {
          id: string
          content: string
          type: string
          media_url: string | null
          images: string[] | null
          link_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          content: string
          type: string
          media_url?: string | null
          images?: string[] | null
          link_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          content?: string
          type?: string
          media_url?: string | null
          images?: string[] | null
          link_url?: string | null
          created_at?: string
        }
      }
    }
  }
}
