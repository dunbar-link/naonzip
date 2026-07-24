전체 판정: WARNING

# 나온집 공개식당 P0 5곳 재검토 — 2026-07-10 (read-only)

- 대상: 품질감사(2026-06-23) P0 5곳 주소/좌표/업장 불일치 재검토
- 성격: **read-only.** DB SELECT(기존 dry-run 스크립트) + 기존 감사/preflight/수정스크립트 대조. **DB write 0 / 수정 0 / 배포 0 / 외부발송 0.** 산출물: 이 보고서 1개.
- 한 줄 결론: **P0 5곳 중 4곳(양가네·진주식당·문화양곱창·시골집)은 감사 이후 수정안이 이미 DB에 적용 완료(현재 DB=교정값, dry-run으로 확인). 도희네 1곳만 미해결 — 동일업장 재확인 전까지 현 DB 유지(변경 없음). 즉시 DB 작업 필요분 없음.**

## 1. 곳별 확정 수정안 + 현재 상태

| 곳(slug) | 감사(2026-06) | 확정 수정안 | 현재 DB(2026-07-10) | 상태 |
|---|---|---|---|---|
| 양가네 양곱창 (baekban-haeundae-yangs-yanggopchang) | ADDRESS/COORD_MISMATCH, dist 3508m | **수영구 이전(2026-04) 현장확인** → address 수영구 감포로 106 / 좌표 현행화 / area 해운대→광안리 | 감포로 106 / area 광안리 | ✅ 적용됨 |
| 진주식당 (baekban-yeongdo-jinju-sikdang) | ADDRESS/COORD_MISMATCH, dist 536m | place_id 21319289 동일 확인 → address 영도구 절영로14번길 2 / 좌표 교정 | 절영로14번길 2 | ✅ 적용됨 |
| 문화양곱창 (sungsik-seomyeon-yanggopchang) | ADDRESS/COORD_MISMATCH, dist 564m | place_id 8988183 동일 확인 → address 부산진구 가야대로784번길 56-8 / 좌표 교정 | 가야대로784번길 56-8 | ✅ 적용됨(전화 잔존항목 아래 §3) |
| 시골집명품석갈비 (matnyuk-sasang-doejigalbi) | BUSINESS_REVIEW, place_id 불일치+가짜전화, dist 1706m | 현장확인 → place_id 1045757902→**17710705** 이전, address 낙동대로1210번길 82 / 전화 051-315-0709 / 좌표 교정 | place_id 17710705 / 낙동대로1210번길 82 / 051-315-0709 | ✅ 적용됨 |
| 청사포 도희네 조개구이 (hibab-cheongsa-hoe-center) | BUSINESS_REVIEW, db_place_id 510744836 ≠ name매칭 887616579, dist 1083m | **보류.** db_place_id 510744836을 Kakao 재조회해 "동일업장 여부"부터 확인. 확인 전까지 현 DB 유지(변경 없음). name-only 매칭(도희네 887616579)은 저신뢰 → 맹신 금지 | (감사 스냅샷) 510744836 / 청사포로 157 — 현재값 read-only 재확인 권장 | ⏳ 미해결 |

## 2. 근거 / 대조한 것 (read-only)
- 품질감사: `reports/data-quality/public-restaurant-quality-audit-2026-06.md` + `.csv` (P0 5행 db/kakao/place_id/좌표/전화).
- P0 preflight: `reports/data-quality/p0-address-coordinate-preflight-2026-06.md` — 초기 분류(REVIEW 5곳)와 "Kakao 좌표 맹신 금지" 원칙.
- 기존 수정 스크립트 3종 **dry-run(SELECT only)** 으로 현재 DB값 확인:
  - `fix-p0-address-coord-2026-06.mjs` → 진주식당·문화양곱창: 현재 DB=제안값(이미 반영).
  - `fix-reviewed-map-data-2026-06.mjs` → 시골집: 현재 place_id=17710705(이미 이전), 양가네: 현재 감포로 106(이미 반영). (STOP 사유 = pre-fix place_id 기대값과 불일치 = 이미 적용됐다는 증거)
  - `fix-yanggane-area-2026-06.mjs` → 양가네 area=광안리(이미 반영, STOP=기대 pre값 아님).

## 3. 관찰(선택 후속 — P0 아님, 이번 미실행)
- **문화양곱창 전화 051-345-0001**: placeholder 의심(Kakao=051-804-5140). address/좌표 교정 시 전화는 미변경으로 잔존. → 별도 전화 보강 후보.
- **진주식당 전화 051-412-6799 vs Kakao 051-416-5948**: 불일치 잔존. → 확인 후 보강 후보.
- **감사 스냅샷 staleness**: `public-restaurant-quality-audit-2026-06`는 2026-06-23 기준이라 위 4곳 교정 전 상태를 보여줌. 재감사 시 P0가 5→1(도희네)로 줄어들 것.

## 4. 다음 단계(제안 — 자동 실행 안 함)
1. **도희네만 실작업 대상.** Kakao에서 db_place_id 510744836 재조회 → (a) 유효하고 청사포로 157의 "청사포 도희네 조개구이"면 현 DB 유지(변경 없음, name매칭 887616579는 별개 업장), (b) 무효/폐업이면 도희네(887616579, 청사포로 12)로 교체 여부 현장/웹 확인 후 결정.
2. 도희네 현재 DB값 read-only SELECT 재확인(감사 스냅샷 이후 변동 여부).
3. (선택) 문화양곱창·진주식당 전화 보강 — 위 §3.
- 실제 DB write는 대장 승인 + dry-run 먼저(이 재검토는 write 없음).

## 5. 위험 작업 미실행 확인
- DB write 0 / 데이터 수정 0 / promote 0 / 착수(추가) 0 / 배포 0 / 외부발송 0 / 유료 API 0.
- 실행한 것: 기존 dry-run 스크립트 SELECT(--apply 없음), 기존 리포트/스크립트 read. git add/commit/push 0.
- write 범위: 본 보고서 1개.
