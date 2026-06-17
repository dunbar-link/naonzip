# 검색 출처 탭 구현 결과 (2026-06-16)

> 검색 화면에 출처 필터(전체/방송/미쉐린/부산공식/유튜브) 추가 + 미쉐린 비공개 trust 3건 공개 전환.
> DB: trust_sources is_public UPDATE 3건만. restaurants 무수정. schema/migration 0. 신규 식당 0.

## 탭 판정 규칙

| 탭 | key | 판정 |
|---|---|---|
| 전체 | all | 전체 공개 식당 |
| 방송 | tv | source_type=tv OR appearances 에 tv |
| 미쉐린 | michelin | 공개 trust_sources 중 source_name~'미쉐린'/'michelin' OR url~guide.michelin.com |
| 부산공식 | busan | 공개 trust_sources 중 source_name~'부산의 맛'/'비짓부산' OR url~visitbusan.net |
| 유튜브 | youtube | source_type=youtube OR appearances 에 youtube |

- 미쉐린/부산공식은 `source_kind=guide` 만으로 판정하지 않음(부산의 맛도 guide). 출처명·공식 도메인 사용.
- 다중 출처: 한 식당이 여러 탭에 동시 노출(배타적 아님).

## 탭별 공개 식당 수 (실측)

- 전체 92 / 방송 65 / 미쉐린 4 / 부산공식 11 / 유튜브 28
- 미쉐린 4: 백일평냉·담미옥·해운대 암소갈비집·뫼밀집
- 부산공식 11: 2026 부산의 맛 10 + 비짓부산(해운대 암소갈비집)

## 다중 출처 검증 (preview 실측)

- 백일평냉 → [방송, 미쉐린, 부산공식] (3탭 동시) ✓
- 신발원 → [방송, 부산공식] ✓
- 이재모피자 본점 → [유튜브, 부산공식] ✓
- 뫼밀집 → [미쉐린] ✓

## 기능 검증 (preview dev, localhost:3000)

| 항목 | 결과 |
|---|---|
| 미쉐린 탭 | /search?tab=michelin → 4곳, 탭 활성 '미쉐린' ✓ |
| 부산공식 탭 | /search?tab=busan → 11곳 ✓ |
| 검색어+탭 | /search?q=국밥&tab=busan → 쌍둥이돼지국밥 1곳, 검색창 '국밥' 유지 ✓ |
| 동의어 | /search?q=미슐랭 → 미쉐린 출처 4곳(미슐랭→미쉐린 매칭) ✓ |
| 잘못된 tab fallback | /search?tab=invalidxyz → 전체 + URL 자동 정리(/search) ✓ |
| 기존 검색 회귀 | /search?q=돼지국밥 → 11곳(기존 동작 유지) ✓ |
| 모바일(375px) | 5탭 한 줄, 줄바꿈 없음, 가로 스크롤 동작 ✓ |
| URL 유지/새로고침 | q·tab URLSearchParams 동기화(router.replace) ✓ |

## URL 예시

- /search?tab=all (또는 /search)
- /search?tab=michelin
- /search?tab=busan
- /search?q=밀면&tab=tv
- /search?q=국밥&tab=busan
- 잘못된 tab → all 로 fallback + URL 에서 tab 제거

## 변경 파일

- `src/lib/restaurants.ts`: getRestaurants 에 trust_sources(is_public) 일괄 조회 추가(.in 1쿼리, N+1 아님, 실패 시 빈 맵 fallback)
- `src/lib/sources.ts`: SourceTab/SOURCE_TABS/isSourceTab + isMichelinTrust/isBusanOfficialTrust + restaurantMatchesSourceTab helper
- `src/components/search/SearchClient.tsx`: 출처 탭 바 + tab state + URL 동기화 + 출처명 검색(trustSourceText) + 동의어(미쉐린/부산공식)
- `scripts/publish-michelin-trust-sources.mjs`: 미쉐린 비공개 trust 공개 전환(idempotent)

## 데이터/성능

- DB migration: 0 / 신규 테이블: 0 / source_kind CHECK 변경: 0
- N+1: 없음(공개 식당 + appearances + 공개 trust 각 .in 1쿼리)
- trust 조회 실패 시 검색 깨지지 않음(빈 배열 fallback → 미쉐린/부산공식 탭만 빈 결과)
- restaurants.source_type 무변경(tv 73 / youtube 35 / guide 1)

## 남은 데이터 한계

- 미쉐린: 공개 4곳뿐(빕구르망 전체 20·셀렉티드 미확보, guide.michelin.com 403). 추가 확보 시 미쉐린 탭 풍부해짐.
- 부산공식: 12곳(2026 부산의 맛 146 중 전화 매칭분 + 비짓부산). PDF 한글 상호 미추출분은 미반영.
- 미쉐린 3건 공개 전환은 **공식 URL 정합성(guide.michelin.com 개별 식당 페이지) + 식당명 로마자 일치** 기준.
  403으로 페이지 실존·등급 직접검증은 불가(TRUST-H8 staged import 의 운영자 확인 완료로 간주).
