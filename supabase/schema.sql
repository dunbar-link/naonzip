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
  source_type   text NOT NULL CHECK (source_type IN ('youtube', 'tv', 'sns', 'guide')),
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
-- restaurants.source_type 화이트리스트 — 'guide'(미쉐린 등 가이드 출처) 추가.
--   - 기존 허용값(youtube/tv/sns) 보존 + guide 추가. 방송 전용 appearances 와 달리
--     restaurants 는 가이드 단독 출처(미쉐린 빕구르망 등)도 등록 가능해야 한다.
--   - 이미 존재하는 운영 DB 에도 안전하게 재적용(idempotent: DROP IF EXISTS → ADD).
-- ─────────────────────────────────────────────
ALTER TABLE public.restaurants
  DROP CONSTRAINT IF EXISTS restaurants_source_type_check;
ALTER TABLE public.restaurants
  ADD CONSTRAINT restaurants_source_type_check
  CHECK (source_type IN ('youtube', 'tv', 'sns', 'guide'));

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
  reviewed_at      timestamptz,
  converted_restaurant_slug text,
  converted_at              timestamptz
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

-- 변환 완료 추적 컬럼 (idempotent) — 이미 테이블이 존재하는 운영 DB 에도 적용.
--   - converted_restaurant_slug: 등록된 restaurants.slug (FK 없음, nullable).
--   - converted_at: 변환 시각.
--   - 둘 다 있으면 "이미 식당으로 등록된 후보" 로 보고 재변환을 차단한다.
ALTER TABLE public.candidate_queue
  ADD COLUMN IF NOT EXISTS converted_restaurant_slug text;
ALTER TABLE public.candidate_queue
  ADD COLUMN IF NOT EXISTS converted_at timestamptz;

-- ─────────────────────────────────────────────
-- restaurant_appearances 테이블 (방송 출연 기록 — 1:N)
--   - 한 식당(restaurants)이 여러 방송/유튜브에 출연할 수 있으므로,
--     방송별 정보를 restaurants 에 비정규화하지 않고 이 테이블에 1건씩 적재한다.
--   - Step 0(dual-write 준비): restaurants 의 기존 방송 컬럼은 유지(drop 금지).
--     이 단계에서는 테이블/RLS/백필만 준비하고, read 경로는 아직 바꾸지 않는다.
--   - idempotent: CREATE TABLE/INDEX IF NOT EXISTS, 정책은 DROP IF EXISTS 후 CREATE.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.restaurant_appearances (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  source_type   text NOT NULL CHECK (source_type IN ('youtube', 'tv', 'sns')),
  source_title  text NOT NULL,
  program_name  text,
  creator_name  text,
  episode_title text,
  broadcast_date date,
  video_url     text,
  candidate_id  uuid,
  note          text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- 인덱스
--   - (restaurant_id, broadcast_date DESC NULLS LAST): 식당별 최신 출연(대표 방송) 조회.
--   - source_type / program_name / creator_name: landing/필터 조회 대비.
CREATE INDEX IF NOT EXISTS restaurant_appearances_restaurant_id_idx
  ON public.restaurant_appearances (restaurant_id, broadcast_date DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS restaurant_appearances_source_type_idx
  ON public.restaurant_appearances (source_type);
CREATE INDEX IF NOT EXISTS restaurant_appearances_program_name_idx
  ON public.restaurant_appearances (program_name);
CREATE INDEX IF NOT EXISTS restaurant_appearances_creator_name_idx
  ON public.restaurant_appearances (creator_name);

-- RLS
ALTER TABLE public.restaurant_appearances ENABLE ROW LEVEL SECURITY;

-- 공개 읽기: 부모 restaurant 가 is_published=true 인 출연만 anon 키로 조회 가능.
--   - restaurants 공개 정책(is_published=true)과 동일한 가시성에 종속시킨다.
DROP POLICY IF EXISTS "appearances of published restaurants are publicly readable"
  ON public.restaurant_appearances;
CREATE POLICY "appearances of published restaurants are publicly readable"
  ON public.restaurant_appearances
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.restaurants r
      WHERE r.id = restaurant_appearances.restaurant_id
        AND r.is_published = true
    )
  );

-- 관리자 전체 접근: service_role 키 (Admin CMS 용).
DROP POLICY IF EXISTS "service role has full access on appearances"
  ON public.restaurant_appearances;
CREATE POLICY "service role has full access on appearances"
  ON public.restaurant_appearances
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────
-- backfill: 기존 restaurants 의 방송 컬럼 → restaurant_appearances 1건씩 복사 (insert-only)
--   - dual-write 전환을 위해 기존 식당마다 "대표 출연" 1개를 만들어 둔다.
--   - restaurants 의 컬럼은 읽기만 한다. UPDATE/DROP 없음.
--   - 중복 실행 안전: (restaurant_id, source_type, source_title, coalesce(video_url,''))
--     조합이 이미 있으면 INSERT 하지 않는다.
--   - source_type/source_title 은 restaurants 에서 NOT NULL 이지만, 방어적으로 NULL/빈값 제외.
-- ─────────────────────────────────────────────
INSERT INTO public.restaurant_appearances
  (restaurant_id, source_type, source_title, program_name, creator_name,
   episode_title, broadcast_date, video_url)
SELECT
  r.id, r.source_type, r.source_title, r.program_name, r.creator_name,
  r.episode_title, r.broadcast_date, r.video_url
FROM public.restaurants r
WHERE r.source_type IS NOT NULL
  AND r.source_title IS NOT NULL
  AND length(btrim(r.source_title)) > 0
  AND NOT EXISTS (
    SELECT 1
    FROM public.restaurant_appearances a
    WHERE a.restaurant_id = r.id
      AND a.source_type = r.source_type
      AND a.source_title = r.source_title
      AND coalesce(a.video_url, '') = coalesce(r.video_url, '')
  );

-- ─────────────────────────────────────────────
-- restaurant_trust_sources 테이블 (신뢰 출처 — restaurants 1:N)  [TRUST-H3]
--   - 운영자가 확인한 "어디서 봤는지" 출처를 담는 그릇.
--     방송/유튜브(appearances)뿐 아니라 가이드(블루리본)·로컬추천·예약인기·블로그·
--     운영자확인 등 폭넓은 신뢰 출처를 1건씩 적재한다.
--   - restaurant_appearances 를 "대체"하지 않고 "보완"한다. 방송 출연의 canonical 기록은
--     계속 restaurant_appearances 가 담당한다(이 테이블로 일괄 이관/복제하지 않는다).
--   - 외부 사이트를 무단 수집/복제하지 않는다. 운영자가 수동 확인한 값만 입력한다.
--   - 공개 노출은 is_public=true 인 행만(부모 restaurant 가 is_published=true 일 때).
--   - idempotent: CREATE ... IF NOT EXISTS, 정책/제약/트리거는 DROP IF EXISTS 후 CREATE.
--   - ⚠ 이 블록은 운영 DB 에 아직 적용하지 않았다(TRUST-H3). Supabase SQL Editor 에서 1회 실행 필요.
--     앱 런타임은 아직 이 테이블을 query 하지 않으므로, 미적용 상태에서도 사이트는 정상 동작한다.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.restaurant_trust_sources (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  source_kind   text NOT NULL
                  CHECK (source_kind IN ('tv','youtube','guide','local','reservation','blog','operator','other')),
  source_name   text NOT NULL,
  source_url    text,
  source_title  text,
  source_note   text,
  trust_label   text,
  verified_at   date,
  is_public     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- 인덱스
--   - (restaurant_id, is_public): 식당별 공개 출처 조회(상세페이지 read 경로 대비).
--   - source_kind: 종류별 필터/집계 대비.
CREATE INDEX IF NOT EXISTS restaurant_trust_sources_restaurant_id_idx
  ON public.restaurant_trust_sources (restaurant_id, is_public);
CREATE INDEX IF NOT EXISTS restaurant_trust_sources_source_kind_idx
  ON public.restaurant_trust_sources (source_kind);

-- source_kind 화이트리스트(인라인 CHECK 의 idempotent 재적용 — 이미 존재하는 운영 DB 대비)
ALTER TABLE public.restaurant_trust_sources
  DROP CONSTRAINT IF EXISTS restaurant_trust_sources_source_kind_check;
ALTER TABLE public.restaurant_trust_sources
  ADD CONSTRAINT restaurant_trust_sources_source_kind_check
  CHECK (source_kind IN ('tv','youtube','guide','local','reservation','blog','operator','other'));

-- RLS
ALTER TABLE public.restaurant_trust_sources ENABLE ROW LEVEL SECURITY;

-- 공개 읽기: is_public=true 이고 부모 restaurant 가 is_published=true 인 출처만 anon 조회 가능.
--   - restaurants/appearances 공개 정책과 동일하게 "공개 식당" 가시성에 종속시킨다.
--   - 추가로 is_public=false(운영자 비공개 메모성 출처)는 anon 에게 보이지 않는다.
DROP POLICY IF EXISTS "public trust sources of published restaurants are readable"
  ON public.restaurant_trust_sources;
CREATE POLICY "public trust sources of published restaurants are readable"
  ON public.restaurant_trust_sources
  FOR SELECT
  TO anon, authenticated
  USING (
    is_public = true
    AND EXISTS (
      SELECT 1
      FROM public.restaurants r
      WHERE r.id = restaurant_trust_sources.restaurant_id
        AND r.is_published = true
    )
  );

-- 관리자 전체 접근: service_role 키 (Admin CMS 용).
DROP POLICY IF EXISTS "service role has full access on trust sources"
  ON public.restaurant_trust_sources;
CREATE POLICY "service role has full access on trust sources"
  ON public.restaurant_trust_sources
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- updated_at 자동 갱신 trigger (재실행 안전)
CREATE OR REPLACE FUNCTION public.restaurant_trust_sources_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS restaurant_trust_sources_set_updated_at_trigger
  ON public.restaurant_trust_sources;
CREATE TRIGGER restaurant_trust_sources_set_updated_at_trigger
  BEFORE UPDATE ON public.restaurant_trust_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.restaurant_trust_sources_set_updated_at();
