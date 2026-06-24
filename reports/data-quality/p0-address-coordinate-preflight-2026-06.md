# P0 주소·좌표 재검증 preflight — 공개 식당 14곳 (read-only)

- 생성일: 2026-06-23 (KST)
- 기준 HEAD: 2720490 / branch master
- 대상: quality:audit P0 14곳. read-only(DB SELECT + Kakao GET + 운영 200 확인). 데이터 수정 없음.
- CSV: `reports/data-quality/p0-address-coordinate-preflight-2026-06.csv`

---

## 0. 핵심 결론

- **다음 수정 배치 가능: 9곳** (FIX_READY) / **즉시 수정 금지: 5곳** (REVIEW)
- 운영 상세 14곳 전부 200 정상.
- ⚠ **Kakao keyword 좌표를 정답으로 단정 금지** — 양가네 양곱창에서 Kakao가 틀린 것이 확인됨.
  FIX_READY 좌표 교정 시 **Kakao address 지오코딩(주소 기반)으로 정밀 좌표를 재확보**해서 쓸 것.

---

## 1. FIX_READY_COORDINATE_ONLY (8) — place_id+주소 일치, DB 좌표만 이격

| 식당 | slug | dist | 비고 |
|---|---|---|---|
| 5번 친구해녀할매집 | jeonhyun-gijang-haenyeo-halmaejib | 2451m | 주소·전화 동일 |
| 산해횟집 | saengbang-gwangalli-sanhae-hoejip | 1133m | 풍경타워 8층(주소 base 동일) |
| 송스 베이커리 | saengdal-geumjeong-songs-bakery | 835m | 주소·전화 동일 |
| 쉐라미과자점 | saengdal-saha-cheramie | 1166m | Kakao명 1974쉐라미(동일업장) |
| 스시바시쿠 | saengdal-suyeong-sushibashiku | 588m | db지번=kakao지번, 도로명 보강 가능 |
| 주례수육칼국수 2호점 | saengsaeng-sasang-jurye-suyuk-kalguksu | 1513m | +전화 보강(0502-5553-2589) |
| 기장손칼국수 | samdae-seomyeon-gijang-son-kalguksu | 525m | 주소·전화 동일 |
| 원조가야밀면 | wonjo-gaya-milmyeon | 502m | 전화 양쪽 없음 |

- safe_fix: `lat`, `lng` (+ 주례는 `phone`). unsafe_fix: address/name/phone(이미 일치).
- 권장: 각 주소를 Kakao **address** 지오코딩으로 재좌표화 후 lat/lng만 교정.

## 2. FIX_READY_ADDRESS_AND_COORDINATE (1)

| 식당 | slug | dist | 사유 |
|---|---|---|---|
| 합천국밥집 | pungja-namgu-hapcheon-gukbap | 1635m | place_id 일치, 번지 235→237, DB좌표 이격, 전화 누락 |

- safe_fix: `lat`,`lng`,`address`(용호로 237),`phone`(051-622-4898). unsafe_fix: name.

## 3. FIX_READY_ADDRESS_ONLY (0) — 없음

## 4. PHONE_BACKFILL_READY (2, FIX_READY와 겸함)
- 주례수육칼국수 2호점 → 0502-5553-2589
- 합천국밥집 → 051-622-4898

---

## 5. KAKAO_UNRELIABLE_REVIEW (1) — 즉시 수정 금지

| 식당 | slug | 사유 |
|---|---|---|
| 양가네 양곱창 | baekban-haeundae-yangs-yanggopchang | place_id 동일(15897470)이나 Kakao=수영구 감포로, **식신·다이닝코드=해운대 우동(DB 일치)**·전화 동일 → **Kakao keyword 결과 오류**. DB(해운대) 유지. |

> 이 케이스가 "Kakao 좌표 맹신 금지"의 근거. dist 3508m였지만 DB가 옳다.

## 6. BUSINESS_REVIEW (4) — 즉시 수정 금지

| 식당 | slug | dist | 사유 |
|---|---|---|---|
| 진주식당 | baekban-yeongdo-jinju-sikdang | 536m | place_id 일치하나 도로명 상이(대평로16↔절영로14번길2)+전화 상이 → 이전/상호변경 의심 |
| 문화양곱창 | sungsik-seomyeon-yanggopchang | 564m | place_id 일치하나 도로명 완전 상이(지게골로75↔가야대로784번길)+전화 상이 → 이전 의심 |
| 청사포 도희네 조개구이 | hibab-cheongsa-hoe-center | 1083m | db_place_id(510744836)≠kakao(887616579, 도희네) → 동일 업장 여부 재확인 |
| 시골집명품석갈비 | matnyuk-sasang-doejigalbi | 1706m | place_id 불일치 + db_phone 가짜(051-012-3456) → place_id·전화 재확인 |

## 7. NO_ACTION (0) / BLOCKED (0) — 없음

---

## 8. 우선순위 / 다음 단계

- **P0_FIX_READY 9곳** → 다음 수정 배치 가능 (좌표 8 + 주소·좌표 1)
- **P0_REVIEW 5곳** → 즉시 수정 금지 (양가네=Kakao 오류 / 진주·문화=이전 의심 / 청사포·시골집=place_id 불일치)
- 수정 배치 시 원칙:
  1. 좌표는 Kakao keyword 좌표 직접 사용 금지 → 주소 기반 address 지오코딩으로 재확보
  2. place_id 일치 + 주소 EXACT인 8곳만 lat/lng 단독 교정(가장 안전)
  3. 합천국밥집은 번지(237)·전화까지 함께 교정
  4. REVIEW 5곳은 사람/현장 확인 전까지 보류

---

## 9. 위험 작업 미실행

DB write 0 / Storage 0 / 데이터 수정 0 / 이미지 0 / 배포 0 / git add·commit·push(보고 후) — 분류만.
(실행: git status·HEAD, quality:audit, restaurants:check 운영 200, 웹검색 read-only, CSV/md 생성)
