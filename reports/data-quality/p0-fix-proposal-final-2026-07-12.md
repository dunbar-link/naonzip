전체 판정: WARNING

# 나온집 공개식당 P0 5곳 주소/좌표 수정안 확정 — 2026-07-12 (read-only)

- 대상: 품질감사(2026-06-23) P0 5곳(주소/좌표/업장 불일치) 재검토 → 곳별 수정안 확정
- 성격: **read-only.** repo 기존 보고서·CSV만 대조. **DB write 0 / 데이터 수정 0 / 스크립트 재실행 0 / 배포 0 / commit·push 0.** 산출물: 이 보고서 1개.
- 근거(repo 내부만):
  - `reports/data-quality/public-restaurant-quality-audit-2026-06.md` + `.csv` (감사 원천: db/kakao/place_id/좌표/전화)
  - `reports/data-quality/p0-address-coordinate-preflight-2026-06.md` (초기 분류 + "Kakao 좌표 맹신 금지" 원칙)
  - `reports/data-quality/p0-recheck-2026-07.md` (2026-07-10 재검토: dry-run SELECT로 현재 DB 대조)
- 한 줄 결론: **P0 5곳 중 4곳(양가네·진주식당·문화양곱창·시골집) 수정안 확정 + 이미 DB 적용 완료. 도희네 1곳만 미해결(동일업장 재확인 전까지 현 DB 유지·변경 없음). 즉시 DB 작업 필요분 0.**

## 1. 곳별 확정 수정안 (5)

| # | 곳(slug) | 불일치(감사) | 판정: 무엇이 맞나 | 확정 수정안 | 적용 상태 |
|---|---|---|---|---|---|
| 1 | 양가네 양곱창 (baekban-haeundae-yangs-yanggopchang) | ADDRESS/COORD, dist 3508m, place_id 동일(15897470) | **Kakao(수영구)가 맞음** — 2026-04 수영구 이전(현장확인). preflight의 "DB 유지"는 이전 확인으로 뒤집힘 | address→수영구 감포로 106 / 좌표 현행화 / area 해운대→광안리 | ✅ 적용됨 |
| 2 | 진주식당 (baekban-yeongdo-jinju-sikdang) | ADDRESS/COORD, dist 536m, place_id 동일(21319289) | **Kakao 주소가 맞음** — 동일 place_id, 도로명 최신화 | address→영도구 절영로14번길 2 / 좌표 교정 | ✅ 적용됨 |
| 3 | 문화양곱창 (sungsik-seomyeon-yanggopchang) | ADDRESS/COORD, dist 564m, place_id 동일(8988183) | **Kakao 주소가 맞음** — 동일 place_id | address→부산진구 가야대로784번길 56-8 / 좌표 교정 | ✅ 적용됨 |
| 4 | 시골집명품석갈비 (matnyuk-sasang-doejigalbi) | BUSINESS_REVIEW, place_id 불일치+가짜전화(051-012-3456), dist 1706m | **Kakao(17710705)가 맞음** — db place_id 구식, 현장확인 | place_id 1045757902→17710705 / address→낙동대로1210번길 82 / phone→051-315-0709 / 좌표 교정 | ✅ 적용됨 |
| 5 | 청사포 도희네 조개구이 (hibab-cheongsa-hoe-center) | BUSINESS_REVIEW, db_place_id 510744836 ≠ 이름매칭 887616579(도희네), dist 1083m | **미확정(보류)** — name-only 매칭은 저신뢰, 맹신 금지 | **변경 없음.** db_place_id 510744836 Kakao 재조회로 동일업장 여부 먼저 확인 | ⏳ 미해결 |

## 2. 확정 원칙 (근거 리포트에서)

- **Kakao keyword 좌표 맹신 금지**(preflight §0/§5): 양가네가 place_id 동일에도 Kakao keyword 좌표가 3508m 벗어났던 케이스 → 좌표 교정 시 주소기반 지오코딩 권장. 단 양가네는 recheck에서 실제 수영구 이전이 확인되어 Kakao 주소 채택.
- **place_id 동일 = 주소/좌표 최신화 안전**(진주·문화·양가네): 도로명/좌표만 최신값으로.
- **place_id 불일치 = 현장/이전 확인 필수**(시골집=확인 후 신 place_id 채택 / 도희네=미확인 보류).

## 3. 판정: WARNING (KNOWN_WARN_BACKLOG)

- 4곳 수정안 확정 + 이미 DB 반영(감사 스냅샷은 교정 前 상태라 P0가 재감사 시 5→1로 축소 예상).
- 도희네 1곳 미해결 = known-warn 백로그(즉시 DB 작업 아님).
- 실장애 아님(사이트/검색/상세 200 정상, health 기준).

## 4. 잔존/후속 (P0 아님 — 이번 미실행)

- **도희네(유일 실작업 대상):** db_place_id 510744836 Kakao 재조회 → (a) 유효하고 청사포로 157 "청사포 도희네 조개구이"면 현 DB 유지(도희네 887616579는 별개 업장), (b) 무효/폐업이면 도희네(887616579, 청사포로 12) 교체 여부 현장/웹 확인 후 결정.
- 전화 보강 후보(별개): 문화양곱창 051-345-0001(placeholder 의심) / 진주식당 051-412-6799↔Kakao 051-416-5948 불일치.
- **실제 DB write 는 대장 승인 + read-only dry-run(--apply 없음) 먼저.** 현재 DB 최신값 재확인은 2026-07-10 dry-run 기준이며, 원하면 승인 후 read-only 재확인 가능.

## 5. 위험 작업 미실행 확인

- DB write 0 / 데이터 수정 0 / 스크립트 --apply 0 / promote 0 / 착수(추가) 0 / 배포 0 / 외부발송 0 / 유료 API 0 / git add·commit·push 0.
- 실행: 나온집 repo 기존 리포트·CSV read-only 대조(감사 md/csv, preflight, recheck).
- write 범위: 본 보고서 1개(naonzip/reports/data-quality/).
