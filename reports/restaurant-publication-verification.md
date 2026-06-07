# 나온집 신규 10곳 공개 전환 검증 (Phase DATA-F4)

> 생성일: 2026-06-07 · preflight(read-only) 전부 통과 → **10곳만 is_published true 전환** → 공개 후 재검증.
> 허용된 DB 변경: 대상 10개 restaurants의 is_published false→true (정확히 10행). 그 외 INSERT/DELETE/Storage/공개전환 없음.

## 요약

- 작업 결과: **10곳 공개 전환 완료** ✓
- preflight 존재 확인: 10/10 (수타혜미칼국수 재등록 확인됨)
- preflight 좌표: 10/10 부산 범위 + 권역 일치
- preflight 필드: 10/10 필수필드 정상
- preflight 중복: 0 (slug/name/address unique)
- preflight 방송정보: 10/10 source_title + appearance 1건 + video_url 존재
- 공개 전환: is_published false→true, **UPDATE 영향 행 = 10** (정확히 대상만)
- 공개 후 상태: 10곳 전부 is_published=true
- 공개 수 변화: **69 → 79 (+10)**, total 94 불변
- 공개 URL: 10곳 전부 200 (전환 전 404 → 전환 후 200)
- 목록 반영: 클린 빌드 후 "방송맛집 79곳" 확인
- thumbnail 상태: 10곳 전부 이미지 미보유(공개에는 지장 없음, 별도 IMG Phase 권장)
- DB 변경: is_published 전환만 (10행)
- Storage 변경: 없음
- 앱 코드 변경: 없음
- tsc: 0 / build: 성공(정적 199페이지)
- 최종 판단: **A. 10개 공개 완료, 지인 공유 테스트 가능**

---

## 1. 공개 전환 대상 요약

| status | slug | 식당명 | before | after | 필드 | 좌표 | 중복 | 방송정보 | 공개URL | 비고 |
|---|---|---|---|---|---|---|---|---|---|---|
| published | sungsik-gwangalli-haejin-anago | 해진아나고 | false | true | ok | ok | unique | ok(1) | 200 | 방영일 보완 |
| published | sungsik-gwangalli-manujang | 만우장 | false | true | ok | ok | unique | ok(1) | 200 | kakao URL 자동생성 |
| published | tzuyang-gwangalli-darijip | 다리집 | false | true | ok | ok | unique | ok(1) | 200 | 방영일 보완 |
| published | tzuyang-haeundae-sanggukine | 상국이네 | false | true | ok | ok | unique | ok(1) | 200 | 방영일 보완 |
| published | tzuyang-yeongdo-dongbang-milmyeon | 동방밀면 | false | true | ok | ok | unique | ok(1) | 200 | 방영일 보완 |
| published | tzuyang-yeongdo-dongsamdong-buljjampong | 동삼동불짬뽕 | false | true | ok | ok | unique | ok(1) | 200 | 가격 재확인 권장 |
| published | jeonhyun-namgu-suta-hyemi-kalguksu | 수타혜미칼국수 | false | true | ok | ok | unique | ok(1) | 200 | 재등록 후 공개 |
| published | saengdal-gwangalli-boulangerie-lassence | 블랑제리 라센 | false | true | ok | ok | unique | ok(1) | 200 | program_name·방영일 보유 |
| published | tzuyang-gangseo-samseong-galmijogae | 삼성갈미조개 | false | true | ok | ok | unique | ok(1) | 200 | area 기타(강서/명지) |
| published | tzuyang-seomyeon-dongchuni-mandu | 동춘이만두 | false | true | ok | ok | unique | ok(1) | 200 | area 서면(부산진/당감) |

---

## 2. 수타혜미칼국수 재등록 확인

- 존재 여부: ✅ DB 존재 (DATA-F3에서 missing이던 항목, 운영자 재등록 확인)
- 좌표: lat 35.143025, lng 129.065121 → 남구/문현 권역 일치 ✓
- 필수필드: 전부 채워짐 (area 남구, category 분식/길거리, 주소·대표메뉴·가격대·source_type·source_title)
- 방송정보: tv / 전현무계획2, 에피소드 "9회 부산편", 방영일 2024-12-13, appearance 1건, kakao place URL 보유
- 공개 전환 여부: ✅ false→true (200 확인)

---

## 3. 공개 수 변화

- 공개 전 식당 수: **69**
- 공개 후 식당 수: **79**
- 증가분: **+10** (정확히 대상 10곳만)
- 전체 restaurants 수: **94** (전환 전후 불변 — INSERT/DELETE 없음)

---

## 4. 공개 URL 검증 (로컬 next start 실측)

| slug | expected | actual | result |
|---|---|---|---|
| sungsik-gwangalli-haejin-anago | 200 | 200 | ✓ |
| sungsik-gwangalli-manujang | 200 | 200 | ✓ |
| tzuyang-gwangalli-darijip | 200 | 200 | ✓ |
| tzuyang-haeundae-sanggukine | 200 | 200 | ✓ |
| tzuyang-yeongdo-dongbang-milmyeon | 200 | 200 | ✓ |
| tzuyang-yeongdo-dongsamdong-buljjampong | 200 | 200 | ✓ |
| jeonhyun-namgu-suta-hyemi-kalguksu | 200 | 200 | ✓ |
| saengdal-gwangalli-boulangerie-lassence | 200 | 200 | ✓ |
| tzuyang-gangseo-samseong-galmijogae | 200 | 200 | ✓ |
| tzuyang-seomyeon-dongchuni-mandu | 200 | 200 | ✓ |

- 전환 전(DATA-F3): 전부 404 → 전환 후: 전부 200. `getRestaurantBySlug`가 is_published=true만 조회하므로 공개 후 정상 노출.

---

## 5. 목록/지도/검색 반영

- 목록: ✅ 클린 빌드 후 "방송맛집 **79곳**" 확인 (공개 79 정확 반영).
- 지도: 데이터층 반영 — 10곳 전부 부산 권역 좌표 보유 → 공개 시 마커 표시 대상. (지도는 브라우저 Kakao SDK 렌더라 curl 검증 불가, 좌표/공개상태로 확인)
- 검색: 데이터층 반영 — /search 가 공개 79곳을 로드 → 식당명 검색 대상에 포함. (검색은 클라이언트 렌더라 curl 직접 검증 불가, 데이터로 확인)
- 홈: 홈 "최근 방송 나온집"은 **방송일 최신순 5개** — 신규 10곳은 방영일이 null/2024라 기존 2025~2026 항목에 밀려 상위 5에 안 들 수 있음(정상 동작).
- **캐시 주의(중요)**: 첫 빌드에서는 목록 h1이 69로 표시됐는데, 이는 Next의 `.next/cache` 데이터 캐시가 공개 전 getRestaurants 결과를 재사용한 잔재였음. 캐시를 비우고 클린 빌드하니 79로 정상 표시됨. → **운영 배포(CI 클린 빌드) 또는 ISR revalidate(1시간) 후 production에도 79로 반영됨.** (DB는 이미 79 확정)

---

## 6. 썸네일 상태

| slug | 식당명 | thumbnail | note |
|---|---|---|---|
| (10곳 전부) | — | 없음(null) | 이미지 미보유 — 공개에는 지장 없음(카드/상세 fallback). 별도 IMG Phase로 보강 권장 |

---

## 7. 생성/수정 파일

| 파일 | 내용 |
|---|---|
| reports/restaurant-publication-verification.md | 공개 전환 검증 리포트(preflight·전환·공개수·URL·반영) |
| reports/restaurant-publication-verification.csv | 14컬럼, 10행(전부 published) |

---

## 8. 검증 결과

- npx tsc --noEmit: 에러 0
- npm run build: 성공 (정적 199페이지, exit 0) — 179→199(+20=신규 10 상세+OG)
- git diff --stat: reports 2개 (신규)
- git status --short: reports 2개 외 변경 없음 (앱/이미지/env/package/schema 무변경)

> DB 변경은 대상 10개 restaurants의 is_published 전환만 수행(허용 범위). 임시 검증 스크립트는 실행 후 삭제(repo 미반영).

---

## 9. 다음 작업 제안

- **A. 신규 10곳 썸네일 이미지 보강 Phase** (현재 10곳 전부 이미지 미보유 — 가장 임팩트 큼).
- 병행 가능: 방영일 null 7곳·youtube creator_name 6곳 보완(선택, 노출 품질↑).
- 이후 **C. 친구 공유 테스트** 진행 가능.

---

## 10. 최종 판단

A. 10개 공개 완료, 지인 공유 테스트 가능 — preflight 전부 통과, 정확히 10곳만 공개(69→79), 상세 URL 200, 목록 79곳 확인. 이미지·방영일은 공개 후 점진 보완 권장(공개 차단 요인 아님).
