# 우슐랭 5차 등록 후보 (read-only 선별 리포트)

- 생성일: 2026-06-22
- 기준 HEAD: 5d101b0 / origin/master: 5d101b0
- 성격: **read-only 후보 추천**. DB/Storage write 0, `--apply` 미실행.
- 기준 CSV: `reports/postoffice-guide-audit/postoffice-busan-2026.csv` (92곳)
- 검증: `scripts/register-postoffice-candidates.mjs` (dry-run)

---

## 1. 선별 기준

현재 우슐랭 11곳 category 분포: **해산물 4 · 한식 3 · 고기 2 · 회 1 · 밀면 1** (area는 남구만 미사용).

5차는 area보다 **카테고리 균형·식사 다양성** 우선:
1. 해산물 과다 자제(이미 4)
2. 카페·베이커리 제외 / 식사식당 우선
3. 고기·면·탕·한식 정식·국밥 계열 우선
4. **기존 우슐랭에 없는 메뉴성 우선** — 돼지국밥(0)·중식(0)·분식(0)은 부산 핵심인데 우슐랭 미보유
5. 지점 혼동 적은(동명복수 없는) 독립 식당
6. Kakao place·좌표·전화 READY / 기존 DB 중복 0 / 사진 확보 가능

> 주의: "탕"·"면" canonical category 없음(한식/돼지국밥/밀면/고기/회/중식/분식 등) → 칼국수·삼계탕류는 한식, 냉면/밀면은 밀면, 돼지국밥은 돼지국밥. 신규 area/category 생성 금지.

---

## 2. 제외한 이미 등록된 우슐랭 11곳

금강 복아구전문점 · 팔팔연제장어 · 해녀조씨할매집 · 윤가네산오징어 · 조방낙지 가야점 · 된장한상 · 영남식육식당 동래점 · 송정횟집 · 봉래화로 · 순풍삼계탕 · 해주냉면

---

## 3. READY 잔여 요약

| 구분 | 수 |
|---|---|
| CSV 전체 | 92 |
| REVIEW 제외 | 12 |
| READY_FOR_IMAGE | 80 |
| 이미 등록(우슐랭 11) 제외 | 11 |
| **READY 잔여(미등록)** | **69** |
| 카페·베이커리 제외 | 약 11 |
| 식사식당 후보 pool | 약 58 |

---

## 4. 부족 category 후보 요약

- **돼지국밥(우슐랭 0, 부산 대표)**: 연돼지국밥(서면, NEW_READY) / 부산돼지국밥(광안리, REVIEW 금강복아구 34m)
- **고기(2, 한우 구이만)**: 공항족발(족발+정식)·황령산보쌈(보쌈)·좋은집(삼겹살, 동명복수)·한우지존(한우) — 한우 외 메뉴성(족발/보쌈/삼겹) 우선
- **면/밀면(1)**: 동래밀면(밀면)·대박손칼국수(칼국수→한식)
- **중식(0)**: 대성각(REVIEW 조방낙지 100m)·첸차이나(미검증)
- **분식(0)**: 충무김밥 김치수제비(REVIEW 할매국밥 109m)
- **회(1)**: 부족하나 해산물 쏠림(4) 고려해 이번엔 신중 제외

---

## 5. 우선 검토 후보 dry-run 결과

`node scripts/register-postoffice-candidates.mjs --names "..."` (dry-run, DB 무변경)

| 후보 | dry-run | dup(slug/name/phone/place/near) | 동명복수 | 비고 |
|---|---|---|---|---|
| 연돼지국밥 | **NEW_READY** | 0/0/0/0/0 | 없음 | 서면·돼지국밥(신규) |
| 공항족발 | **NEW_READY** | 0/0/0/0/0 | 없음 | 기타(강서)·고기 |
| 동래밀면 | **NEW_READY** | 0/0/0/0/0 | 없음 | 동래·밀면 |
| 황령산 보쌈 | NEW_READY | 0/0/0/0/0 | 없음 | 광안리·고기(보쌈) |
| 한우지존 | NEW_READY | 0/0/0/0/0 | 없음 | 기타·고기(한우) |
| 대박손칼국수 | NEW_READY | 0/0/0/0/0 | 없음 | 기타·한식(칼국수) |
| 화반 | NEW_READY | 0/0/0/0/0 | 없음 | 기타·한식 |
| 좋은집 | NEW_READY | 0/0/0/0/0 | **있음** | 동구·고기(삼겹), 지점혼동 |
| 부산돼지국밥 | REVIEW | near 1 | — | 금강복아구 34m |
| 대성각 | REVIEW | near 1 | — | 조방낙지 100m |
| 충무김밥 김치수제비 | REVIEW | near 1 | — | 할매국밥 109m |

image: 전부 IMAGE_PENDING(사진 미확보, 정상).

---

## 6. 최종 추천 3곳

목표 구성(고기 / 면·밀면 / 한식·국밥)에 부합. 3곳 모두 NEW_READY·dup0·동명복수 없음. **돼지국밥 신규 category + 고기·밀면 보강, 해산물 0.**

### 1순위 — 연돼지국밥 (서면 · 돼지국밥)

| 항목 | 값 |
|---|---|
| official_restaurant_name | 연돼지국밥 |
| post_office | 부산진우체국 (rec.5) |
| district / area | 부산진구 / **서면** |
| main_menu | 돼지국밥 ₩9,000 · 순대국밥 ₩9,000 · 모듬국밥 ₩10,000 |
| business_hours | 10:00-21:00 (일 휴무) |
| address | 부산광역시 부산진구 범일로192번길 33 |
| phone | 0507-1301-1376 |
| kakao_place_id | 1415088420 |
| kakao_url | http://place.map.kakao.com/1415088420 |
| classification | READY_FOR_IMAGE |
| dry-run | **NEW_READY** (dup 0) |
| image status | IMAGE_PENDING |
| **proposed slug** | `postoffice-busanjin-yeon-dwaeji-gukbap` |
| **proposed image** | `postoffice-busanjin-yeon-dwaeji-gukbap.jpg` |
| **proposed area** | 서면 |
| **proposed category** | 돼지국밥 |
| 추천도 | **A** |

- 추천 이유: **돼지국밥 = 우슐랭 신규 category(0→1)**, 부산을 대표하는 서민 국밥. 동명복수 없음, 단일 업장, 가격 명확, 영업시간 김(촬영 용이).
- 리스크: 낮음. 서면 area는 조방낙지(우슐랭)와 중복이나 category가 완전 신규라 무방.

### 2순위 — 공항족발 (기타 · 고기)

| 항목 | 값 |
|---|---|
| official_restaurant_name | 공항족발 |
| post_office | 부산강서우체국 (rec.2) |
| district / area | 강서구 / **기타** |
| main_menu | 삼미리앞발 ₩42,000 · 반반족발(소) ₩45,000 · (점심특선)두루치기정식 ₩12,000 |
| business_hours | 11:00-14:00 / 17:00-22:00 (일 휴무) |
| address | 부산광역시 강서구 공항앞길 12, 1층 |
| phone | 0507-1402-1781 |
| kakao_place_id | 1688432879 |
| kakao_url | http://place.map.kakao.com/1688432879 |
| classification | READY_FOR_IMAGE |
| dry-run | **NEW_READY** (dup 0) |
| image status | IMAGE_PENDING |
| **proposed slug** | `postoffice-gangseo-gonghang-jokbal` |
| **proposed image** | `postoffice-gangseo-gonghang-jokbal.jpg` |
| **proposed area** | 기타 |
| **proposed category** | 고기 |
| 추천도 | **A−** |

- 추천 이유: 우슐랭 고기 2곳이 모두 한우 구이 → **족발(수육)로 메뉴성 차별화**. 점심특선 두루치기정식(₩12,000)으로 식사식당성↑. 강서구는 실제 지역 신규(canonical은 기타). 동명복수 없음.
- 리스크: canonical area 기타라 윤가네·해주냉면과 area 중복. 단 메뉴·실지역 차별로 보완.

### 3순위 — 동래밀면 (동래 · 밀면)

| 항목 | 값 |
|---|---|
| official_restaurant_name | 동래밀면 |
| post_office | 동래우체국 (rec.3) |
| district / area | 동래구 / **동래** |
| main_menu | 밀면 ₩8,000 · 비빔밀면 ₩8,000 · 왕만두 ₩7,000 · 들깨손칼국수 ₩8,000 |
| business_hours | 10:30-24:00 |
| address | 부산광역시 동래구 명륜로 47 |
| phone | 051-552-3092 |
| kakao_place_id | 12519573 |
| kakao_url | http://place.map.kakao.com/12519573 |
| classification | READY_FOR_IMAGE |
| dry-run | **NEW_READY** (dup 0) |
| image status | IMAGE_PENDING |
| **proposed slug** | `postoffice-dongnae-milmyeon` |
| **proposed image** | `postoffice-dongnae-milmyeon.jpg` |
| **proposed area** | 동래 |
| **proposed category** | 밀면 |
| 추천도 | **B+** |

- 추천 이유: 면/밀면 슬롯. 부산 대표 면(밀면·비빔밀면) 명확한 전문점, 동명복수 없음, 늦은 영업(~24:00).
- 리스크: 밀면 우슐랭 1개(해주냉면)와 category 중복 + 동래 area 중복(영남식육식당). "면 슬롯"으로는 가장 정확하나, 다양성 가중치는 1·2순위보다 낮음. **3곳이 부담되면 이 곳을 2곳 추천으로 줄여도 됨.**

---

## 7. 보류 후보와 보류 이유

| 후보 | dry-run | 보류 이유 |
|---|---|---|
| 부산돼지국밥 (광안리) | REVIEW | 금강 복아구전문점 34m 근접(같은 남천동 블록) → 재확인 필요. 연돼지국밥이 더 안전 |
| 대성각 (서면·중식) | REVIEW | 조방낙지 100m 근접. 중식(0) 신규 가치 있어 재확인 후 차기 후보 |
| 충무김밥 김치수제비 (해운대·분식) | REVIEW | 해운대원조할매국밥 109m 근접. 분식(0) 신규 가치 있어 재확인 후 차기 |
| 좋은집 (동구·삼겹살) | NEW_READY | 삼겹살 구이로 메뉴 좋으나 CSV 동명복수(지점 혼동) → 공항족발이 더 clean |
| 황령산 보쌈 (광안리·보쌈) | NEW_READY | 보쌈 양호하나 광안리 area 중복(금강복아구). 고기 슬롯은 공항족발 우선 |
| 한우지존 (기타·한우) | NEW_READY | 한우는 우슐랭 2곳과 중복. 메뉴성 차별 약함 |
| 대박손칼국수·화반 (기타·한식) | NEW_READY | 한식은 이미 3곳. category 다양성 기여 약함 |
| 첸차이나 (기타·중식) | 미검증 | 중식(0) 신규 후보 — 차기 dry-run 검토 |

---

## 8. 자동화·allowlist 보강 검토

| 항목 | 판단 | 근거 |
|---|---|---|
| `candidates.mjs --apply` 실제 write 구현? | **불필요(보류)** | batch1~4 등록 모두 `register-postoffice-batchN.mjs`로 안전 완료. candidates는 dry-run 전용 유지가 이중 경로 위험 회피 |
| 5차도 batchN 방식? | **유지** | register-postoffice-batch5.mjs(batch4 복제, ROWS 교체) |
| 후보 선별 자동화? | **반자동 유지** | CSV매칭+중복+좌표근접+status는 자동, area/category 큐레이션은 사람 판단 |
| dry-run npm script 추가? | **제안 강화(ROI 상승)** | 3·4·5차 연속으로 `--names` dry-run 반복 → `package.json`에 `"postoffice:dry": "node scripts/register-postoffice-candidates.mjs"` 추가 시 `npm run postoffice:dry -- --names "..."`로 단축. 대장 승인 후 |
| 나온집 allowlist 후보 충분한가? | **충분히 쌓임** | `node scripts/ops-check-summary.mjs`/`npm run ops:summary`, candidates **dry-run**(--apply 없는 호출), read-only `node -e` run-report 조회가 반복 확인됨 |
| 실제 allowlist 수정 vs 스크린샷 누적? | **스크린샷 누적 후 일괄 권장** | 권한 프롬프트 스크린샷을 모아 명령별 read-only/위험 판정 후 `.claude/settings.local.json`에 한 번에 추가가 안전. `--apply`·`--confirm APPLY_...`·git push·deploy는 자동허용 금지 |

> 이번 작업에서 자동화 보강·allowlist 수정은 실제 구현하지 않음. 제안만 기록.

---

## 9. 데이터 안전성

| 항목 | 결과 |
|---|---|
| DB write | 0 |
| Storage write | 0 |
| 신규 restaurants | 0 |
| 신규 trust_sources | 0 |
| 앱 코드 변경 | 0 |
| robots.txt | 미수정·미stage |

---

## 10. 대장이 준비할 사진 3개

`C:\work\naonzip-thumbnail-input\` 에 아래 파일명으로 저장(가로 최소 400×300, JPG):

```text
postoffice-busanjin-yeon-dwaeji-gukbap.jpg
postoffice-gangseo-gonghang-jokbal.jpg
postoffice-dongnae-milmyeon.jpg
```

---

## 11. 다음 dry-run / apply 절차 (batch5)

1. 사진 3장을 위 파일명으로 입력 폴더에 저장
2. `register-postoffice-batch5.mjs` 작성(batch4 복제, ROWS 3곳 교체: 연돼지국밥/공항족발/동래밀면, category 돼지국밥/고기/밀면, 토큰 APPLY_POSTOFFICE_BATCH5)
3. dry-run: `node scripts/register-postoffice-batch5.mjs` → NEW_READY 3·BLOCKED 0 확인
4. confirm 안전장치: `node scripts/register-postoffice-batch5.mjs --apply`(거부 확인)
5. **apply 승인 조건**: ① 사진 3장 IMAGE_OK ② category 확정(돼지국밥·고기·밀면) ③ slug 확정 ④ 대장 명시 승인 → `--apply --confirm APPLY_POSTOFFICE_BATCH5` → 썸네일 업서트 → `--publish`

> 예상 등록 후: 전체 122→125 / 공개 105→108 / 공개 우슐랭 11→14 / 돼지국밥 신규 category.
