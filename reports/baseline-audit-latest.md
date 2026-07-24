전체 판정: WARNING

# NAONZIP-MASTER-BASELINE-AUDIT — 2026-07-23 (read-only)

- 실행 시각: 2026-07-23 (KST) / 지시 ID: NAONZIP-MASTER-BASELINE-AUDIT-20260722
- 성격: **read-only.** DB SELECT·GET·로컬 read만. DB write 0 / 코드수정 0 / commit·push 0 / 배포 0 / 외부발송 0. 산출물: 이 보고서 1개.
- 한 줄 결론: **운영·품질·자동점검은 전부 정상 작동(운영 200, 품질 P0=0, health check 오늘 아침 성공). 단 ① 미푸시 커밋 1개+미커밋 보고서 3개(승인 대기) ② 신규 등록이 2026-06-25 이후 약 4주 정지 — 주 1회 신규 점검 루틴이 문서화만 되고 실행 0회.**

## 1. Git 기준선
| 항목 | 값 |
|---|---|
| branch | master |
| HEAD | **6ed2020** (2026-07-12 "chore: typecheck 스크립트 추가 — CSI Stage5.2") |
| origin | **로컬 1 ahead / 0 behind — 6ed2020 미푸시** |
| status | untracked 3: reports/data-quality/{dohee-recheck-2026-07-12, p0-fix-proposal-final-2026-07-12, p0-recheck-2026-07}.md |
| 코드 변경 | 0 (untracked는 전부 보고서) |

## 2. 최신 실제 숫자 (2026-07-23 실측)
| 항목 | 값 | 근거 |
|---|---|---|
| 전체 식당 | **156** | ops:summary(DB SELECT) |
| 공개 식당 | **139** | ops:summary + quality:audit live |
| sitemap | **176 URL / 상세 139 = 공개 139 일치 PASS** | 운영 sitemap.xml + ops:summary |
| 공개 우슐랭 | **40** (CSV 92 중 등록 40) | candidates:summary + sitemap postoffice- 카운트 40 |

## 3. DB 업데이트 / 자동 점검 작동 여부
- **신규 등록 마지막: 2026-06-25** (created_at 최신 = 순돌이보리밥). 이후 신규 등록 0 — 약 4주 공백.
- P0 4곳 교정(양가네·진주식당·문화양곱창·시골집)은 DB 반영 완료(2026-07-10 dry-run SELECT로 확인). updated_at 컬럼 부재로 정확한 update 시각은 특정 불가.
- **예약 자동점검 정상 작동:**
  - `Naonzip Health Check Daily` 매일 07:10 → **오늘(07-23) 07:10 실행, exit 0** → naonzip-health-latest 갱신: WARNING(known-warn), production 200(1229ms), 공개 139, trust 누락 0, quality PASS, sitemap 176.
  - `AI-OPS-NAONZIP-HEALTH-SHOW` 매일 06:08 정상.
- **주간 레이더/신규업체 점검: 자동 예약 없음(설계대로 수동 문서 루틴).** 단 2026-07-02 문서화 이후 **실행 기록 0회** — 주 1회 운영 기준 미달.

## 4. 후보 현황 (READY / REVIEW / HOLD)
- 우슐랭 CSV 기준: 미등록 52 = **READY_FOR_IMAGE 40 / REVIEW 12** (HOLD 분류 없음).
- 단 수기 보정(메모): clean READY 사실상 소진 — 잔여는 근접 수기확인(10곳)·보완 대기(왕짜장·봉식당·소설가 등)·SKIP(카페·디저트 13) 성격. 숫자만 보고 등록 여력 40으로 오판 금지.
- 레이더 READY_NEW/READY_TRUST: 루틴 미실행으로 후보 큐 없음.

## 5. 폐업·주소·전화 변경 후보
- P0 5곳 → 4곳 교정 완료 + 도희네 NO_CHANGE 확정(2026-07-12 + 2026-07-10 keyword 재검증: place_id 510744836 유효, DB 정확).
- 잔존 전화 보강 후보 2 (P0 아님, 승인 후 별도): 문화양곱창 051-345-0001(placeholder 의심, Kakao=051-804-5140) / 진주식당 051-412-6799↔Kakao 051-416-5948 불일치.

## 6. 품질 검사 (live, 2026-07-23)
- address: EXACT 98 / VARIANT 36 / LOOKUP_FAILED 4 / NAME_MATCH 1
- coordinate: EXACT 120 / VARIANT 14 / LOOKUP_FAILED 4 / NAME_MATCH 1
- **P0(주소·좌표 mismatch) = 0** / P2 5 / P3 134
- trust source 누락 0 / thumbnail 누락 0 / slug 중복 0
- known-warn(고정, 조치 불필요): 공개 phone 누락 4(전부 PHONE_NOT_FOUND 종결) + 도희네 NAME_MATCH 1(감사 쿼리순서 한계 false positive, DB 정확 확정)

## 7. 운영 URL / GSC
- 운영 홈 HTTP 200 (오늘 아침 health 1229ms + 방금 실측 200).
- GSC 동영상 구조화데이터: 수정(40a3df2) 이후 **운영 VideoObject=0 / CreativeWork=1 유지 확인**. Restaurant/Breadcrumb/WebSite 정상. GSC "수정 확인" 요청은 대장 몫(상태 미확인 시 지금 가능).

## 8. 판정 · 승인 필요 항목
- **판정: WARNING** — 실장애 0, 자동점검 작동, 품질 정상. WARNING 사유: ① 미푸시 커밋 6ed2020 + 미커밋 보고서 3개(§1) ② 주 1회 신규 점검 루틴 실행 0회·신규 등록 4주 공백(§3·4).
- **대장 승인 필요:** (a) 6ed2020 push + 보고서 3개 커밋 여부 (b) 주간 신규 점검(레이더 1회차 실행 or 우슐랭 근접 수기확인) 재개 여부.
- verify:regression 미실행 사유: 코드 무변경 + 구성요소(quality:audit·ops:summary·sitemap·검색·diff)를 개별 실측으로 커버.
- sitemap:check 단독 실행은 --slugs 인자 필요(BLOCKED 출력)이나 ops:summary 내 sitemap 검증 PASS로 커버.

## 9. 위험 작업 미실행 확인
DB write 0 / 데이터 수정 0 / --apply 0 / promote 0 / 배포 0 / 외부발송 0 / 유료 API 0 / git add·commit·push 0 / 무관 프로젝트 write 0(AI운영실은 naonzip health 보고서 read만). 성장 실험(보상 루프·쇼츠 추적·유료 홍보·크리에이터 협업) 착수 0 — 지시대로 보류.

## 10. 다음 단일 작업(제안 — 자동 실행 안 함)
**6ed2020 push + 미커밋 보고서 3개 커밋·푸시 정리(대장 승인 후).** 기준선을 clean으로 만든 뒤 주간 신규 점검 재개 여부를 별도 결정.
