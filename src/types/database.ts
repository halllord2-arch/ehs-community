export type RoleLevel = 'observer' | 'contributor' | 'verifier' | 'veteran' | 'master'
export type PostStatus = 'pending' | 'verified' | 'rejected' | 'flagged'
export type Judgment = 'appropriate' | 'inappropriate'
export type PointReason =
  | 'post_create'
  | 'industry_tag_correct'
  | 'hazard_self_tag'
  | 'verified_appropriate'
  | 'ai_match_bonus'
  | 'help_reaction'
  | 'verify_action'
  | 'verify_consensus_bonus'
  | 'duplicate_penalty'
  | 'low_quality_penalty'

export type UserRow = {
  id: string
  name: string
  company: string
  job_role: string
  career_years: number
  industry_tags: string[]
  role_level: RoleLevel
  total_points: number
  industry_points: Record<string, number>
  verifier_eligible: boolean
  last_active_at: string
  created_at: string
}

export type PostRow = {
  id: string
  user_id: string
  image_url: string
  image_phash: string | null
  description: string
  industry_tag: string
  hazard_type: string
  status: PostStatus
  ai_confidence_score: number | null
  ai_hazard_prediction: Record<string, unknown> | null
  created_at: string
}

export type VerificationRow = {
  id: string
  post_id: string
  verifier_id: string
  judgment: Judgment
  comment: string | null
  created_at: string
}

export type PointTransactionRow = {
  id: string
  user_id: string
  amount: number
  reason: PointReason
  related_post_id: string | null
  created_at: string
}

export type PointsConfigRow = {
  action_type: string
  point_value: number
  daily_cap: number | null
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: UserRow
        Insert: Omit<UserRow, 'created_at' | 'last_active_at'> & {
          created_at?: string
          last_active_at?: string
        }
        Update: Partial<Omit<UserRow, 'id'>>
        Relationships: []
      }
      posts: {
        Row: PostRow
        Insert: Omit<PostRow, 'id' | 'created_at' | 'ai_confidence_score' | 'ai_hazard_prediction'> & {
          id?: string
          created_at?: string
          ai_confidence_score?: number | null
          ai_hazard_prediction?: Record<string, unknown> | null
        }
        Update: Partial<Omit<PostRow, 'id' | 'created_at'>>
        Relationships: []
      }
      verifications: {
        Row: VerificationRow
        Insert: Omit<VerificationRow, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<VerificationRow, 'id' | 'created_at'>>
        Relationships: []
      }
      point_transactions: {
        Row: PointTransactionRow
        Insert: Omit<PointTransactionRow, 'id' | 'created_at' | 'related_post_id'> & {
          id?: string
          created_at?: string
          related_post_id?: string | null
        }
        Update: Partial<Omit<PointTransactionRow, 'id' | 'created_at'>>
        Relationships: []
      }
      points_config: {
        Row: PointsConfigRow
        Insert: PointsConfigRow
        Update: Partial<PointsConfigRow>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      role_level: RoleLevel
      post_status: PostStatus
      judgment_type: Judgment
      point_reason: PointReason
    }
    CompositeTypes: Record<string, never>
  }
}
