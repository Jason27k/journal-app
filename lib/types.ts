export type Database = {
  public: {
    Tables: {
      entries: {
        Row: {
          id: string
          user_id: string
          content: string
          template: string | null
          pinned: boolean
          deleted_at: string | null
          created_at: string
          updated_at: string
          search_vector: string | null
        }
        Insert: {
          id?: string
          user_id: string
          content?: string
          template?: string | null
          pinned?: boolean
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
          search_vector?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          template?: string | null
          pinned?: boolean
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
          search_vector?: string | null
        }
        Relationships: []
      }
      tags: {
        Row: { id: string; user_id: string; name: string; created_at: string }
        Insert: { id?: string; user_id: string; name: string; created_at?: string }
        Update: { id?: string; user_id?: string; name?: string; created_at?: string }
        Relationships: []
      }
      entry_tags: {
        Row: { entry_id: string; tag_id: string }
        Insert: { entry_id: string; tag_id: string }
        Update: { entry_id?: string; tag_id?: string }
        Relationships: []
      }
      goals: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          status: string
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          status?: string
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          status?: string
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      goal_entries: {
        Row: { goal_id: string; entry_id: string }
        Insert: { goal_id: string; entry_id: string }
        Update: { goal_id?: string; entry_id?: string }
        Relationships: []
      }
      hobbies: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          started_at: string
          ended_at: string | null
          notes: string | null
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          started_at?: string
          ended_at?: string | null
          notes?: string | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          started_at?: string
          ended_at?: string | null
          notes?: string | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      entry_hobbies: {
        Row: { hobby_id: string; entry_id: string }
        Insert: { hobby_id: string; entry_id: string }
        Update: { hobby_id?: string; entry_id?: string }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}

export type Entry = Database['public']['Tables']['entries']['Row']
export type Tag = Database['public']['Tables']['tags']['Row']
export type Goal = Database['public']['Tables']['goals']['Row']
export type Hobby = Database['public']['Tables']['hobbies']['Row']

export const TEMPLATES = {
  blank: { label: 'Blank', content: '' },
  daily_log: {
    label: 'Daily Log',
    content: `## What I did today\n\n\n\n## Wins\n\n\n\n## Tomorrow\n\n`,
  },
  weekly_review: {
    label: 'Weekly Review',
    content: `## Week in review\n\n### What went well\n\n\n\n### What didn't go well\n\n\n\n### Goals progress\n\n\n\n### Focus for next week\n\n`,
  },
  goal_checkin: {
    label: 'Goal Check-in',
    content: `## Goal Check-in\n\n### Progress\n\n\n\n### Blockers\n\n\n\n### Next steps\n\n`,
  },
  hobby_log: {
    label: 'Hobby Log',
    content: `## Hobby log\n\n### What I worked on\n\n\n\n### Progress\n\n\n\n### Next session\n\n`,
  },
} as const

export type TemplateKey = keyof typeof TEMPLATES
