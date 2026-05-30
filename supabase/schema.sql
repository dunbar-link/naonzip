-- ============================================================
-- 나온집 (naonzip) — restaurants 테이블 스키마
-- Supabase SQL Editor 에서 실행 후 seed.sql 을 실행한다.
-- ============================================================

-- uuid 확장 (Supabase 기본 활성화 상태)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────
-- restaurants 테이블
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.restaurants (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text NOT NULL UNIQUE,
  name          text NOT NULL,
  area          text NOT NULL,
  address       text NOT NULL,
  lat           double precision NOT NULL,
  lng           double precision NOT NULL,
  category      text NOT NULL,
  main_menu     text NOT NULL,
  price_text    text NOT NULL,
  phone         text,
  thumbnail     text,
  creator_name  text,
  program_name  text,
  episode_title text,
  broadcast_date date,
  description   text,
  video_url     text,
  kakao_map_url text,
  naver_map_url text,
  tmap_url      text,
  source_type   text NOT NULL CHECK (source_type IN ('youtube', 'tv', 'sns')),
  source_title  text NOT NULL,
  is_published  boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- 인덱스
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS restaurants_slug_idx        ON public.restaurants (slug);
CREATE INDEX IF NOT EXISTS restaurants_area_idx        ON public.restaurants (area);
CREATE INDEX IF NOT EXISTS restaurants_is_published_idx ON public.restaurants (is_published);

-- ─────────────────────────────────────────────
-- RLS (Row Level Security)
-- ─────────────────────────────────────────────
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

-- 공개 읽기: is_published = true 인 행만 anon 키로 조회 가능
CREATE POLICY "published restaurants are publicly readable"
  ON public.restaurants
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

-- 관리자 전체 접근: service_role 키 (Admin CMS 용)
CREATE POLICY "service role has full access"
  ON public.restaurants
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────
-- restaurant_reports 테이블 (정보 수정 제보)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.restaurant_reports (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_slug text NOT NULL,
  reason          text NOT NULL,
  message         text,
  status          text NOT NULL DEFAULT 'pending',
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS restaurant_reports_slug_idx       ON public.restaurant_reports (restaurant_slug);
CREATE INDEX IF NOT EXISTS restaurant_reports_created_at_idx ON public.restaurant_reports (created_at DESC);

ALTER TABLE public.restaurant_reports ENABLE ROW LEVEL SECURITY;

-- anon: INSERT 만 허용 (SELECT/UPDATE/DELETE 차단). 길이/상태 제약.
CREATE POLICY "anon can submit reports"
  ON public.restaurant_reports
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(restaurant_slug) BETWEEN 1 AND 200
    AND length(reason) BETWEEN 1 AND 50
    AND (message IS NULL OR length(message) <= 1000)
    AND status = 'pending'
  );

-- 관리자 전체 접근
CREATE POLICY "service role has full access on reports"
  ON public.restaurant_reports
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────
-- restaurant_reports 보강 (idempotent ALTER 블록)
--   - updated_at 컬럼 + 자동 갱신 trigger
--   - status CHECK 제약 (pending/reviewed/applied/rejected)
-- 기존 운영 row 가 있어도 안전하게 재실행 가능하도록 작성.
-- ─────────────────────────────────────────────

-- updated_at 컬럼 추가 (없으면 기본값 now() 로 백필)
ALTER TABLE public.restaurant_reports
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- status 허용 값 화이트리스트
ALTER TABLE public.restaurant_reports
  DROP CONSTRAINT IF EXISTS restaurant_reports_status_check;
ALTER TABLE public.restaurant_reports
  ADD CONSTRAINT restaurant_reports_status_check
  CHECK (status IN ('pending', 'reviewed', 'applied', 'rejected'));

-- reporter IP 해시 (spam rate-limit 용).
--   - 원문 IP 는 저장하지 않고 SHA-256 hash 만 보관 (개인정보 부담 최소화).
--   - NULL 허용: 기존 row / IP 미상 요청 대응.
ALTER TABLE public.restaurant_reports
  ADD COLUMN IF NOT EXISTS reporter_ip_hash text;

-- (reporter_ip_hash, restaurant_slug, created_at DESC) 복합 인덱스
--   → 동일 IP해시 + 동일 slug 의 최근 신고 count 조회(rate-limit)를 최적화.
CREATE INDEX IF NOT EXISTS restaurant_reports_reporter_ip_hash_slug_created_at_idx
  ON public.restaurant_reports (reporter_ip_hash, restaurant_slug, created_at DESC);

-- updated_at 자동 갱신 trigger function (재실행 안전)
CREATE OR REPLACE FUNCTION public.restaurant_reports_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- BEFORE UPDATE trigger 재설치
DROP TRIGGER IF EXISTS restaurant_reports_set_updated_at_trigger ON public.restaurant_reports;
CREATE TRIGGER restaurant_reports_set_updated_at_trigger
  BEFORE UPDATE ON public.restaurant_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.restaurant_reports_set_updated_at();

-- ─────────────────────────────────────────────
-- candidate_queue 테이블 (후보 검토 큐 MVP)
--   - 외부 소스(youtube/tv/sns)에서 수집한 식당 후보를 운영자가 검토/마킹.
--   - 승인(VERIFIED)은 단순 상태 마킹일 뿐, restaurant 자동 등록은 하지 않는다.
--   - idempotent: 모든 정책/트리거는 DROP IF EXISTS 후 CREATE.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.candidate_queue (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type      text NOT NULL CHECK (source_type IN ('youtube', 'tv', 'sns', 'other')),
  source_name      text NOT NULL,
  episode_title    text,
  restaurant_name  text NOT NULL,
  area_guess       text,
  source_url       text,
  status           text NOT NULL DEFAULT 'PENDING'
                     CHECK (status IN ('PENDING', 'VERIFIED', 'REJECTED')),
  confidence_score numeric(4,3) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  operator_note    text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  reviewed_at      timestamptz
);

CREATE INDEX IF NOT EXISTS candidate_queue_status_idx     ON public.candidate_queue (status);
CREATE INDEX IF NOT EXISTS candidate_queue_created_at_idx ON public.candidate_queue (created_at DESC);

ALTER TABLE public.candidate_queue ENABLE ROW LEVEL SECURITY;

-- 관리자 전체 접근: service_role 키 (Admin CMS 용). anon 정책 없음.
DROP POLICY IF EXISTS "service role has full access on candidate_queue" ON public.candidate_queue;
CREATE POLICY "service role has full access on candidate_queue"
  ON public.candidate_queue
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- status 가 PENDING → 다른 값으로 바뀔 때 reviewed_at = now() 자동 기록.
--   - OLD.status = 'PENDING' 조건으로 최초 1회만 기록 (재마킹 시 덮어쓰지 않음).
CREATE OR REPLACE FUNCTION public.candidate_queue_set_reviewed_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status = 'PENDING' AND NEW.status <> 'PENDING' THEN
    NEW.reviewed_at := now();
  END IF;
  RETURN NEW;
END;
$$;

-- BEFORE UPDATE trigger 재설치
DROP TRIGGER IF EXISTS candidate_queue_set_reviewed_at_trigger ON public.candidate_queue;
CREATE TRIGGER candidate_queue_set_reviewed_at_trigger
  BEFORE UPDATE ON public.candidate_queue
  FOR EACH ROW
  EXECUTE FUNCTION public.candidate_queue_set_reviewed_at();

-- source_type CHECK 확장 ('other' 추가) — 이미 테이블이 존재하는 운영 DB 에도 적용.
--   - 인라인 정의의 자동 명명 제약(candidate_queue_source_type_check)을 DROP 후 재생성.
--   - idempotent: DROP IF EXISTS → ADD.
ALTER TABLE public.candidate_queue
  DROP CONSTRAINT IF EXISTS candidate_queue_source_type_check;
ALTER TABLE public.candidate_queue
  ADD CONSTRAINT candidate_queue_source_type_check
  CHECK (source_type IN ('youtube', 'tv', 'sns', 'other'));
