# 나온집 최근 방송맛집 1차 후보 — 2026-04~06 (read-only 수집)

- 생성일: 2026-06-23 (KST)
- 기준 HEAD: a2e3e2b / branch master
- 조사 범위: 2026-04-01 ~ 2026-06-15 부산 방송/유튜브/가이드 맛집
- 목적: 등록(apply)이 아닌 **후보 수집 + CSV 작성**까지. DB write·Storage·이미지·배포·git 변경 없음.
- 후보 CSV: `reports/broadcast-discovery/broadcast-candidates-2026-04-06.csv`

---

## 1. 조사한 프로그램 / 키워드 및 결과

| 프로그램 | 결과 | 비고 |
|---|---|---|
| 생활의 달인 은둔식달 | **후보 4건** | 1024회 제일분식(03-30), 1027회 부산 2곳(04-20), 1032회 하단동밀면(05-25) |
| 2TV 생생정보 | **후보 1건** | '할매 밥 됩니까' 해운대 보리밥(06-15, 상호 마스킹) |
| 식객 허영만의 백반기행 | **종영** | 허영만 건강문제로 2026-06-21 시즌1 종영 → 신규 트랙 제외 |
| 성시경 먹을텐데 | 신규 부산분 없음 | 기존 만우장 등은 이미 등록 |
| 쯔양 | 2025년분만 | 2025-06~07 부산 먹방(동방밀면 등), 2026 신규 없음 |
| 미친맛집(넷플릭스) 시즌3·4 | **대기 5건 확인** | 신창국밥=ALREADY, 나머지 4곳 미등록(404) |
| 미쉐린 가이드 부산 2026 | **guide 트랙(전부 ALREADY)** | 송헌집·평양집·뫼밀집 운영 공개됨 |

> 2026-04~06 **순수 신규 방송**은 백반기행 종영·쯔양 2025년분 등으로 생각보다 적다.
> 생활의 달인이 부산 방송맛집 최신성의 핵심 공급원으로 확인됨.

---

## 2. 후보 요약 (총 13건)

- **READY 3건**: 제일분식, 스시바시쿠, 슌사이쿠보 화명 (모두 생활의 달인, 주소·전화·방송일 확정)
- **REVIEW 5건**: 하단동밀면, 해운대보리밥, 갈치회관, 승하집, 섬진강재첩전문점
- **ALREADY 4건**: 신창국밥, 송헌집, 평양집, 뫼밀집 (등록대상 제외)
- **SKIP 1건**: 부산떡방앗간 (떡 제조소, 식당 fit 약함)

---

## 3. READY 후보 (다음 apply 1순위)

### 3-1. 제일분식 — 생활의 달인 1024회 은둔식달
- 방송일 2026-03-30 (※ 4월 직전 경계선) / 기장군 장안읍 좌천로 38 / 051-727-0132
- 군만두·찐만두 3,500원, 40년 장병희 달인, 60년 전통, 좌천역 앞
- suggested_slug: `saengdal-gijang-jeilbunsik` / area 기장 / category 분식·길거리
- 출처: https://itsdwayne.co.kr/jeil-bunsik/ , https://blog.infocompasslab.com (제일분식)

### 3-2. 스시바시쿠 — 생활의 달인 1027회 은둔식달
- 방송일 2026-04-20 / 수영구 민락동 168-13 / 0507-1384-6223
- 유자향 잿방어·지느러미 광어·성게알 한우 초밥 / **신상**(오사카 일본인 달인 개점)
- suggested_slug: `saengdal-gwangalli-sushibashiku` / area 광안리(수영구 민락) / category 일식
- 출처: https://toogoo.co.kr/entry/생활의달인-1027회-출연-맛집-정리

### 3-3. 슌사이쿠보 화명 — 생활의 달인 1027회 은둔식달
- 방송일 2026-04-20 / 북구 양달로4번길 17 금샘빌딩 1층 / 0507-1315-2959
- 나고야식 히츠마부시(숯불 직화 장어) / **신상**
- suggested_slug: `saengdal-bukgu-shunsaikubo` / area 기타(북구) / category 일식
- 출처: 위와 동일(1027회 정리)

> ⚠ 스시바시쿠·슌사이쿠보는 **신상 맛집**이라 "방송 노포·로컬" 포지셔닝과 결이 다름. 대장 등록 판단 필요.

---

## 4. REVIEW 후보 (보강·확정 후 등록)

| 식당 | 사유 | 확보 데이터 |
|---|---|---|
| (상호미상) 하단동 밀면 | 상호 미특정(기사 비공개), 원조가야밀면 중복 가능 | 생달 1032회 2026-05-25, 사하구 하단동, 물밀면·비빔밀면 |
| (마스킹) ○○○ 보리밥 | 상호 마스킹(세글자), 번지 미상 | 2TV 생생정보 2026-06-15, 해운대 중동, 보리밥정식 |
| 갈치회관 | 넷플릭스라 방송일 null, 가격 미확정 | place 593120865, 사상구 낙동대로 1402, 051-301-8292, 좌표 완비 |
| 승하집 | 메뉴판 미확정, 전화 010(실내포장마차) | place 2020452181, 동래구 사직북로5번길 31, 좌표 완비 |
| 섬진강재첩전문점 | Kakao 상호 vs 방송 상호 표기차, 시즌3 | place 10488926, 중구 광복로85번길 15-1, 051-246-6471, 좌표 완비 |

---

## 5. ALREADY (이미 운영 공개 — 등록대상 제외)

| 식당 | slug | place_id | 확인 |
|---|---|---|---|
| 신창국밥 본점 | michinmatjip-seogu-sinchang-gukbap | 7979137 | 운영 200 |
| 송헌집 | michelin-gwangalli-songheonjip | 1559134124 | 운영 200 (guide) |
| 평양집 | michelin-bukgu-pyeongyangjip | 12293207 | 운영 200 (guide) |
| 뫼밀집 | michelin-haeundae-moemiljip | 973360722 | 운영 200 (guide) |

---

## 6. SKIP

- **부산떡방앗간**(미친맛집 시즌3 2화): Kakao 분류 '방앗간(떡 제조소)' → 식당 아님. 나온집 fit 약함. 등록 비권장.

---

## 7. 중복 확인 방법과 한계

- **slug 직접 확인**(`npm run restaurants:check`): 신규 후보 slug는 운영 404 → 미등록 확정. ALREADY 4건은 200으로 판정.
- **이름 검색 확인**(`npm run search:check`): 검색 페이지가 q 파라미터를 HTML에 echo하는 false positive 발견(신규 후보도 search✓). **이 명령은 신규 중복확인에 부적합** → 참고만.
- 한계: 운영 DB 전체 식당명/주소 대조는 read-only 고정 명령으로 불가(파일 write 동반 스크립트 제외). **apply 단계에서 restaurants 전체 대조로 정밀 중복 재확인 필요.**
- 미친맛집 4곳은 기존 discovery addendum에서 'DB중복없음' 명시 확인됨.

---

## 8. 다음 apply 추천

- **추천 apply 후보 수: 3곳** (READY: 제일분식·스시바시쿠·슌사이쿠보)
  - 단 스시바시쿠·슌사이쿠보는 신상 맛집 → 대장 노포정책 판단 후 결정
- apply 전 필수 보강: 3곳 모두 **Kakao 지오코딩으로 place_id·lat·lng 확보**(현재 미확보), 가격대 매장 확인
- REVIEW 5곳은 상호/가격/방송일 확정 후 차기 배치

### 사진 준비 파일명 (apply 시)
- `saengdal-gijang-jeilbunsik.jpg`
- `saengdal-gwangalli-sushibashiku.jpg`
- `saengdal-bukgu-shunsaikubo.jpg`

### 다음 apply 파일명 제안
- `reports/broadcast-discovery/broadcast-apply-batch1-2026-06.csv` (READY 3곳 좌표 보강 후)

---

## 9. 위험 작업 미실행 확인

DB write 0 / Storage 0 / 이미지 0 / apply 0 / git add·commit·push 0 / 배포 0 / env 변경 0
(실행: git status·HEAD, 파일 read, 웹조사, restaurants:check·search:check read-only HTTP GET, CSV·리포트 파일 생성)
