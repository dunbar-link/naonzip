<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:browser-verification-gate -->
# 완료 게이트 — 웹 UI 통합 브라우저 검증 (필수)

웹 UI 관련 변경은 **빌드·타입체크·기존 테스트 PASS만으로 완료(PASS) 처리 금지.**
로컬 dev 서버에서 변경과 관련된 핵심 흐름을 Claude Code 통합 브라우저로 실측한 뒤에만 PASS를 낸다.
새 테스트 시스템·과설계 금지. 이 게이트는 완료 조건이지 별도 기능이 아니다.
(1차 파일럿 근거: `reports/browser-verification/pilot-2026-07-11.md`. E2E 스모크는 `docs/testing/playwright-search-detail.md` 참조 — 중복 아님, 통합 브라우저 실측이 완료 게이트, Playwright는 회귀 스모크.)

## 적용 대상 (아래 중 하나라도 해당하면 게이트 적용)
- 화면 또는 CSS 변경
- 사용자 클릭 흐름 변경
- 라우팅 또는 링크 변경
- 이미지 또는 지도 변경
- 브라우저에 표시되는 데이터 변경

## 제외 대상 (브라우저와 무관 — 게이트 비적용, 생략 사유만 최종보고에 명시)
- 순수 문서 변경
- 서버 내부 로직(브라우저 표시 결과에 영향 없는 경우)
- read-only 조사·분석

## 검증 절차 (변경 관련 흐름만, 전체 앱 재검증 아님)
1. 로컬 dev 서버 기동(있으면 재사용) → 통합 브라우저로 변경된 페이지·흐름 실측.
2. PC와 모바일 390px 둘 다 확인.
3. 콘솔 치명 오류(error) 확인.
4. 실패 네트워크 요청 확인.
5. 렌더링 / 클릭(내비게이션) / 404 처리 / 가로 오버플로(`scrollWidth == clientWidth`) 확인.
6. 문제 발견해 수정하면 **동일 흐름 재검증**.
7. 실제 브라우저 검증이 불가능하면 PASS 대신 **WARNING** 또는 **BLOCKED**로 판정하고 사유·필요한 설정 1개를 보고.

## 자동화 한계 처리 (아티팩트를 서비스 실패로 오판 금지)
통합 브라우저 자동화의 알려진 한계는 아래 근거로 대체 검증한다. 대체 검증이 통과하면 실사용 결함 아님.
- **screenshot 타임아웃**: 그것만으로 서비스 실패 판정 금지. DOM 구조·치수·텍스트·네트워크 응답 근거로 대체 검증 가능.
- **lazy 이미지 미로드**(`complete=false`/`naturalWidth=0`): 실제 이미지 URL 응답 상태(200·content-type)와 `new Image()`/`naturalWidth`·`naturalHeight`로 로드 확인. URL 200 + 디코드 성공이면 정상.
- **좌표 left_click no-op**(참조: 메모리 `reference_preview_click_noop`): DOM 기반 클릭(요소 `.click()` / 이벤트 dispatch)으로 재검증.

## 최종 PASS 예외 (안전)
중요한 **사용자 입력·구매·저장·삭제** 흐름은 JS dispatch(코드 주입) 클릭만으로 최종 PASS 금지.
이런 흐름은 실제 UI 상호작용 또는 명시적 수동 확인으로 마감한다.
<!-- END:browser-verification-gate -->
