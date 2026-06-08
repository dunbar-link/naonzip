# TRUST-H4 — 운영 DB 적용용 SQL (restaurant_trust_sources)

> **상태: 운영 DB 미적용.** 아래 SQL 을 운영자가 Supabase SQL Editor 에서 **1회 실행**하면
> 적용된다. 앱 코드는 이미 fallback-safe 로 이 테이블을 조회하므로, 적용 전에는 경고 로그만
> 남기고 기존 출처 칩으로 정상 동작하며, 적용 후 데이터를 넣으면 칩이 자동 노출된다.

## 왜 자동 적용하지 않았나 (TRUST-H4 조사 결과)

- `psql` / `pg_dump` : 로컬 미설치 → 직접 DDL 실행 경로 없음.
- Supabase CLI : 설치돼 있으나 **프로젝트 미링크**(`supabase/config.toml` 없음, access token /
  DB password 미보유) → 안전하게 `db push` 할 수 없음.
- Supabase JS service_role 클라이언트 : PostgREST 라 **DDL(CREATE TABLE) 실행 불가**.
- `.env.local` : 샌드박스 보호로 접근 불가(키/DB URL 비노출). → 연결 문자열 확보 불가.

→ 안전한 자동 적용 수단이 없어 **운영 DB 에 적용하지 않았다.** 아래 수동 실행이 유일하게 안전한 경로다.

## 적용 방법

1. Supabase 대시보드 → 해당 프로젝트 → **SQL Editor**.
2. 아래 블록 전체를 붙여넣고 **Run**. (idempotent — 재실행해도 안전)
3. 이어서 "적용 확인(read-only)" 쿼리로 테이블/정책/인덱스를 확인.

이 블록은 `supabase/schema.sql` 의 `restaurant_trust_sources` 블록과 동일하다.
**기존 테이블 ALTER / 데이터 INSERT·UPDATE·DELETE 는 전혀 없다.** 신규 테이블/정책/인덱스/트리거만 생성한다.

## 실행할 SQL

```sql
-- restaurant_trust_sources (신뢰 출처 — restaurants 1:N)
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

CREATE INDEX IF NOT EXISTS restaurant_trust_sources_restaurant_id_idx
  ON public.restaurant_trust_sources (restaurant_id, is_public);
CREATE INDEX IF NOT EXISTS restaurant_trust_sources_source_kind_idx
  ON public.restaurant_trust_sources (source_kind);

ALTER TABLE public.restaurant_trust_sources
  DROP CONSTRAINT IF EXISTS restaurant_trust_sources_source_kind_check;
ALTER TABLE public.restaurant_trust_sources
  ADD CONSTRAINT restaurant_trust_sources_source_kind_check
  CHECK (source_kind IN ('tv','youtube','guide','local','reservation','blog','operator','other'));

ALTER TABLE public.restaurant_trust_sources ENABLE ROW LEVEL SECURITY;

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

DROP POLICY IF EXISTS "service role has full access on trust sources"
  ON public.restaurant_trust_sources;
CREATE POLICY "service role has full access on trust sources"
  ON public.restaurant_trust_sources
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

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
```

## 적용 확인 (read-only)

```sql
-- 1) 테이블 존재 여부 (NULL 이면 미적용)
SELECT to_regclass('public.restaurant_trust_sources') AS table_exists;

-- 2) row count (적용 직후 0)
SELECT count(*) AS row_count FROM public.restaurant_trust_sources;

-- 3) 인덱스
SELECT indexname FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'restaurant_trust_sources'
ORDER BY indexname;

-- 4) RLS 정책
SELECT policyname, cmd, roles FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'restaurant_trust_sources'
ORDER BY policyname;
```

## 적용 후 앱 동작

- `src/lib/restaurants.ts` `getRestaurantBySlug` 가 이미 `is_public=true` 출처를 조회한다.
  - 적용 전: PostgREST 가 "relation/table 없음" 오류 → **1회 경고 로그** 후 기존 출처 칩 유지.
  - 적용 후(데이터 0): 조회 성공·빈 배열 → 화면 변화 없음.
  - 데이터 입력 후: 공개(`is_public=true`) 출처가 상세페이지 출처 칩 **뒤에** 자동 노출
    (`sources.ts resolveSourceBadges`, append-only, 최대 3개).
- **이번 Phase 는 실제 trust source 데이터를 INSERT 하지 않는다.** 데이터 입력/Admin 입력 UI 는 다음 Phase.

## 주의 / 정책

- 외부 사이트(블루리본/캐치테이블/네이버/카카오/인스타/블로그) **무단 수집·복제 금지**.
  운영자가 **수동 확인**한 값만 입력.
- 외부 이미지 다운로드/재호스팅 금지.
- `"검증 완료" / "믿을 수 있는" / "최고의 맛집"` 등 **과장 신뢰어 금지**.
  `trust_label` 은 사실 관계만(예: `가이드 수록`, `운영자 확인`).
