# 나온집 Playwright — 검색 → 상세 E2E

나온집의 가장 중요한 공개 사용자 흐름 **“검색 → 검색 결과 확인 → 상세페이지 진입”** 을
Playwright 테스트 1개로 반복 검증한다.

## 검증하는 흐름
1. `/search` 진입
2. 검색창에 식당명 입력
3. 결과 카드 노출 확인
4. 카드 클릭 → 상세페이지(`/restaurants/<slug>`) 이동
5. URL slug 일치 + 상세 `h1`(식당명) + 안정 섹션(위치 / 어디서 봤나요) 확인
6. 런타임 JS 오류(pageerror) 없음

## 테스트 대상 식당
- restaurantName: `원조가야밀면`
- searchKeyword: `원조가야밀면`
- expectedSlug: `wonjo-gaya-milmyeon`
- 선정 이유: 현재 공개 상태이고 이름이 distinctive(검색 name 필드 가중치 10으로 상단 노출),
  slug 안정적, 상세페이지 정상 렌더(라이브 데이터로 확인). 테스트용 새 데이터 생성 불필요.
- 로컬 dev 도 운영과 동일 Supabase(.env.local)를 읽으므로 같은 데이터로 검증된다.

## 생성 파일
- `playwright.config.ts`
- `e2e/search-detail.spec.ts`
- `docs/testing/playwright-search-detail.md`
- `package.json`(scripts 추가), `.gitignore`(산출물 경로 추가)

## Chromium만 쓰는 이유
핵심 흐름 1개의 반복 검증이 목적이라 브라우저 매트릭스가 불필요하다.
Firefox/WebKit는 설치하지 않는다(설치·CI 비용 최소화). 필요해지면 그때 추가한다.

## 실행법 (C:\work\naonzip)
```
# 로컬 (Playwright가 전용 포트 3247로 dev 서버 자동 시작·정리)
npm run test:e2e

# 헤드풀(브라우저 보며)
npm run test:e2e:headed

# UI Mode(인터랙티브)
npm run test:e2e:ui

# 직전 실행 HTML 리포트 열기
npm run test:e2e:report
```

### 운영 URL 읽기 전용 테스트
```
$env:PLAYWRIGHT_BASE_URL = "https://naonzip.vercel.app"
npm run test:e2e
Remove-Item Env:PLAYWRIGHT_BASE_URL
```
- `PLAYWRIGHT_BASE_URL` 이 있으면 로컬 dev 서버를 띄우지 않고 운영 URL로 같은 흐름을 검증한다.
- 읽기 전용만 — 로그인/입력/저장/신고/관리자 기능은 실행하지 않는다.
- 테스트 후 환경변수는 반드시 제거한다.

## 실패 시 확인 순서
1. HTML report: `npm run test:e2e:report` (또는 `playwright-report/index.html`)
2. trace: 실패 시 `test-results/.../trace.zip` → `npx playwright show-trace <trace.zip>`
3. screenshot: 실패 시 `test-results/` 하위 자동 저장(only-on-failure)

## 테스트 전용 포트
- `3247` (config 의 `TEST_PORT`). 기존 3000/3100 서버를 종료·재사용하지 않는다.
- `reuseExistingServer: false` — Playwright가 시작한 서버만 테스트 종료 시 정리.

## PASS 기준
- 검색창 노출 → 검색어 입력 → 결과 카드 노출 → 상세 이동 → slug 일치 →
  h1(식당명) + 위치/어디서 봤나요 섹션 노출 → pageerror 0 → 테스트 PASS.

## 이번에 포함하지 않은 범위
- 인증/관리자/제보/저장/지도 인터랙션, 스크린샷 비교, 다중 사용자 흐름,
  Page Object 대형 구조, GitHub Actions/CI, Firefox/WebKit, Vercel 배포 연동.

## 다음 테스트 추가 조건
이 1개 테스트를 실제 개발 수정 전·후로 3회 사용해 안정성을 확인한 뒤,
두 번째 핵심 흐름(예: 지도/공유, 카테고리·지역 탐색) 추가 여부를 판단한다.

## 실사용 기록
### 1/3 — ESLint 생성물 ignore 최소 보정 (2026-06-20) · 판정 PARTIAL
- 변경 종류: `eslint.config.mjs` 에 `.claude/worktrees/**/.next/**` ignore 1줄 추가(앱 코드 무변경).
- 변경 전 E2E: PASS / 변경 후 E2E: PASS / E2E 회귀: 없음
- lint: `.claude/worktrees/*/.next` 생성물 노이즈 322건 → **0** 제거. build 후에도 `.next` 재오염 없음.
- 단, 정상화 과정에서 **기존 실제 소스 lint 에러 6건 발견**(React 훅 규칙, setState-in-effect / refs-during-render):
  `src/hooks/useSaved.ts:18·40`, `src/components/search/SearchClient.tsx:205`,
  `src/components/restaurant/RestaurantsClient.tsx:29`, `src/components/map/KakaoMapView.tsx:83`,
  `src/app/admin/restaurants/[slug]/edit/EditForm.tsx:178`.
  → 스펙대로 ignore/자동수정하지 않고 **잔여 문제로 보고**. `npm run lint` 는 여전히 exit 1 → **판정 PARTIAL**.
- typecheck: PASS / build: PASS / Playwright 파일 ESLint: CLEAN
- 두 번째 테스트 추가: 보류

### 2/3 — React lint 오류 정상화 + ESLint worktree 경계 보정 (2026-06-20) · 판정 PARTIAL
- 변경 종류: 실제 소스 React 훅 오류 수정(5/6) + `eslint.config.mjs` 의 worktree ignore 를
  `.claude/worktrees/**/.next/**` → `.claude/worktrees/**` 로 확장.
  · worktree 중복 lint 제거 이유: `.claude/worktrees/*` 는 각각 독립된 git worktree(별도 작업본,
    `claude/*` 브랜치, `git worktree list` 로 확인)라 메인 작업본이 중복 검사할 필요가 없다(각자 자체 lint).
- 변경 전 E2E: PASS / 변경 후 E2E: PASS ×2 / flaky: 없음 / 실제 잡은 회귀: 없음
- 수정한 5건(동작 보존, eslint-disable·규칙비활성 미사용):
  · `useSaved.ts`(2): localStorage+이벤트 구독 → `useSyncExternalStore`(getServerSnapshot=기본값, 배열 스냅샷 캐시)
  · `KakaoMapView.tsx`(1): 초기 status 를 NEXT_PUBLIC env(빌드 상수)로 결정 → effect 의 `setState('no-key')` 제거
  · `RestaurantsClient.tsx`(1): 지역 필터 localStorage 복원 → `useSyncExternalStore`
  · `EditForm.tsx`(1): 렌더 중 `ref.current` 읽기 → 1회 캡처 `useState` 값으로(렌더 안전)
- 보류 1건(PARTIAL 사유): `SearchClient.tsx:205` 출처탭 localStorage 복원. 이 state 는
  URL 파라미터 seed + localStorage 복원 + 사용자 변경 + URL 미러가 얽혀 있어, 규칙을 만족시키는
  store 기반 변환이 "URL 파라미터가 있을 때 탭 클릭" 흐름을 깨뜨린다 → 동작 보존을 위해 수정 보류(은폐·규칙비활성 안 함).
- lint: worktree/.next 노이즈 0. 남은 `npm run lint` = 1 error(위 보류 1건) + 5 warnings(`scripts/*.mjs` no-unused-vars, 이번 허용 파일 범위 밖) → exit 1.
- typecheck: PASS / build: PASS (230 페이지, /search·/restaurants/wonjo-gaya-milmyeon 정상)
- 두 번째 테스트 추가: 보류

### 3/3 — SearchClient 탭 상태 리팩터 (2026-06-20) · 판정 PARTIAL(Browser 인터랙티브만 차단)
- 변경 종류: 마지막 `react-hooks/set-state-in-effect`(SearchClient 출처탭 복원) 제거.
  탭 상태를 `userTab`(세션 선택, URL 파라미터로 마운트 시드 → hydration 안전) + `storedTab`
  (localStorage, `useSyncExternalStore`)로 분리하고 `tab = userTab ?? storedTab` 파생.
  localStorage 저장은 deps 완전한 effect(외부 동기화, setState 아님). eslint-disable·규칙비활성 미사용.
- 동작 보존(기준표 A~G): URL 우선 / localStorage 복원 / 기본 all / 클릭 / 새로고침 / back-forward sticky /
  잘못된 값→all 모두 유지. (URL 파라미터 이름 `tab`, localStorage key `naonzip:last-source-tab` 그대로)
- 변경 전 E2E: PASS / 변경 후 E2E: PASS ×3 / flaky: 없음 / 실제 잡은 회귀: 없음
- lint: **errors 0**(npm run lint exit 0), warnings 5(scripts/*.mjs, 범위 밖) / typecheck: PASS / build: PASS
- Browser 탭 검증: Claude in Chrome 이 이 세션에서 localhost 도메인을 차단 → 인터랙티브(클릭·back/forward)
  미수행. 대신 **서버사이드 HTTP** 로 URL→탭 매핑 검증: `/search`=기본 all(빈 프롬프트),
  `?tab=tv`·`?tab=michelin`=결과 렌더, `?tab=zzzinvalid`=all 처리 → A·C·E(새로고침)·직접URL·G 확인.
  (추측 PASS 안 함 — 인터랙티브 부분만 PARTIAL)
- Playwright 표준 실사용: 3/3 완료. 3회 동안 E2E 자체가 잡은 코드 회귀는 0건(설정/리팩터 안전망으로 기능).
- 두 번째 테스트 추가 판단: **현재 1개 유지 권장**. 검색→상세 핵심 흐름은 커버됨. 추가 가치가 가장 높은
  후보는 "출처 탭 클릭 → URL/결과 반영" 1개지만, 유지비 대비 지금은 보류.
