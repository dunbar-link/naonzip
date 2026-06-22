# 우슐랭 4차 등록 후보 (read-only 선별 리포트)

- 생성일: 2026-06-22
- 기준 HEAD: 41ecada / origin/master: 41ecada
- 성격: **read-only 후보 추천**. DB/Storage write 0, `--apply` 미실행.
- 기준 CSV: `reports/postoffice-guide-audit/postoffice-busan-2026.csv` (92곳)
- 검증: `scripts/register-postoffice-candidates.mjs` (dry-run)

---

## 1. 선별 기준 (8곳 품질 점검 반영)

현재 우슐랭 8곳 분포:
- area: 광안리·연제·기장·기타·서면·남포동·동래·해운대 (각 1) — **미사용: 사상·영도·남구**
- category: 해산물 4 · 한식 2 · 고기 1 · 회 1

4차 우선순위:
1. **미사용 area 우선**: 사상 · 영도 · 남구
2. **부족 category 우선**: 고기(1) · 회(1) · 밀면(0) · ("탕"은 canonical category에 없음 → 삼계탕류는 한식)
3. 해산물 당분간 자제
4. 카페·베이커리 제외
5. 지점 혼동 적은(동명복수 없는) 식사식당 우선
6. 사진 확보 가능성 높은 식당

> **남구 주의**: CSV의 남구 주소 업장은 구름고개카페·지밀레니얼 둘 다 카페 → 남구 식사식당 후보 없음. 4차는 사상·영도 중심.
> **"탕" category 주의**: DB canonical category(한식/해산물/고기/돼지국밥/분식·길거리/베이커리·디저트/밀면/일식/중식/회 등)에 "탕"·"면" 없음. 삼계탕→한식, 냉면/밀면→밀면으로 분류.

---

## 2. 제외한 이미 등록된 우슐랭 8곳

dry-run 시 ALREADY_REGISTERED. 4차 후보 제외.

금강 복아구전문점 · 팔팔연제장어 · 해녀조씨할매집 · 윤가네산오징어 · 조방낙지 가야점 · 된장한상 · 영남식육식당 동래점 · 송정횟집
(검증: 송정횟집 dry-run → ALREADY_REGISTERED, name/phone/place 일치)

---

## 3. READY 잔여 요약

| 구분 | 수 |
|---|---|
| CSV 전체 | 92 |
| REVIEW 제외 | 12 |
| READY_FOR_IMAGE | 80 |
| 이미 등록(우슐랭 8) 제외 | 8 |
| **READY 잔여(미등록)** | **72** |
| 카페·베이커리 제외 | 약 11 |
| 식사식당 후보 pool | 약 61 |

---

## 4. 미사용 area 후보 요약 (CSV)

### 사상 (부산사상우체국) — 식사식당
| 식당 | 메뉴 | category 후보 | dry-run | 비고 |
|---|---|---|---|---|
| 순풍삼계탕 | 삼계탕·전복삼계탕 | 한식 | **NEW_READY** | clean, 보양식 |
| 설화회초밥 | 회 코스 | 회/일식(애매) | NEW_READY | 초밥집 → category 애매 |
| 밥짓는부엌 한식뷔페 | 한식뷔페 ₩8,000 | 한식 | NEW_READY | 동명복수, 뷔페(메뉴 가변) |
| 수연이네 | 문어숙회·랍스터 | 해산물 | (해산물 자제) | 동명복수 |
| 호포장어마을 | 장어구이 | 해산물 | (해산물 자제) | — |
| 첨단돌솥감자탕 엄궁점 | 감자탕 | — | REVIEW(kakao미매칭) | 제외 |

### 영도 (부산영도우체국) — 식사식당
| 식당 | 메뉴 | category 후보 | dry-run | 비고 |
|---|---|---|---|---|
| 봉래화로 | 보석살·황제갈비살·정식 | 고기 | **NEW_READY** | clean, 한우구이 |
| 등대횟집 | 모듬회·물회·회비빔밥 | 회 | REVIEW | 사또분식 81m 근접 |
| 육미당찬 | 시그니처·프리미엄(불명확) | 고기? | REVIEW | 삼진어묵 110m + 메뉴 불명확 |
| 모디포차 1호점 | 해물탕·해물찜 | 해산물 | (해산물 자제) | — |
| 우리이모집 | 조개구이·해물모듬 | 해산물 | (해산물 자제) | — |
| 장어마을 | 장어구이·장어탕 | 해산물 | (해산물 자제) | 동명복수 |

### 남구 — 식사식당 후보 없음 (카페만: 구름고개카페·지밀레니얼)

---

## 5. 부족 category 후보 요약

- **밀면(0 → 신규)**: 해주냉면(사하→기타, 냉면+밀면, NEW_READY) · 동래밀면(동래, 이미 동래 area) · 북문국수/국수가/대박손칼국수(금정→기타)
- **고기(1)**: 봉래화로(영도, NEW_READY) · 한우지존(기타) · 유림정(기타) · 좋은집(기타) 등
- **회(1)**: 등대횟집(영도, REVIEW) · 설화회초밥(사상, 회/일식) · 한양횟집/주화횟집 등
- **탕**: canonical 없음 → 순풍삼계탕은 한식 분류

---

## 6. 우선 검토 후보 dry-run 결과

`node scripts/register-postoffice-candidates.mjs --names "..."` (dry-run, DB 무변경)

| 후보 | dry-run | dup(slug/name/phone/place/near) | 동명복수 | 비고 |
|---|---|---|---|---|
| 봉래화로 | **NEW_READY** | 0/0/0/0/0 | 없음 | 영도·고기 |
| 순풍삼계탕 | **NEW_READY** | 0/0/0/0/0 | 없음 | 사상·한식(삼계탕) |
| 해주냉면 | **NEW_READY** | 0/0/0/0/0 | 없음 | 기타·밀면 |
| 설화회초밥 | NEW_READY | 0/0/0/0/0 | 없음 | 사상·회/일식(애매) |
| 밥짓는부엌 한식뷔페 | NEW_READY | 0/0/0/0/0 | 있음 | 사상·한식(뷔페) |
| 등대횟집 | REVIEW | 0/0/0/0/**1** | 없음 | 영도·회, 사또분식 81m |
| 육미당찬 | REVIEW | 0/0/0/0/**1** | — | 영도, 삼진어묵 110m+메뉴 불명확 |
| 송정횟집 | ALREADY | name1/phone1/place1 | — | 등록 확인 |

image: 8곳 전부 IMAGE_PENDING(사진 미확보, 정상).

---

## 7. 최종 추천 3곳

목표 구성(미사용 area / 면·탕 / 고기·회)에 부합. 3곳 모두 NEW_READY·dup0·동명복수 없음. **미사용 area 영도·사상 2개 + 밀면 신규 category + 고기 보강, 해산물 0.**

### 1순위 — 봉래화로 (영도 · 고기)

| 항목 | 값 |
|---|---|
| official_restaurant_name | 봉래화로 |
| post_office | 부산영도우체국 (rec.1) |
| district / area | 영도구 / **영도** |
| main_menu | 보석살(130g) ₩16,900 · 황제갈비살(130g) ₩14,900 · (평일런치)보석살정식 ₩14,500 |
| business_hours | 11:30-14:30 / 16:30-21:30 (21:00 LO) |
| address | 부산광역시 영도구 대교로 1, 101호 |
| phone | 0507-1416-7930 |
| kakao_place_id | 1972140778 |
| kakao_url | http://place.map.kakao.com/1972140778 |
| lat / lng | 35.0926737511788 / 129.044243249941 |
| classification | READY_FOR_IMAGE |
| dry-run | **NEW_READY** (dup 0) |
| image status | IMAGE_PENDING |
| **proposed slug** | `postoffice-yeongdo-bongnae-hwaro` |
| **proposed image** | `postoffice-yeongdo-bongnae-hwaro.jpg` |
| **proposed area** | 영도 |
| **proposed category** | 고기 |
| 추천도 | **A** |

- 추천 이유: 미사용 area(영도) + 부족 category(고기) **동시 충족**. 동명복수 없음, 한우 구이(보석살·갈비살) 독립 업장, 런치 정식으로 사진 확보 용이.
- 리스크: 낮음. 브레이크타임 있어 촬영 시간대만 주의.

### 2순위 — 순풍삼계탕 (사상 · 한식)

| 항목 | 값 |
|---|---|
| official_restaurant_name | 순풍삼계탕 |
| post_office | 부산사상우체국 (rec.4) |
| district / area | 사상구 / **사상** |
| main_menu | 삼계탕 ₩15,000 · 전복삼계탕 ₩19,000 |
| business_hours | 10:00-22:00 |
| address | 부산광역시 사상구 사상로181번길 33 |
| phone | 051-324-6622 |
| kakao_place_id | 16669936 |
| kakao_url | http://place.map.kakao.com/16669936 |
| lat / lng | 35.1597563884913 / 128.985443217797 |
| classification | READY_FOR_IMAGE |
| dry-run | **NEW_READY** (dup 0) |
| image status | IMAGE_PENDING |
| **proposed slug** | `postoffice-sasang-sunpung-samgyetang` |
| **proposed image** | `postoffice-sasang-sunpung-samgyetang.jpg` |
| **proposed area** | 사상 |
| **proposed category** | 한식 |
| 추천도 | **A−** |

- 추천 이유: 미사용 area(사상) 충족. 삼계탕·전복삼계탕 보양식으로 기존 한식(조방낙지·된장한상)과 메뉴 차별화. 동명복수 없음, 단일 업장, 영업시간 길어 촬영 용이.
- 리스크: category가 "탕" 전용이 없어 한식(이미 2곳)으로 분류 → category 다양성 기여는 약함(area 기여가 주). 단 메뉴 성격은 차별적.

### 3순위 — 해주냉면 (기타 · 밀면)

| 항목 | 값 |
|---|---|
| official_restaurant_name | 해주냉면 |
| post_office | 부산사하우체국 (rec.1) |
| district / area | 사하구 / **기타** |
| main_menu | 비빔냉면 ₩12,000 · 물냉면 ₩12,000 · 물밀면 ₩9,000 · 밀비빔 ₩9,000 |
| business_hours | 11:00-18:30 (월 휴무) |
| address | 부산광역시 사하구 낙동대로324번길 5 |
| phone | 051-291-4841 |
| kakao_place_id | 21295360 |
| kakao_url | http://place.map.kakao.com/21295360 |
| lat / lng | 35.1006494109164 / 128.981723291788 |
| classification | READY_FOR_IMAGE |
| dry-run | **NEW_READY** (dup 0) |
| image status | IMAGE_PENDING |
| **proposed slug** | `postoffice-saha-haeju-naengmyeon` |
| **proposed image** | `postoffice-saha-haeju-naengmyeon.jpg` |
| **proposed area** | 기타 |
| **proposed category** | 밀면 |
| 추천도 | **A−** |

- 추천 이유: **밀면 category 우슐랭 신규(0→1)**. 냉면+밀면(물밀면·밀비빔)로 부산 로컬성 높음. 동명복수 없음, 단일 업장.
- 리스크: area가 사하구→canonical "기타"라 기존 윤가네산오징어(기타)와 area 중복. 단 category 신규성으로 보완.

---

## 8. 보류 후보와 보류 이유

| 후보 | dry-run | 보류 이유 |
|---|---|---|
| 등대횟집 (영도·회) | REVIEW | 사또분식 81m 근접 → 동일/인접 재확인 필요. 회 보강 가치 있어 재확인 후 4.5차 1순위 후보 |
| 육미당찬 (영도) | REVIEW | 삼진어묵 본점 110m 근접 + 메뉴(시그니처/프리미엄)만 있어 category 불명확 |
| 설화회초밥 (사상·회) | NEW_READY | 회 코스만 있는 초밥집 → category 회/일식 애매. 분류 확정 후 검토 |
| 밥짓는부엌 한식뷔페 (사상) | NEW_READY | 한식뷔페(₩8,000, 매일 메뉴 가변) → 대표 메뉴·사진 표준화 어려움. 동명복수 |
| 수연이네·호포장어마을·장어마을·모디포차·우리이모집 | NEW_READY/READY | 해산물 계열 → 이번 자제 방향(해산물 4 충분) |
| 동래밀면 | NEW_READY | 밀면 후보지만 동래 area 이미 사용(영남식육식당). 해주냉면이 area·중복면에서 우위 |

---

## 9. 자동화 보강 검토

| 항목 | 판단 | 근거 |
|---|---|---|
| `register-postoffice-candidates.mjs --apply` 실제 write 구현 필요? | **불필요(보류)** | 1~3차 등록은 `register-postoffice-batchN.mjs`(INSERT→썸네일 업서트→publish)로 검증 완료. candidates에 apply 추가는 중복·이중 경로 위험. 후보 선별/dry-run 전용으로 유지가 안전 |
| 4차도 batchN 방식? | **유지** | register-postoffice-batch4.mjs(batch3 복제, ROWS 교체)로 진행이 가장 안전 |
| 후보 선별 자체 자동화? | **반자동 유지** | candidates CLI가 이미 CSV매칭+중복+좌표근접+status 자동 판정. 최종 area/category 큐레이션은 사람 판단 영역 → 완전 자동화는 과자동화 위험 |
| dry-run npm script 추가? | **제안(ROI 중)** | 3·4차 반복된 `node scripts/register-postoffice-candidates.mjs --names "..."` → `package.json`에 `"postoffice:dry": "node scripts/register-postoffice-candidates.mjs"` 추가 시 `npm run postoffice:dry -- --names "..."`로 단축. 단 package.json 수정은 대장 승인 후 |
| 권한 프롬프트 반복 명령? | 있음 | candidates dry-run, `node -e`(read-only 조회), git status/diff 반복 |
| allowlist 추가 후보? | **검토 제안** | `.claude/settings.local.json`에 candidates CLI **dry-run 형태**(--apply/--confirm 없는 호출), read-only `node -e` 조회를 read 권한으로. **--apply·batch 등록·git push는 자동허용 금지** |

> 자동화 보강은 이번 작업 범위 밖 — 구현하지 않음. 제안만 기록. package.json·settings.local.json 수정은 별도 승인 필요.

---

## 10. 데이터 안전성

| 항목 | 결과 |
|---|---|
| DB write | 0 |
| Storage write | 0 |
| 신규 restaurants | 0 |
| 신규 trust_sources | 0 |
| 앱 코드 변경 | 0 |
| robots.txt | 미수정·미stage |

---

## 11. 대장이 준비할 사진 3개

`C:\work\naonzip-thumbnail-input\` 에 아래 파일명으로 저장(가로 최소 400×300, JPG):

```text
postoffice-yeongdo-bongnae-hwaro.jpg
postoffice-sasang-sunpung-samgyetang.jpg
postoffice-saha-haeju-naengmyeon.jpg
```

---

## 12. 다음 dry-run / apply 절차 (batch4)

1. 사진 3장을 위 파일명으로 입력 폴더에 저장
2. `register-postoffice-batch4.mjs` 작성(batch3 복제, ROWS 3곳 교체: 봉래화로/순풍삼계탕/해주냉면, category 고기/한식/밀면)
3. dry-run: `node scripts/register-postoffice-batch4.mjs` → NEW_READY 3·BLOCKED 0 확인
4. 썸네일: `node scripts/upsert-restaurant-thumbnails.mjs --only postoffice-yeongdo-bongnae-hwaro,postoffice-sasang-sunpung-samgyetang,postoffice-saha-haeju-naengmyeon --include-private` (먼저 dry-run, 그 다음 --apply)
5. **apply 승인 조건**: ① 사진 3장 IMAGE_OK ② category 확정(고기·한식·밀면) ③ slug 확정 ④ 대장 명시 승인 → `--apply --confirm APPLY_POSTOFFICE_BATCH4` → 썸네일 업서트 → `--publish`

> 예상 등록 후: 전체 119→122 / 공개 102→105 / 공개 우슐랭 8→11 / area 영도·사상 신규 / category 밀면 신규·고기 2.
