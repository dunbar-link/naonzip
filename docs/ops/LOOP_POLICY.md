# 나온집 운영 점검 루프 정책 (LOOP_POLICY)

읽기 전용 운영 점검 MVP의 고정 정책. skill(`naonzip-ops-check`)과 `scripts/ops-check.mjs`는 이 문서를 따른다.

> **빠른 요약(read-only)**: 긴 ops-check 파이프 명령(`node scripts/ops-check.mjs 2>&1 | node -e "..."`)을 매번 입력하면 권한 프롬프트가 반복된다. 대신 고정 명령 `node scripts/ops-check-summary.mjs`(또는 `npm run ops:summary`)로 핵심 요약만 본다. 이 래퍼는 `ops-check.mjs`를 내부 실행해 JSON을 파싱·요약할 뿐, DB/Storage write·파일 쓰기·git·배포는 하지 않는다.

## 목적

- 나온집 운영 상태(코드 헬스 + 공개 DB 정합성 + 운영 URL)를 **반복 가능하게 1회 점검**한다.
- 문제를 발견해도 **수정하지 않고 보고**만 한다. 수정 여부는 운영자가 별도로 승인한다.

## 허용 작업

- Git 상태 조회 (status / rev-parse / log)
- 운영 DB **SELECT만** (service_role 사용 가능하나 키 값 미출력)
- 파일 읽기
- `npx tsc --noEmit`
- `npm run build`
- 운영 URL에 대한 **제한된 GET/HEAD**(핵심 + 샘플, 최대 ~10개)
- `reports/ops-loop/latest.md` 작성(덮어쓰기)

## 금지 작업

- DB write 전부: insert / update / delete / upsert / rpc
- Storage write 전부
- 앱 코드(src/**) 수정 / 스키마 변경 / 신규 식당 추가
- 데이터 자동 수정
- 자동 commit / push / deploy
- 전체 공개 URL(90개) 무차별 요청
- 반복 재시도 / 무한 루프 / 자동 재실행
- 외부 패키지 설치
- env 값·service_role 키·URL 토큰 출력

## 판정 체계

- **PASS**: 정상이며 즉시 조치 불필요
- **WARNING**: 서비스는 동작하나 운영자 확인 또는 향후 교정 필요
- **BLOCKED**: 빌드 실패·필수 데이터 손상·핵심 페이지 장애·실행 환경 접근 실패 등으로 정상성을 보장할 수 없는 상태

### 종합 판정 (우선순위)

1. BLOCKED 하나라도 → 종합 **BLOCKED**
2. BLOCKED 없고 WARNING 하나라도 → 종합 **WARNING**
3. 전부 PASS → 종합 **PASS**

## 중단 조건

- DB write 가능성이 발견됨 / 예상 외 src/** 수정이 필요함
- 외부 패키지 설치가 필요함 / env 접근 불가 / 운영 URL 접근 불가
- 기존 프로젝트 규칙(CLAUDE.md/AGENTS.md)과 충돌 / 실행 대상이 예상 범위를 벗어남

> 단, **일부 독립 항목의 접근만 실패**한 경우 전체 실행을 즉시 포기하지 않는다.
> 해당 항목을 BLOCKED로 기록한 뒤 나머지 읽기 전용 점검은 계속한다.

## 산출물

- `reports/ops-loop/latest.md` 1파일 덮어쓰기. 날짜별 history는 1차 MVP 범위 아님.
- 점검 결과 파일·구현 파일의 commit/push는 **자동으로 하지 않는다**(운영자 확인 후 별도).
