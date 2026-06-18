# 우슐랭 검색 필터 타당성 판정

## 결론: **보류 (신규 등록 선행 필요)**

| 항목 | 값 |
|---|---|
| 공개 우슐랭 예상 식당 수(현재) | **0** |
| 기존 식당 출처 연결 예상(EXISTING_LINKABLE) | 0 |
| 신규 등록 후보 | READY 80 + REVIEW 12 |
| 즉시 구현 가치 | 낮음 (매칭 데이터 없음) |
| 신규 등록 선행 필요 | 예 |

PASS 권장 기준은 "공개 EXISTING_LINKABLE 5곳 이상"인데 실제 **0곳**. 지금 우슐랭 필터를 추가하면
매칭 식당 0곳 → 필터가 빈 결과만 낸다. 따라서 **신규 등록(최소 5곳 공개) 이후** 구현이 타당.

## 데이터 모델 (구현 시)
- restaurants.source_type: **변경 안 함**
- trust_sources: source_kind=guide, source_name="우체국 추천 맛집가이드 2026", trust_label="가이드 수록"
- 신규 DB 구조/테이블: **불필요** (기존 restaurant_trust_sources 재사용)
- 한 식당 다중 출처 보존 가능(미슐랭+부산공식+우슐랭 공존 OK)
- 필터키: postoffice / 표시명: 우슐랭

## `전체` 버튼 제거 + 필터 구조 (구현안 — 이번 미구현)
- 펼침 순서: 방송 / 미슐랭 / 부산공식 / 유튜브 / **우슐랭** (전체 버튼 제거)
- 내부 `all` 상태는 유지. 해제 방식(가장 단순): 제목 우측 "선택 출처 + 수" 옆 작은 `×` →
  내부 all + URL tab 제거 + 저장값 all + 전체 94 표시.
- 제목: 우슐랭 포함 후엔 `방송 검색` 보다 **`출처 검색`** 이 더 정확.
- URL fallback·마지막 출처 탭 기억: 유지 / DB migration: 불필요
- 예상 변경 파일: src/components/search/SearchClient.tsx, src/lib/sources.ts
- 회귀 위험: 낮음 (단 데이터가 선행돼야 의미)

## 공식 출처 URL
- 발행처 공식 도메인: https://www.koreapost.go.kr/bs/index.do (부산지방우정청)
- 책자 PDF 공식 게시 URL: **OFFICIAL_URL_REVIEW** (공식 사이트에서 미확인, 임의 URL 입력 안 함)

## 다음 단일 작업 권장 (우선순위)
1. **신규 후보 사진 준비 + 비공개 등록** (READY 80곳 중 우선순위 선별) — 1순위
2. 우슐랭 trust_sources 연결은 등록과 동시
3. 우슐랭 필터 UI 구현은 **공개 식당 5곳 이상 확보 후**
