# 나온집 quick-register 등록 검증 (Phase DATA-F3)

> 생성일: 2026-06-07 · read-only 검증. **DB INSERT/UPDATE/DELETE·Storage·공개전환 없음(SELECT만).**
> 대상: DATA-F2 ready 10곳. 결과: **9곳 등록 확인(전부 비공개·정상), 1곳 미등록(수타혜미칼국수).**

## 요약

- 검증 대상: 10 slug
- 존재 확인: **9/10** (수타혜미칼국수 미존재)
- 비공개(is_published=false): 등록된 9곳 **전부 ✓**
- 좌표 정상: 9곳 전부 부산 범위 + 권역 일치 (coordinate_status=ok)
- 좌표 검토 필요: 0
- 중복: 0 (slug/name/address 전부 unique)
- 필드 정상: 9곳 전부 필수필드(area·category·address·main_menu·price_text·source_type·source_title) 채워짐
- 공개 URL: 9곳 + 미등록 1곳 전부 404(정상), 대조군(기존 공개) 200
- DB 총 행수: 93 (DATA-F1 시점 84 + 신규 9)
- 미등록: 1 (수타혜미칼국수) → 재등록 필요

> 특이점: ADMIN-F1의 "주소로 좌표 찾기"가 잘 동작 — 9곳 중 8곳은 Kakao 장소 URL(place.map.kakao.com)까지 자동 저장됐고, DATA-F2에서 좌표를 못 잡았던 삼성갈미조개(오구간)·동춘이만두(무결과)도 정확한 권역 좌표로 등록됨.

---

## 1. 10개 등록 검증 요약

| status | slug | 식당명 | published | 좌표 | 필드 | 중복 | 비고 |
|---|---|---|---|---|---|---|---|
| pass | sungsik-gwangalli-haejin-anago | 해진아나고 | false ✓ | ok | ok | unique | 방영일 보완 필요, 이미지 미보유 |
| pass | sungsik-gwangalli-manujang | 만우장 | false ✓ | ok | ok | unique | kakao URL 비어있음(좌표 자동생성), 이미지 미보유 |
| pass | tzuyang-gwangalli-darijip | 다리집 | false ✓ | ok | ok | unique | 방영일 보완 필요, 이미지 미보유 |
| pass | tzuyang-haeundae-sanggukine | 상국이네 | false ✓ | ok | ok | unique | 방영일 보완 필요, 이미지 미보유 |
| pass | tzuyang-yeongdo-dongbang-milmyeon | 동방밀면 | false ✓ | ok | ok | unique | 방영일 보완 필요, 이미지 미보유 |
| pass | tzuyang-yeongdo-dongsamdong-buljjampong | 동삼동불짬뽕 | false ✓ | ok | ok | unique | 방영일 보완 필요, 가격 재확인 권장 |
| pass | saengdal-gwangalli-boulangerie-lassence | 블랑제리 라센 | false ✓ | ok | ok | unique | program_name·방영일 보유, 이미지 미보유 |
| pass | tzuyang-gangseo-samseong-galmijogae | 삼성갈미조개 | false ✓ | ok | ok | unique | 방영일 보완 필요, 이미지 미보유 |
| pass | tzuyang-seomyeon-dongchuni-mandu | 동춘이만두 | false ✓ | ok | ok | unique | 방영일 보완 필요, 이미지 미보유 |
| **missing** | jeonhyun-namgu-suta-hyemi-kalguksu | 수타혜미칼국수 | — | — | — | — | **DB에 없음 → 재등록 필요** |

---

## 2. 좌표 검증

| slug | 식당명 | lat | lng | coordinate_status | note |
|---|---|---:|---:|---|---|
| sungsik-gwangalli-haejin-anago | 해진아나고 | 35.166280 | 129.113921 | ok | 광안/수영 권역 일치 |
| sungsik-gwangalli-manujang | 만우장 | 35.158507 | 129.114813 | ok | 광안/수영 권역 일치 |
| tzuyang-gwangalli-darijip | 다리집 | 35.146500 | 129.110687 | ok | 광안/수영(남천) 권역 일치 |
| tzuyang-haeundae-sanggukine | 상국이네 | 35.162016 | 129.162877 | ok | 해운대 권역 일치 |
| tzuyang-yeongdo-dongbang-milmyeon | 동방밀면 | 35.086684 | 129.043439 | ok | 영도 권역 일치 |
| tzuyang-yeongdo-dongsamdong-buljjampong | 동삼동불짬뽕 | 35.077849 | 129.068051 | ok | 영도 권역 일치 |
| saengdal-gwangalli-boulangerie-lassence | 블랑제리 라센 | 35.150353 | 129.112123 | ok | 광안/수영 권역 일치 |
| tzuyang-gangseo-samseong-galmijogae | 삼성갈미조개 | 35.101555 | 128.929184 | ok | 강서/명지 권역 일치 |
| tzuyang-seomyeon-dongchuni-mandu | 동춘이만두 | 35.164055 | 129.038947 | ok | 부산진/당감 권역 일치 |

- 기준: lat 34.8~35.5, lng 128.7~129.5 + 권역별 대략 범위(태스크 §7). 9곳 전부 부산 범위 및 권역 일치.
- 0,0/빈값/범위이탈/권역불일치 없음. **자동 수정하지 않음.**

---

## 3. 필드 검증

| slug | 식당명 | 비어 있는 주요(필수) 필드 | 비어 있는 보조 필드 | 보완 필요 여부 |
|---|---|---|---|---|
| sungsik-gwangalli-haejin-anago | 해진아나고 | 없음 | thumbnail, broadcast_date, program_name, creator_name | 방영일·이미지·creator 보완 권장(선택) |
| sungsik-gwangalli-manujang | 만우장 | 없음 | kakao_map_url, thumbnail, program_name, creator_name | 이미지·creator 보완 권장(선택) |
| tzuyang-gwangalli-darijip | 다리집 | 없음 | thumbnail, broadcast_date, program_name, creator_name | 방영일·이미지·creator(쯔양) 보완 권장(선택) |
| tzuyang-haeundae-sanggukine | 상국이네 | 없음 | thumbnail, broadcast_date, program_name, creator_name | 방영일·이미지·creator 보완 권장(선택) |
| tzuyang-yeongdo-dongbang-milmyeon | 동방밀면 | 없음 | thumbnail, broadcast_date, program_name, creator_name | 방영일·이미지·creator 보완 권장(선택) |
| tzuyang-yeongdo-dongsamdong-buljjampong | 동삼동불짬뽕 | 없음 | thumbnail, broadcast_date, program_name, creator_name | 방영일·이미지·creator 보완 권장(선택) |
| saengdal-gwangalli-boulangerie-lassence | 블랑제리 라센 | 없음 | thumbnail, creator_name | 이미지 보완 권장(선택) |
| tzuyang-gangseo-samseong-galmijogae | 삼성갈미조개 | 없음 | thumbnail, broadcast_date, program_name, creator_name | 방영일·이미지·creator 보완 권장(선택) |
| tzuyang-seomyeon-dongchuni-mandu | 동춘이만두 | 없음 | thumbnail, broadcast_date, program_name, creator_name | 방영일·이미지·creator 보완 권장(선택) |

- 필수 필드는 9곳 전부 채워짐(등록 자체가 필수필드 검증을 통과). 비어 있는 항목은 모두 **보조(선택)** 필드.
- broadcast_date null: DATA-F2에서 방영일이 연도(2024)·연-월(2025-07)뿐이던 후보들 → ADMIN-F1 파서가 임의 날짜를 만들지 않고 비운 정상 동작(= "방영일 보완 필요").
- thumbnail null: 9곳 전부 이미지 미보유(별도 IMG Phase 권장).
- youtube 6곳은 creator_name 비어있음(source_title=성시경의 먹을텐데/쯔양은 채워짐). 공개 전 creator_name 보완 시 노출 품질↑(선택).
- 방송/링크 저장 구조: restaurants 컬럼(source_type/source_title/program_name/creator_name/episode_title/broadcast_date/video_url) + restaurant_appearances **dual-write 확인(각 1건)**. source_type 전부 유효(youtube/tv), source_title 전부 존재.

---

## 4. 중복 검증

| slug | 식당명 | duplicate_status | note |
|---|---|---|---|
| (9곳 전부) | — | unique | slug exact·name(정규화)·address(정규화) 중복 없음. 기존 공개 식당과도 사실상 동일 식당 없음 |

- 검사: slug exact / name exact·normalized / address exact·normalized / 전체 93행 대비 스캔.
- 결과: 등록된 9곳 모두 고유. duplicate_review 0건.

---

## 5. 공개 URL 검증 (로컬 next start 실측 + 코드 확인)

| slug | expected | actual | result |
|---|---|---|---|
| sungsik-gwangalli-haejin-anago | 404 | 404 | ✓ |
| sungsik-gwangalli-manujang | 404 | 404 | ✓ |
| tzuyang-gwangalli-darijip | 404 | 404 | ✓ |
| tzuyang-haeundae-sanggukine | 404 | 404 | ✓ |
| tzuyang-yeongdo-dongbang-milmyeon | 404 | 404 | ✓ |
| tzuyang-yeongdo-dongsamdong-buljjampong | 404 | 404 | ✓ |
| saengdal-gwangalli-boulangerie-lassence | 404 | 404 | ✓ |
| tzuyang-gangseo-samseong-galmijogae | 404 | 404 | ✓ |
| tzuyang-seomyeon-dongchuni-mandu | 404 | 404 | ✓ |
| jeonhyun-namgu-suta-hyemi-kalguksu (미등록) | 404 | 404 | ✓ |
| (대조군) saengdal-ssangdungyi-doejigukbap (기존 공개) | 200 | 200 | ✓ |

- 비공개(is_published=false)는 `getRestaurantBySlug`가 `is_published=true`만 조회 → null → 상세 페이지 `notFound()` → 404 (코드 확인 + 실측 일치).
- unexpected_public(비공개인데 200) 0건.

---

## 6. reports 생성

| 파일 | 내용 |
|---|---|
| reports/restaurant-registration-verification.md | 본 검증 리포트(요약·좌표·필드·중복·공개URL) |
| reports/restaurant-registration-verification.csv | 18컬럼, 10행(pass 9 + missing 1) |

---

## 7. 운영자 조치 권장

1. **재등록(필수)**: 수타혜미칼국수(jeonhyun-namgu-suta-hyemi-kalguksu) — DATA-F2 빠른등록 블록으로 다시 등록. 등록 후 "주소로 좌표 찾기"(부산 남구 문현금융로 4)로 좌표 채우기.
2. **공개 전환(가능)**: 등록된 9곳은 검증 통과 → 비공개에서 공개로 전환 가능. (전환 전 방영일/creator_name/이미지 보완은 선택)
3. **선택 보완**: 방영일 null 7곳은 정확한 방송일 확인 시 입력, youtube 6곳 creator_name(쯔양/성시경) 입력, 썸네일 이미지 보강(IMG Phase).
