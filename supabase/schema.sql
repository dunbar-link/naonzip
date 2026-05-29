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
