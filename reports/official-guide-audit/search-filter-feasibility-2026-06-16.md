# 검색 탭(출처 필터) 구현 가능성 — 조사 결과 (구현 미수행)

> 생성일: 2026-06-16 · read-only 조사. 이번 단계 코드 변경 0. 아래는 "구현한다면" 안.

## 현재 검색 구조

- `src/app/search/page.tsx`: 서버에서 `getRestaurants()`(공개 92곳) 조회 → `SearchClient`(클라이언트)에 props 전달. `revalidate=3600`.
- `src/components/search/SearchClient.tsx`: 전체를 받아 **클라이언트에서 query 토큰 필터**.
  - 검색 필드/가중치: name(10)·mainMenu(6)·category(6)·area(5)·creatorName(5)·programName(5)·episodeTitle(3)·address(2)·sourceTitle(1)·description(1)
  - 동의어 맵 `SYNONYMS`, 핵심필드 AND 매칭(`CORE_FIELDS`)
  - URL `?q=` 동기화(router.replace). **탭/출처 필터 없음**.
  - 결과 없을 때 "출처로 찾기" = /program/[slug] 링크(생활의달인·히밥·쯔양·성시경)
- `getRestaurants()`(목록/검색용)는 **trust_sources 를 조회하지 않음**(getRestaurantBySlug 만 조회).

## 제안 탭 (전체 / 방송 / 미쉐린 / 부산공식 / 유튜브)

| 탭 | 필터 조건 | 데이터 현황 |
|---|---|---|
| 전체 | 필터 없음 | OK |
| 방송 | `sourceType==='tv'` | OK (73곳) |
| 유튜브 | `sourceType==='youtube'` | OK (35곳) |
| 미쉐린 | `sourceType==='guide'` OR trustSources 에 michelin | **부족** (guide 1곳=뫼밀집, trust 0행) |
| 부산공식 | trustSources 에 부산공식 | **없음** (trust 0행) |

## 핵심 판정

- **구조상 구현은 클라이언트 최소 변경으로 가능**(이미 전체 데이터를 받으므로 탭 state + 필터만 추가, DB 변경 불필요).
- **단 미쉐린/부산공식 탭의 데이터가 비어 있음** → 지금 구현하면 빈 탭. `trust_sources` 데이터 입력이 **선행 조건**.
- 다중 출처(방송+미쉐린·방송+부산공식)는 `source_type` 1개로 표현 불가 → trustSources 기반이어야 한 식당이 여러 탭에 동시 노출 가능.

## 최소 구현안 (선행 데이터 확보 후)

1. **데이터 경로**: `getRestaurants()` 가 trust_sources 일괄 조회(`.in('restaurant_id', ids)`) → `Restaurant.trustSources` 채움.
   - 쿼리 1개 증가(N+1 아님). 92곳 규모라 성능 영향 경미.
2. **필터 키 / URL**: `/search?q=<검색어>&tab=all|tv|michelin|busan|youtube`. q 와 tab 동시 적용(AND). tab 기본 all.
3. **변경 예상 파일**:
   - `src/lib/restaurants.ts` (getRestaurants 에 trust_sources 조회 추가)
   - `src/components/search/SearchClient.tsx` (탭 바 + tab state + URL 동기화 + 필터 + SYNONYMS 확장)
   - (선택) `src/types/supabase.ts` trust source_kind 세분(현재 'guide' 만 → 'michelin'/'visitbusan' 구분 시 CHECK ALTER)
4. **모바일 UX**: 탭 5개는 `overflow-x-auto` 가로 스크롤 칩 바 권장(고정 폭 5탭은 360px 에서 과밀). sticky 검색창 아래 배치.
5. **검색어 동의어 확장**(`SYNONYMS`):
   - 미쉐린: `미쉐린`/`미슐랭`/`미쉐린가이드`/`michelin` → 한 토큰. (현재 source_title='미쉐린 가이드' 라 '미쉐린' 은 이미 매칭)
   - 부산공식: `부산의맛`/`부산 미식`/`비짓부산`/`부산공식` → trustSources.source_name 매칭(조회 추가 후).
6. **DB migration**: trust_sources 테이블 **이미 운영 DB 적용(0행)** → 스키마 migration 불필요.
   source_kind 를 michelin/visitbusan 으로 세분하려면 CHECK ALTER(운영 SQL) 필요. 안 하면 'guide' 로 통합 + source_name 으로 구분.
7. **SEO/sitemap**: 검색은 클라이언트 필터라 sitemap 영향 없음. 출처별 SEO 가 필요하면 `/source/michelin` 류 랜딩을 별도 SSG(=program 랜딩 패턴)로 추가 검토.
8. **회귀 위험**: 낮음. 탭 추가는 append 이고 tab=all 기본이라 기존 q 검색 동작 유지. getRestaurants 의 trust 조회는 실패해도 빈 배열 fallback(기존 동작 보존).

## 결론

- 검색 탭은 **데이터(trust_sources) → 코드** 순서. 코드 난도는 낮으나, **미쉐린/부산공식 출처 데이터가 없으면 무의미**.
- 따라서 **다음 단계는 "검색 탭 구현"이 아니라 "출처 데이터 확보·입력"** 이 우선.
  - 확보 가능 즉시 입력분: EXISTING_LINKABLE 10곳 + 뫼밀집 = 11곳 trust_sources(미쉐린/부산공식).
  - 추가 확보 필요: 미쉐린 빕구르망 전체·부산의맛 상호(현재 외부 제약으로 미확보).
