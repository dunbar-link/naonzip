---
name: naonzip-ops-check
description: 나온집 운영 상태(Git·공개 DB 정합성·TypeScript·build·sitemap·주요 공개 URL·운영 문서)를 읽기 전용으로 1회 점검하고 reports/ops-loop/latest.md에 PASS/WARNING/BLOCKED로 기록한다. 수정·커밋·배포는 하지 않는다.
---

# 나온집 운영 점검 (naonzip-ops-check)

읽기 전용 운영 점검을 **딱 한 번** 실행하고 `reports/ops-loop/latest.md`에 기록한다.
정책은 `docs/ops/LOOP_POLICY.md`를 따른다. 반복 실행·자동 재시도·자동 수정·자동 commit/push 금지.

## 절대 금지
- DB/Storage write(insert/update/delete/upsert/rpc), 앱 코드(src/**) 수정, 스키마 변경
- 데이터 자동 수정, 자동 git add/commit/push/deploy, 외부 패키지 설치
- env 값·service_role 키 출력
- 전체 공개 URL(90개) 무차별 요청

## 실행 절차 (이 순서대로 1회)

1. **루트 확인**: `C:\work\naonzip`에서 실행 중인지 확인.
2. **Git 상태**: `git branch --show-current`, `git status --short`, `git rev-parse HEAD`, `git rev-parse origin/master`.
   - PASS: branch=master, working tree clean(이번 MVP 신규파일 4종 + latest.md는 "정상 변경"으로 구분), HEAD==origin/master
   - WARNING: reports/구현파일 관련 untracked/modified만 존재 / 로컬 ahead(push 대기)
   - BLOCKED: src/** 등 앱 코드 예상 외 변경 / merge conflict / detached HEAD / origin보다 behind / master 아님
3. **DB 점검**: `node scripts/ops-check.mjs` 실행 → stdout JSON 확보. (이 스크립트가 DB 정합성 + sitemap + 주요 공개 URL + 문서 일치 4개를 read-only로 점검)
   - JSON을 OS 임시폴더 등 repo 밖/ignored 임시파일에 저장해도 되나, **최종적으로 임시파일을 삭제**하고 repo에 남기지 않는다.
4. **TypeScript**: `npx tsc --noEmit` → exit 0 = PASS, non-zero = BLOCKED.
5. **Build**: `npm run build` → exit 0 = PASS, non-zero = BLOCKED. 정적 페이지 수는 출력에서 추출해 기록(이전 수와 달라도 그 이유만으로 실패 처리 금지).
6. **종합**: ops-check JSON의 4개 status + Git/TypeScript/Build = 7개 항목. 종합 판정은 BLOCKED>WARNING>PASS 우선순위.
7. **latest.md 작성**: `reports/ops-loop/latest.md`를 아래 형식으로 **전체 덮어쓰기**. 각 항목에 판정 + **근거(카운트/URL/exit code/오류 요약)** 기록. 단순 PASS/WARNING/BLOCKED만 적지 않는다. 문제 식당은 식당명+slug, 항목당 최대 20개·초과 시 총개수+샘플.
8. **변경 범위 확인**: `git status --short`, `git diff --stat`. 허용 변경은 4개 파일(SKILL.md/LOOP_POLICY.md/scripts/ops-check.mjs/reports/ops-loop/latest.md)뿐. src/** 변경 시 원복하고 BLOCKED 보고.
9. **종료**. git add/commit/push 하지 않는다.

## latest.md 형식 (요약)
- 실행 정보(시각/branch/HEAD/origin/종합 판정) → 요약 표(PASS/WARNING/BLOCKED 개수) →
  점검 결과 표(Git/DB/TypeScript/Build/Sitemap/주요 공개 페이지/운영 문서) →
  DB 현황(카운트) → Sitemap → 주요 URL 표 → TypeScript/Build → WARNING 목록 → BLOCKED 목록 →
  변경 범위 → 다음 권장 작업(최대 3, 자동 수행 안 함).

## 참고
- 현재 기준값: 전체 107 / 공개 90 / 공개 thumbnail 90·누락 0 / 비공개 만우장 slug=sungsik-gwangalli-manujang(상세 404 기대).
- 해운대암소갈비 전화 등 placeholder 의심은 WARNING으로 탐지되는 것이 정상(강제 PASS 금지, 실제 결과 사용).
