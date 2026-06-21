# 우슐랭 3차 등록 후보 (read-only 선별 리포트)

- 생성일: 2026-06-22
- 기준 HEAD: dbae8c2 (`chore(postoffice): add dry-run registration automation`)
- 성격: **read-only 후보 추천**. DB/Storage write 0, 신규 식당 0, `--apply` 미실행.
- 기준 데이터: `reports/postoffice-guide-audit/postoffice-busan-2026.csv` (92곳)
- 검증 도구: `scripts/register-postoffice-candidates.mjs` (dry-run)

---

## 1. 선별 기준

우선순위(요청 기준 그대로):

1. 카페·베이커리 제외
2. 식사식당 우선
3. 부산 로컬성 높은 메뉴 우선
4. 나온집에 상대적으로 적은 카테고리 우선
5. 지점 혼동 적은 독립 식당 우선
6. Kakao place·좌표·전화·주소 READY
7. 기존 DB 중복 0
8. 사진 확보 가능성 높은 식당
9. 너무 흔한 밀면·돼지국밥·회만 반복하지 않기
10. 공개 우슐랭 필터에서 다양성이 보이는 구성

**핵심 판단축 — 우슐랭 5곳은 카테고리가 한쪽으로 쏠려 있다.**

| 기존 우슐랭 | area | category |
|---|---|---|
| 금강 복아구전문점 | 광안리 | 해산물 |
| 윤가네산오징어 | 기타 | 해산물 |
| 팔팔연제장어 | 연제 | 해산물 |
| 해녀조씨할매집 | 기장 | 해산물 |
| 조방낙지 가야점 | 서면 | 한식 |

→ 우슐랭에 **고기·회 카테고리가 0개**, **남포동·동래·해운대 area가 0개**다.
→ 3차는 **한식 정식 / 고기 / 회** 조합으로 우슐랭 다양성(신규 카테고리 2 + 신규 area 3)을 키우는 게 ROI가 가장 높다.

참고 — 공개 DB 전체(99곳) 카테고리 분포: 한식 25 · 해산물 13 · 고기 11 · 돼지국밥 11 · 분식/길거리 10 · 베이커리 6 · 밀면 6 · 일식 4 · 중식 3 · **회 3** · 회/해산물 2 · 기타. (회는 전체에서도 희소 → 기준 4 부합)

---

## 2. 제외한 이미 등록된 우슐랭 5곳

dry-run에서 모두 `ALREADY_REGISTERED` 확정 → 3차 후보에서 제외.

| 식당 | slug | 판정 |
|---|---|---|
| 금강 복아구전문점 | postoffice-gwangalli-geumgang-bokagu | ALREADY_REGISTERED |
| 팔팔연제장어 | postoffice-yeonje-palpal-jangeo | ALREADY_REGISTERED |
| 해녀조씨할매집 | postoffice-gijang-haenyeo-jossi-halmaejip | ALREADY_REGISTERED |
| 윤가네산오징어 | postoffice-bukgu-yungane-san-ojingeo | ALREADY_REGISTERED |
| 조방낙지 가야점 | postoffice-busanjin-jobang-nakji-gaya | ALREADY_REGISTERED |

> 참고: `source_type=guide`는 8곳이지만, 이 중 3곳(뫼밀집·송헌집·평양집)은 `michelin-*` slug = 미슐랭 필터. 우슐랭(postoffice-*)은 정확히 위 5곳.

---

## 3. 전체 READY 잔여 요약

| 구분 | 수 |
|---|---|
| CSV 전체 후보 | 92 |
| REVIEW(kakao 미매칭/구 불일치) 제외 | 12 |
| READY_FOR_IMAGE | 80 |
| 이미 등록(우슐랭 5) 제외 | 5 |
| **READY 잔여(미등록)** | **75** |
| 카페·베이커리 제외 | 약 11 |
| **식사식당 후보 pool** | **약 64** |

### 카페·베이커리 제외(약 11곳, 기준 1)

쿠루미과자점 · 수안커피컴퍼니 · 더라이스 · 리바이브 · 스위스제과 · 구름고개카페 · 지밀레니얼 · 구자윤 과자점 · 하이까눌레 · 콤파운드 · 당감우체국카페

(당감우체국카페·리바이브는 식사 메뉴가 일부 있으나 업장 정체성이 카페/브런치라 제외)

---

## 4. 우선 검토 후보 dry-run 결과

`node scripts/register-postoffice-candidates.mjs --names "..."` (dry-run, DB/Storage 무변경)

| 후보 | dry-run | image | 중복 | CSV 동명복수 | 비고 |
|---|---|---|---|---|---|
| 된장한상 | **NEW_READY** | IMAGE_PENDING | 0 | 없음(clean) | 한식 정식, 남포동(중구) |
| 영남식육식당 동래점 | **NEW_READY** | IMAGE_PENDING | 0 | 있음 | 한우 구이, 동래 |
| 송정횟집 | **NEW_READY** | IMAGE_PENDING | 0 | 없음(clean) | 모듬회, 송정 |
| 동래밀면 | NEW_READY | IMAGE_PENDING | 0 | 있음 | 밀면(기준 9 주의) |
| 황태를벗삼아 | REVIEW | IMAGE_PENDING | 좌표 120m 근접(중앙곰탕) | 없음 | 근접 재확인 필요 → 보류 |
| 유림정 | NEW_READY | IMAGE_PENDING | 0 | 없음 | 한우, 금정→기타 |
| 한우지존 | NEW_READY | IMAGE_PENDING | 0 | 없음 | 한우, 사하→기타 |
| 봉래화로 | NEW_READY | IMAGE_PENDING | 0 | 없음 | 한우, 영도(8곳 기존) |
| 소달구지 | NEW_READY | IMAGE_PENDING | 0 | 없음 | 한우, 기장 |
| 황령산 보쌈 | NEW_READY | IMAGE_PENDING | 0 | 없음 | 보쌈, 광안리(16곳 기존) |
| 남해영양보리밥 | NEW_READY | IMAGE_PENDING | 0 | 없음 | 보리밥, 사하→기타 |
| 순풍삼계탕 | NEW_READY | IMAGE_PENDING | 0 | 없음 | 삼계탕(탕), 사상 |
| 화반 | NEW_READY | IMAGE_PENDING | 0 | 없음 | 비빔밥 백반, 사하→기타 |
| 수연이네 | NEW_READY | IMAGE_PENDING | 0 | 있음 | 문어/랍스터(다소 upscale) |

- image=IMAGE_PENDING은 정상(아직 사진 미확보, 사진 입력 폴더에 파일 없음).
- 중복 0 = slug/place/phone+name/좌표근접 모두 0건(황태를벗삼아만 좌표 근접으로 REVIEW).
- "CSV 동명복수"는 CSV 작성 시 kakao 동명 다수였다는 표시(주소로 확정됨, READY). 등록 차단 사유 아님, slug에 지역 고정 권장.

---

## 5. 최종 추천 3곳

목표 구성(한식 정식 / 고기 / 해산물)에 정확히 부합하고, 우슐랭에 신규 카테고리 2개(고기·회)와 신규 area 3개(남포동·동래·해운대)를 더한다. 3곳 모두 NEW_READY·중복0·동명복수 영향 낮음.

### 1순위 — 된장한상 (한식 정식/백반)

| 항목 | 값 |
|---|---|
| official_restaurant_name | 된장한상 |
| post_office | 부산우체국 (rec. 2) |
| district / area | 중구 / **남포동** |
| main_menu | 한우육회비빔밥 된장한상 ₩12,000 · 청국장한상 ₩10,000 · 제육볶음된장한상 ₩9,500 |
| price_text | (동일) |
| address | 부산광역시 중구 대청로141번길 17 |
| phone | 051-442-3006 |
| kakao_place_id | 715154557 |
| kakao_url | http://place.map.kakao.com/715154557 |
| lat / lng | 35.1043462714426 / 129.035055842391 |
| classification | READY_FOR_IMAGE |
| 기존 DB 중복 | 0 |
| dry-run | **NEW_READY** |
| image status | IMAGE_PENDING |
| **proposed slug** | `postoffice-nampodong-doenjang-hansang` (충돌 없음) |
| **proposed image** | `postoffice-nampodong-doenjang-hansang.jpg` |
| **proposed area** | 남포동 |
| **proposed category** | 한식 |
| 추천도 | **A** |

- 추천 이유: 우슐랭에 거의 없는 **한식 정식/백반 정통형**(된장·청국장·한우육회비빔밥 한상). 중구 대청동 독립 노포, 동명복수 없음(clean). 남포동 area 신규. 가격·메뉴 명확.
- 리스크: 일·토 단축영업(토 ~16:00, 일 휴무) — 사진 촬영 시간대 주의. 그 외 낮음.

### 2순위 — 영남식육식당 동래점 (고기/한우 구이)

| 항목 | 값 |
|---|---|
| official_restaurant_name | 영남식육식당 동래점 |
| post_office | 동래우체국 (rec. 4) |
| district / area | 동래구 / **동래** |
| main_menu | 깍둑등심(110g) ₩40,000 · 소금정식(110g) ₩36,000 · 양념진갈비(150g) ₩33,000 |
| price_text | (동일) |
| address | 부산광역시 동래구 명륜로112번가길 51 |
| phone | 0507-1332-2228 |
| kakao_place_id | 21965019 |
| kakao_url | http://place.map.kakao.com/21965019 |
| lat / lng | 35.2057710116254 / 129.082985393124 |
| classification | READY_FOR_IMAGE |
| 기존 DB 중복 | 0 |
| dry-run | **NEW_READY** |
| image status | IMAGE_PENDING |
| **proposed slug** | `postoffice-dongnae-yeongnam-sigyuk` (충돌 없음) |
| **proposed image** | `postoffice-dongnae-yeongnam-sigyuk.jpg` |
| **proposed area** | 동래 |
| **proposed category** | 고기 |
| 추천도 | **A** |

- 추천 이유: 우슐랭에 **고기 카테고리 0 → 신규 추가**. 동래 area는 공개 DB 전체에서 단 1곳뿐 → area 다양성 기여 최대. 명륜동 한우 노포(3년 연속 수록).
- 리스크: 이름에 "동래점" 포함 + CSV 동명복수 → 향후 지점 혼동 가능. slug에 `dongnae` 고정해 완화. apply 전 주소/전화로 동래점 단일 확정 권장.

### 3순위 — 송정횟집 (회/해산물)

| 항목 | 값 |
|---|---|
| official_restaurant_name | 송정횟집 |
| post_office | 해운대우체국 (rec. 2) |
| district / area | 해운대구 / **해운대** (송정) |
| main_menu | 모듬회 ₩45,000~ · 고급모듬회 ₩53,000~ · 제철회 시세 |
| price_text | (동일) |
| address | 부산광역시 해운대구 송정중앙로33번길 10 |
| phone | 0507-1495-1085 |
| kakao_place_id | 1300768661 |
| kakao_url | http://place.map.kakao.com/1300768661 |
| lat / lng | 35.1826832201469 / 129.204425715884 |
| classification | READY_FOR_IMAGE |
| 기존 DB 중복 | 0 |
| dry-run | **NEW_READY** |
| image status | IMAGE_PENDING |
| **proposed slug** | `postoffice-haeundae-songjeong-hoetjip` (충돌 없음) |
| **proposed image** | `postoffice-haeundae-songjeong-hoetjip.jpg` |
| **proposed area** | 해운대 |
| **proposed category** | 회 |
| 추천도 | **A−** |

- 추천 이유: 우슐랭 해산물 4곳은 복/장어/전복/오징어로, **회(생선회)는 0 → 신규 서브타입**. 회는 공개 DB 전체에서도 3곳뿐(희소, 기준 4). 송정 해안 입지, 동명복수 없음(clean).
- 리스크: 회는 흔한 카테고리(기준 9). 단 이번 배치는 한식·고기와 섞여 "회만 반복"이 아니므로 무방. 디너 전용(16:00~) — 사진 촬영 시간대 주의.

---

## 6. 보류 후보와 보류 이유

| 후보 | dry-run | 보류 이유 |
|---|---|---|
| 동래밀면 | NEW_READY | 밀면은 DB 6곳·기준 9 주의 + 동래 area가 영남식육식당과 중복. 부산 로컬성은 높음 → 향후 '면' 배치 1순위 후보 |
| 황태를벗삼아 | **REVIEW** | 좌표 120m 내 중앙곰탕 근접 → 동일/인접 업장 여부 재확인 후 판단 |
| 유림정 · 한우지존 · 봉래화로 · 소달구지 | NEW_READY | 고기 슬롯은 영남식육식당으로 충족. area 신규성(동래)이 더 큼 → 다음 고기 배치 후보 |
| 황령산 보쌈 | NEW_READY | 보쌈(고기계열) 양호하나 광안리(기존 16곳)·금강복아구와 area 중복 |
| 순풍삼계탕 | NEW_READY | 삼계탕(탕) 양호 → 한식/탕 다양성 향후 후보. 이번엔 된장한상이 한식 슬롯 |
| 남해영양보리밥 · 화반 | NEW_READY | 한식 백반 계열로 된장한상과 슬롯 중복 |
| 수연이네 | NEW_READY | 문어 distinctive하나 CSV 동명복수 + 랍스터코스로 다소 upscale/fusion → 해산물 슬롯은 송정횟집이 더 clean |

---

## 7. 데이터 안전성

| 항목 | 결과 |
|---|---|
| DB write | 0 (SELECT만) |
| Storage write | 0 (dry-run list만) |
| 신규 restaurants | 0 |
| 신규 trust_sources | 0 |
| `--apply` 실행 | 없음 |
| robots.txt | 미수정·미stage |
| 임시 점검 스크립트 | 생성 후 삭제(미stage) |

---

## 8. 대장이 준비할 사진 3개

`C:\work\naonzip-thumbnail-input\` 폴더에 아래 파일명으로 저장(가로 최소 400×300, JPG):

```text
postoffice-nampodong-doenjang-hansang.jpg
postoffice-dongnae-yeongnam-sigyuk.jpg
postoffice-haeundae-songjeong-hoetjip.jpg
```

---

## 9. 다음 dry-run / apply 절차

> 주의: CLI `--slugs`는 CSV의 placeholder proposed_slug(예: `postoffice-busan-02`)로 매칭한다. 확정 romanize slug·category는 **batch JSON**으로 넣어야 한다(이름으로 CSV 매칭 + 확정값 적용).

1. 사진 3장을 위 파일명으로 입력 폴더(`C:\work\naonzip-thumbnail-input`)에 저장
2. 이름 기준 dry-run 재검증으로 IMAGE_OK 전환 확인:

```bash
node scripts/register-postoffice-candidates.mjs --names "된장한상,영남식육식당 동래점,송정횟집"
```

3. 확정 slug·category·area·image를 담은 batch JSON 작성(예: `reports/postoffice-guide-audit/postoffice-batch3-register.json`):

```json
{
  "candidates": [
    { "name": "된장한상", "slug": "postoffice-nampodong-doenjang-hansang", "area": "남포동", "category": "한식", "image": "postoffice-nampodong-doenjang-hansang.jpg" },
    { "name": "영남식육식당 동래점", "slug": "postoffice-dongnae-yeongnam-sigyuk", "area": "동래", "category": "고기", "image": "postoffice-dongnae-yeongnam-sigyuk.jpg" },
    { "name": "송정횟집", "slug": "postoffice-haeundae-songjeong-hoetjip", "area": "해운대", "category": "회", "image": "postoffice-haeundae-songjeong-hoetjip.jpg" }
  ]
}
```

4. batch JSON으로 dry-run 재확인(NEW_READY·IMAGE_OK·slug 확정·category 확정):

```bash
node scripts/register-postoffice-candidates.mjs --batch reports/postoffice-guide-audit/postoffice-batch3-register.json
```

5. 위 4개 + 영남식육식당 동래점 단일 확정 모두 충족 시에만 대장 승인 → apply:

```bash
node scripts/register-postoffice-candidates.mjs --batch reports/postoffice-guide-audit/postoffice-batch3-register.json --apply --confirm APPLY_POSTOFFICE_BATCH
```

> apply 승인 조건: ① 사진 3장 IMAGE_OK ② category 확정(한식·고기·회) ③ slug 확정 ④ 영남식육식당 동래점 단일 확정 ⑤ 대장 명시 승인
