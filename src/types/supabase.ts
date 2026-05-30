/**
 * Supabase DB 행 타입 (snake_case — DB 컬럼명 그대로)
 */
export type RestaurantRow = {
  id: string
  slug: string
  name: string
  area: string
  address: string
  lat: number
  lng: number
  category: string
  main_menu: string
  price_text: string
  phone: string | null
  thumbnail: string | null
  creator_name: string | null
  program_name: string | null
  episode_title: string | null
  broadcast_date: string | null // ISO date 'YYYY-MM-DD'
  description: string | null
  video_url: string | null
  kakao_map_url: string | null
  naver_map_url: string | null
  tmap_url: string | null
  source_type: 'youtube' | 'tv' | 'sns'
  source_title: string
  is_published: boolean
  created_at: string
}

/**
 * restaurants.source_type 허용 값.
 * DB CHECK 제약 (source_type IN ('youtube','tv','sns')) 과 일치시킬 것.
 * 후보 변환 폼/서버 액션에서 화이트리스트로 공유한다.
 * (candidate_queue 의 'other' 는 restaurant 로 등록할 수 없다.)
 */
export const RESTAURANT_SOURCE_TYPES = ['youtube', 'tv', 'sns'] as const
export type RestaurantSourceType = (typeof RESTAURANT_SOURCE_TYPES)[number]

/**
 * restaurant_reports.status 허용 값.
 * DB CHECK 제약 (restaurant_reports_status_check) 과 일치시킬 것.
 */
export const REPORT_STATUSES = ['pending', 'reviewed', 'applied', 'rejected'] as const
export type ReportStatus = (typeof REPORT_STATUSES)[number]

/**
 * restaurant_reports 행 타입 (정보 수정 제보)
 */
export type RestaurantReportRow = {
  id: string
  restaurant_slug: string
  reason: string
  message: string | null
  status: ReportStatus
  reporter_ip_hash: string | null
  created_at: string
  updated_at: string
}

/**
 * candidate_queue.status 허용 값.
 * DB CHECK 제약 (candidate_queue_status_check) 과 일치시킬 것.
 */
export const CANDIDATE_STATUSES = ['PENDING', 'VERIFIED', 'REJECTED'] as const
export type CandidateStatus = (typeof CANDIDATE_STATUSES)[number]

/**
 * candidate_queue.source_type 허용 값.
 * DB CHECK 제약 (candidate_queue_source_type_check) 과 일치시킬 것.
 */
export const CANDIDATE_SOURCE_TYPES = ['youtube', 'tv', 'sns', 'other'] as const
export type CandidateSourceType = (typeof CANDIDATE_SOURCE_TYPES)[number]

/**
 * candidate_queue 행 타입 (후보 검토 큐)
 */
export type CandidateQueueRow = {
  id: string
  source_type: CandidateSourceType
  source_name: string
  episode_title: string | null
  restaurant_name: string
  area_guess: string | null
  source_url: string | null
  status: CandidateStatus
  confidence_score: number | null
  operator_note: string | null
  created_at: string
  reviewed_at: string | null
}

/**
 * Supabase 전체 DB 스키마 타입
 * createClient<Database>() 에 제네릭으로 사용
 */
export type Database = {
  public: {
    Tables: {
      restaurants: {
        Row: RestaurantRow
        Insert: Omit<RestaurantRow, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<RestaurantRow, 'id' | 'created_at'>>
        Relationships: []
      }
      restaurant_reports: {
        Row: RestaurantReportRow
        Insert: Omit<
          RestaurantReportRow,
          'id' | 'status' | 'reporter_ip_hash' | 'created_at' | 'updated_at'
        > & {
          id?: string
          status?: ReportStatus
          reporter_ip_hash?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<RestaurantReportRow, 'id' | 'created_at'>> & {
          updated_at?: string
        }
        Relationships: []
      }
      candidate_queue: {
        Row: CandidateQueueRow
        Insert: Omit<
          CandidateQueueRow,
          'id' | 'status' | 'created_at' | 'reviewed_at'
        > & {
          id?: string
          status?: CandidateStatus
          created_at?: string
          reviewed_at?: string | null
        }
        Update: Partial<Omit<CandidateQueueRow, 'id' | 'created_at'>>
        Relationships: []
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
