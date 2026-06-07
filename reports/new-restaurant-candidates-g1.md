# 나온집 신규 방송맛집 후보 2차 (Phase DATA-G1)

> 생성일: 2026-06-07 · read-only 조사. **DB INSERT/UPDATE·Storage 없음.** 좌표 추정 금지(전 후보 좌표 비움 → 등록 시 Admin 지오코딩).
> 기존 94곳 + candidate_queue 26건과 중복 제거 후 신규 후보 18곳.

## 요약

- 조사 후보 수: **18곳** (기존 94곳과 비중복)
- ready_to_register: **11**
- needs_geocoding: **2**
- needs_review: **4**
- duplicate(_review): **1** (해동횟집 ↔ 기존 '기장 멸치쌈밥' 동일 가능성)
- excluded(조사 중 규칙상 제외): 양인제과(광주=부산 외), 히밥 부산편(상호 미공개), 자갈치 꼼장어(상호 불확실), namu.wiki 차단 회차 등
- 빠른등록 블록: ready 11 + needs_geocoding 2 = **13곳 즉시 등록 가능**(좌표만 지오코딩)

> 조사 프로그램: 전현무계획2 · 2TV 생생정보 · 생활의 달인 · 식객 허영만의 백반기행 · 쯔양 · 안성재 셰프 유튜브. (생방송투데이/맛녀석/한밥/성시경/또간집은 신규 0 또는 기존 중복)

---

## 1. 후보 요약

| status | slug | 식당명 | 지역 | 카테고리 | 출처 | 중복 | 비고 |
|---|---|---|---|---|---|---|---|
| ready | jeonhyun-gwangalli-biwa-suljan | 비와술잔 | 광안리 | 일식 | 전현무계획2(채널S YT) | unique | DATA-F1 재수집 |
| ready | jeonhyun-yeongdo-watda-sikdang | 왔다식당 | 영도 | 고기 | 전현무계획2(국제뉴스) | unique | 스지수육 |
| ready | jeonhyun-gwangalli-yeonhap-hoejip | 연합횟집 | 광안리 | 회 | 전현무계획2(국제뉴스) | unique | 세로썰기 회 |
| ready | jeonhyun-nampo-yeosongje | 여송제 | 남포동 | 한식 | 전현무계획2(국제뉴스) | unique | DATA-F1 재수집 |
| ready | jeonhyun-nampo-mullebanga-jeukseokgui | 물레방아 즉석구이 | 남포동 | 고기 | 전현무계획2(채널S YT) | unique | 안금무 |
| ready | 2tv-sasang-yeonghui-halmae-jaecheopguk | 영희할매재첩국 | 사상 | 한식 | 2TV 생생정보(KBS YT) | unique | 재첩국 |
| ready | baekban-seogu-yetnal-guksujip | 옛날국수집 | 기타(서구) | 분식 | 백반기행 242회 | unique | 아미동 국수 |
| ready | baekban-nampo-subok-centa | 수복센타 | 남포동 | 한식 | 백반기행 4회 | unique | 2019, 영업중 |
| ready | tzuyang-nampo-ijaemo-pizza | 이재모피자 본점 | 남포동 | 양식 | 쯔양 | unique | 오픈런 피자 |
| ready | tzuyang-haeundae-chopilsal | 초필살돼지구이 해운대본점 | 해운대 | 고기 | 쯔양 2022 | unique | 돼지껍데기 |
| ready | ansungjae-yeonje-mapobonga | 마포본가 | 연제 | 고기 | 안성재 셰프 YT(부산일보) | unique | 돼지갈비 |
| needs_geocoding | saengdal-gwangalli-baegil-pyeongnaeng | 백일평냉 | 광안리 | 한식 | 생활의 달인 2025-07 | unique | 평양냉면, 가격 미확인 |
| needs_geocoding | saengdal-seomyeon-dammiok | 담미옥 | 서면 | 한식 | 생활의 달인 2025-07 | unique | 평양냉면, 가격 미확인 |
| needs_review | 2tv-seomyeon-donje | 돈제이 부산서면점 | 서면 | 고기 | 2TV 생생정보 2025-11 | unique | 기사 상호 마스킹→확인 |
| needs_review | 2tv-gijang-suhyang-agujjim | 수향아구찜 | 기장 | 해산물 | 2TV 생생정보 2025-08 | unique | 기사 상호 마스킹→확인 |
| needs_review | 2tv-yeongdo-baekseol-daehak | 백설대학 | 영도 | 분식 | 2TV 생생정보 | unique | 방영일 미확인 |
| needs_review | baekban-nampo-hanwol-sikdang | 한월식당 | 남포동 | 한식 | 백반기행 4회 | unique | 2019, 블로그 출처 |
| duplicate_review | baekban-gijang-haedong-hoejip | 해동횟집 | 기장 | 회 | 백반기행 242회 | duplicate_review | '기장 멸치쌈밥'과 동일 가능성 |

---

## 2. ready_to_register 후보 (11)

| slug | 식당명 | 주소 | 방송명 | 영상/출처 | note |
|---|---|---|---|---|---|
| jeonhyun-gwangalli-biwa-suljan | 비와술잔 | 수영구 황령대로489번길 49-8 | 전현무계획2 | youtube(채널S) | DATA-F1 재수집 |
| jeonhyun-yeongdo-watda-sikdang | 왔다식당 | 영도구 하나길 811 | 전현무계획2 | 국제뉴스 | 스지수육 |
| jeonhyun-gwangalli-yeonhap-hoejip | 연합횟집 | 수영구 남천1동 192 | 전현무계획2 | 국제뉴스 | 세로썰기 회 |
| jeonhyun-nampo-yeosongje | 여송제 | 중구 광복로18번길 5 | 전현무계획2 | 국제뉴스 | DATA-F1 재수집 |
| jeonhyun-nampo-mullebanga-jeukseokgui | 물레방아 즉석구이 | 중구 중앙대로41번길 11-1 | 전현무계획2 | youtube(채널S) | 안금무 |
| 2tv-sasang-yeonghui-halmae-jaecheopguk | 영희할매재첩국 | 사상구 낙동대로1530번길 20-15 | 2TV 생생정보 | KBS 유튜브 | 재첩국 |
| baekban-seogu-yetnal-guksujip | 옛날국수집 | 서구 까치고개로160번길 54 | 백반기행 242회 | 블로그+위키 | 73년 국수 |
| baekban-nampo-subok-centa | 수복센타 | 중구 남포길 25-3 | 백반기행 4회 | 다이닝코드 | 80년 노포 |
| tzuyang-nampo-ijaemo-pizza | 이재모피자 본점 | 중구 광복중앙로 31 | 쯔양 | youtube | 오픈런 피자 |
| tzuyang-haeundae-chopilsal | 초필살돼지구이 해운대본점 | 해운대구 마린시티3로 23 | 쯔양 | youtube | 돼지껍데기 |
| ansungjae-yeonje-mapobonga | 마포본가 | 연제구 월드컵대로111번길 10 | 안성재 셰프 YT | 부산일보 | 돼지갈비 |

---

## 3. needs_geocoding 후보 (2)

| slug | 식당명 | 주소 | 필요한 작업 |
|---|---|---|---|
| saengdal-gwangalli-baegil-pyeongnaeng | 백일평냉 | 수영구 남천바다로10번길 29 | 좌표 지오코딩 + 가격 확인 |
| saengdal-seomyeon-dammiok | 담미옥 | 부산진구 복지로 15 개금포르투나 103호 | 좌표 지오코딩 + 가격 확인 |

---

## 4. needs_review / excluded

| slug/대상 | 식당명 | status | 이유 |
|---|---|---|---|
| 2tv-seomyeon-donje | 돈제이 부산서면점 | needs_review | 기사에서 상호 마스킹(돈○○), 네이버플레이스로 확인 → 상호 재확인 권장 |
| 2tv-gijang-suhyang-agujjim | 수향아구찜 | needs_review | 기사 상호 마스킹(수○○○○) → 상호 재확인 권장 |
| 2tv-yeongdo-baekseol-daehak | 백설대학 | needs_review | 방영일 미확인, 출처=맛집DB(menutong) |
| baekban-nampo-hanwol-sikdang | 한월식당 | needs_review | 2019 방영, 블로그 출처, 영업/가격 재확인 |
| baekban-gijang-haedong-hoejip | 해동횟집 | duplicate_review | 기존 '기장 멸치쌈밥'과 동일 식당 가능성 |
| 양인제과 | (제외) | excluded | 광주 소재(부산 외) |
| 히밥 부산편(대식좌의 밥상) | (제외) | excluded | 방송/언론에 상호 미공개 |
| 자갈치 연탄꼼장어 | (제외) | excluded | 상호 불확실(블로그 1곳만 지목) |

---

## 5. 빠른등록 블록 생성 결과

- 파일: `reports/new-restaurant-quick-paste-g1.md`
- 블록 수: 18 (ready 11 + needs_geocoding 2 + needs_review 4 + duplicate_review 1)
- 바로 등록 가능(좌표 지오코딩만): **13곳** (ready 11 + needs_geocoding 2)
- 검토 후 등록: 5곳 (needs_review 4 + duplicate_review 1)
- 공개여부: 전부 비공개. 좌표는 비움(Admin "주소로 좌표 찾기"로 채움).
