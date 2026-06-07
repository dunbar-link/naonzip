# 나온집 이미지 보강 우선순위 (Phase OPS-G1 · A)

> 생성일: 2026-06-07 · read-only. 공개 식당 중 thumbnail 미보유 60곳을 방송일 최신순(홈/목록 상단 노출 가능성)으로 우선순위화.

## 이미지 현황

| 구분 | 수 |
|---|---:|
| 전체 restaurants | 94 |
| 공개(published) | 78 |
| thumbnail 보유 | 18 |
| thumbnail 미보유(공개) | **60** |

> 보유 18 = 홈 상위 5개(상유십이·할매김밥·원조가야밀면·구로마쯔·금죽헌) + 다리집 + 기존 13곳.

## recommended_action 분포 (60곳)

| action | 수 | 의미 |
|---|---:|---|
| safe_photo_search_candidate | 7 | SAFE 출처(공식/공공) 가능 — 우선 시도 가치 |
| operator_photo_needed | 27 | 공식/공공 출처 없음 — 운영자 사진 필요 |
| keep_fallback_for_now | 12 | 중간 우선순위(2022~2024 또는 노점성) — 당분간 fallback |
| low_priority | 14 | 오래된 방영(2015~2021) — 후순위 |

## 썸네일 보강 우선순위 TOP 20

| priority | slug | 식당명 | 방송일 | 현재 상태 | 추천 조치 |
|---:|---|---|---|---|---|
| 1 | saengdal-jeonpo-toda-park | 토다공원 | 2026-05 | 미보유 | safe_photo_search_candidate(공식SNS) |
| 2 | saengdal-bukgu-shunsaikubo | 슌사이쿠보 화명 | 2026-04 | 미보유 | operator_photo_needed |
| 3 | oneuln-nampo-sammi-jip | 삼미집 | 2026-04 | 미보유 | operator_photo_needed |
| 4 | 2tv-bupyeong-kkang-dwaehu | 깡돼후 | 2026-04 | 미보유 | operator_photo_needed |
| 5 | saengdal-gijang-ilgwangdang | 일광당 | 2026-04 | 미보유 | operator_photo_needed |
| 6 | saengdal-gijang-jeil-bunsik | 제일분식 | 2026-03 | 미보유 | operator_photo_needed |
| 7 | saengdal-gwangalli-jin-doejigomtang | 진돼지곰탕 | 2026-03 | 미보유 | operator_photo_needed |
| 8 | saengdal-centum-bulbaek-gosurak | 불백고수락 센텀본점 | 2026-02 | 미보유 | safe_photo_search_candidate(점주 SNS) |
| 9 | baekban-yeonje-godeungeo-datchi | 고등어다찌 연산본점 | 2026-02 | 미보유 | operator_photo_needed |
| 10 | hanyakbang-gukbap-hyeongje-food | 한약방돼지국밥 형제식품 | 2026-01 | 미보유 | safe_photo_search_candidate(공식SNS) |
| 11 | mulkkong-sikdang | 물꽁식당 | 2025-12 | 미보유 | safe_photo_search_candidate(VisitBusan) |
| 12 | saengdal-haeundae-amisan | 아미산 | 2025-08 | 미보유 | safe_photo_search_candidate(공식홈·최강) |
| 13 | saengdal-namgu-daeyeon-milmyeon | 대연밀면 | 2025-08 | 미보유 | operator_photo_needed |
| 14 | saengdal-yeonje-gukje-milmyeon | 국제밀면 본점 | 2025-08 | 미보유 | operator_photo_needed |
| 15 | baekhwa-yanggopchang-1ho | 백화양곱창 1호 | 2025-07 | 미보유 | operator_photo_needed |
| 16 | sungsik-nampodong-jungang-gomtang | 중앙곰탕 | 2025-07 | 미보유 | operator_photo_needed |
| 17 | saengdal-suyeong-dongyang-sarada-namcheon | 동양사라다 남천본점 | 2025-06 | 미보유 | operator_photo_needed(공식SNS 미검증) |
| 18 | tzuyang-haeundae-ppalgan-tteokbokki | 빨간떡볶이 | 2025-06 | 미보유 | operator_photo_needed |
| 19 | saengdal-ssangdungyi-doejigukbap | 쌍둥이돼지국밥 | 2025-03 | 미보유 | safe_photo_search_candidate(공공) |
| 20 | hibab-cheongsa-hoe-center | 청사포 회센터 | 2025-03 | 미보유 | operator_photo_needed(상호 확인) |

- 전체 60곳 + 추천 조치는 `image-backlog-priority.csv` 참조.
- 우선순위 = 방송일 최신순(홈 "최근 방송 나온집" 및 목록 상단 노출 가능성). 방송일 미상(쯔양/성시경 신규 등)은 하단.
