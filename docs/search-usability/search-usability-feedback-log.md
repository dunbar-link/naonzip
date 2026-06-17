# 나온집 검색 사용성 — 피드백 로그

> 테스트 결과를 기록하는 문서.
> 한 줄 = 한 명의 한 과제. (테스터 1명당 3줄: 과제 1 / 2 / 3)
> 사용자가 **성공한 행동도 반드시 기록**한다.

진행 방법은 [테스트 가이드](search-usability-test-guide.md), 한 장 체크리스트는 [진행 체크리스트](search-usability-checklist.md) 참고.

---

## 기록 항목 설명

| 항목 | 뜻 | 예시 |
|---|---|---|
| tester | 익명 번호 | Tester 01 |
| device | 기기 / 브라우저 | 갤럭시 / 크롬 |
| task | 과제 번호 | 1 · 2 · 3 |
| success | 성공 여부 | 성공 / 실패 |
| completion_time | 완료 시간(초) | 8s |
| first_action | 첫 클릭·터치 위치 | 검색창 / 추천검색어 / 미슐랭필터 |
| blocked_point | 막힌 위치 | 필터를 못 찾음 |
| help_needed | 도움 제공 여부 | Y / N |
| user_quote | 사용자가 실제로 한 말 | "이게 필터인 줄 몰랐어요" |
| severity | 문제 등급 | P0 / P1 / P2 / Backlog / - |
| repeated_issue | 반복 문제 여부 | Y / N |
| decision | 처리 판단 | 수정검토 / 보류 / - |

> 성공한 경우 severity·decision은 `-` 로 둔다.

---

## 기록 표

| tester | device | task | success | completion_time | first_action | blocked_point | help_needed | user_quote | severity | repeated_issue | decision |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Tester 01 |  | 1 |  |  |  |  |  |  |  |  |  |
| Tester 01 |  | 2 |  |  |  |  |  |  |  |  |  |
| Tester 01 |  | 3 |  |  |  |  |  |  |  |  |  |
| Tester 02 |  | 1 |  |  |  |  |  |  |  |  |  |
| Tester 02 |  | 2 |  |  |  |  |  |  |  |  |  |
| Tester 02 |  | 3 |  |  |  |  |  |  |  |  |  |
| Tester 03 |  | 1 |  |  |  |  |  |  |  |  |  |
| Tester 03 |  | 2 |  |  |  |  |  |  |  |  |  |
| Tester 03 |  | 3 |  |  |  |  |  |  |  |  |  |
| Tester 04 |  | 1 |  |  |  |  |  |  |  |  |  |
| Tester 04 |  | 2 |  |  |  |  |  |  |  |  |  |
| Tester 04 |  | 3 |  |  |  |  |  |  |  |  |  |
| Tester 05 |  | 1 |  |  |  |  |  |  |  |  |  |
| Tester 05 |  | 2 |  |  |  |  |  |  |  |  |  |
| Tester 05 |  | 3 |  |  |  |  |  |  |  |  |  |

> 테스터가 3명이면 Tester 04·05 줄은 비워둔다.

---

## 빠른 입력용 템플릿 (스마트폰에서 받아적기)

한 과제 끝날 때마다 아래를 복사해서 채운다.

```text
tester: Tester 0_
device:
task:
success:
completion_time:
first_action:
blocked_point:
help_needed:
user_quote:
severity:
repeated_issue:
decision:
```

---

## 테스트 후 질문 답변 기록

| tester | Q1 첫화면 파악 | Q2 필터 보임 | Q3 부산공식 이해 | Q4 불편/헷갈림 | Q5 다시 쓸 이유 |
|---|---|---|---|---|---|
| Tester 01 |  |  |  |  |  |
| Tester 02 |  |  |  |  |  |
| Tester 03 |  |  |  |  |  |
| Tester 04 |  |  |  |  |  |
| Tester 05 |  |  |  |  |  |

---

## 집계 (테스트 끝나고 채우기)

```text
테스트 인원:
과제 1 성공률:        (성공/인원)
과제 2 성공률:
과제 3 성공률:
P0 건수:
동일 P1 반복:
다시 쓸 이유 설명 인원:
PASS 여부:
```

> 판정 기준은 [테스트 가이드](search-usability-test-guide.md) 7번 참고.
