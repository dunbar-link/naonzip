# 신뢰 출처(trust source) 데이터 구조 — 설계 & 롤아웃 (TRUST-H3)

나온집을 "방송맛집"에서 "출처와 함께 빠르게 판단하는 부산 맛집 큐레이션"으로 확장하기
위해, 운영자가 확인한 **신뢰 출처**(가이드북/로컬추천/예약인기/블로그/운영자확인 등)를
담을 수 있는 데이터 구조를 설계한다. 기존 방송/유튜브 `restaurant_appearances` 를
**대체하지 않고 보완**한다.

> ⚠ 이번 Phase(TRUST-H3)는 **구조만** 준비한다. 운영 DB 에 migration 을 적용하지 않았고,
> 앱은 아직 이 테이블을 query 하지 않는다. 따라서 테이블이 없어도 빌드/런타임은 정상이다.

---

## 1. 테이블: `restaurant_trust_sources`

`supabase/schema.sql` 하단에 idempotent 블록으로 추가됨. (`restaurant_appearances` 패턴 그대로)

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| `id` | uuid PK | `gen_random_uuid()` |
| `restaurant_id` | uuid NOT NULL | `REFERENCES restaurants(id) ON DELETE CASCADE` |
| `source_kind` | text NOT NULL | CHECK: `tv, youtube, guide, local, reservation, blog, operator, other` |
| `source_name` | text NOT NULL | 표시 라벨 (예: `생활의달인`, `블루리본`, `로컬 추천`) |
| `source_url` | text | 출처 URL (선택) |
| `source_title` | text | 출처 제목/회차 등 (선택) |
| `source_note` | text | 운영자 메모 (선택) |
| `trust_label` | text | 짧은 관계 라벨 (예: `가이드 수록`, `운영자 확인`) |
| `verified_at` | date | 운영자 확인일 (선택) |
| `is_public` | boolean NOT NULL default true | 공개 노출 대상 여부 |
| `created_at` | timestamptz NOT NULL default now() | |
| `updated_at` | timestamptz NOT NULL default now() | BEFORE UPDATE 트리거로 자동 갱신 |

**인덱스**: `(restaurant_id, is_public)`, `(source_kind)`
**CHECK**: `source_kind` 화이트리스트 (인라인 + idempotent `ALTER` 재적용)

### RLS (기존 `restaurant_appearances` 정책과 동일 패턴)
- **공개 읽기(anon/authenticated)**: `is_public = true` **그리고** 부모 restaurant 가
  `is_published = true` 인 행만 조회 가능. → 앱은 "공개 식당의 공개 출처"만 본다.
- **service_role**: 전체 접근 (Admin CMS 전용).

## 2. `restaurant_appearances` 와의 관계

- `restaurant_appearances` = **방송/유튜브 출연의 canonical 기록** (대표 방송 선정 로직의 근거).
  이 Phase 에서 **변경·이관·복제하지 않는다.**
- `restaurant_trust_sources` = 그보다 **넓은 신뢰 출처 레이어** (가이드/로컬/예약/블로그/운영자).
  방송/유튜브도 `source_kind = tv|youtube` 로 표현할 수 있으나, 출연 사실 자체는 계속
  appearances 가 담당한다. 두 테이블은 **병행**한다.

## 3. 앱 타입 / resolver 반영 (이번 Phase 구현됨)

- `src/types/supabase.ts`: `TRUST_SOURCE_KINDS`, `TrustSourceKind`, `RestaurantTrustSourceRow`,
  `Database.Tables.restaurant_trust_sources` (Row/Insert/Update).
- `src/types/restaurant.ts`: 앱 타입 `TrustSource`, `Restaurant.trustSources?: TrustSource[]` (선택).
- `src/lib/sources.ts`: `resolveSourceBadges` 가 `restaurant.trustSources` 중 **공개분**을
  기존 방송/유튜브 칩 **뒤에 덧붙인다**(append-only, 중복 제거, 최대 3개). `operator` tone 추가.
- 상세페이지(`/restaurants/[slug]`)는 이미 `resolveSourceBadges(restaurant)` 를 호출하므로,
  `trustSources` 가 채워지는 순간 **코드 변경 없이** 칩이 노출된다(fallback-safe).

현재 `trustSources` 는 어디서도 채워지지 않으므로(undefined) **화면/동작 변화는 없다.**

## 4. migration 적용 방법 (운영 DB)

1. Supabase 대시보드 → SQL Editor.
2. `supabase/schema.sql` 의 `restaurant_trust_sources` 블록을 복사해 실행(1회).
   - 전체 schema.sql 을 재실행해도 idempotent 하므로 안전(`IF NOT EXISTS` / `DROP ... IF EXISTS`).
3. 적용 후에도 앱은 아직 이 테이블을 읽지 않는다 → 즉시 영향 없음.

**리스크**: 신규 테이블 추가 + RLS 정책뿐이라 기존 테이블/데이터에 영향 없음. 롤백은
`DROP TABLE public.restaurant_trust_sources;` (FK CASCADE 로 자식 행만 삭제, restaurants 무관).

## 5. 다음 Phase 로 분리한 범위 (아직 구현 안 함)

> 순서: **migration 적용 → runtime 연동 → admin 입력 → 데이터 입력**. 적용 전에 연동하면
> "relation does not exist" 로 깨지므로 반드시 migration 적용 이후에 진행한다.

1. **runtime 연동**: `src/lib/restaurants.ts` `getRestaurantBySlug` 에서
   `restaurant_trust_sources` 를 `is_public` 조건으로 조회해 `rowToRestaurant` 가
   `trustSources` 를 채운다. 조회는 **try/catch + `?? []` fallback** 으로 감싸
   테이블/네트워크 오류 시 기존 appearances 만 표시되게 한다(`restaurant_appearances`
   조회와 동일 패턴). row→app 매퍼(`trustSourceRowToTrustSource`)를 이때 추가한다.
2. **admin 입력 UI**: `/admin/restaurants/[slug]/edit` 에 trust source CRUD 최소 UI 추가
   (service_role, 운영자 수동 입력). 입력값 검증(`source_kind` 화이트리스트, URL 형식).
3. **상세페이지 리치 표시(선택)**: "어디서 봤나요" 섹션에 `trust_label`/출처 링크를 줄로 표시.

## 6. 데이터/정책 원칙 (변하지 않음)

- 외부 사이트(블루리본/캐치테이블/네이버/카카오/인스타/블로그)를 **무단 수집/대량 복제 금지**.
  운영자가 **수동 확인**한 값만 입력한다.
- 외부 이미지 다운로드/재호스팅 금지.
- 없는 출처를 화면에 있는 것처럼 표시하지 않는다(데이터 없으면 칩도 없음).
- `"검증 완료" / "믿을 수 있는 맛집" / "최고의 맛집"` 같은 **과장 신뢰어 금지**.
  `trust_label` 은 사실 관계만(예: `가이드 수록`, `운영자 확인`).
