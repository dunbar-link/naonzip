# 나온집 PORT-P3 — 캡처 실행 계획

> 운영자가 순서대로 직접 캡처. 자동 생성하지 않는다(실패 시 무리하지 말 것).
> 권장 폭: 모바일 390~430px(공개), Admin은 데스크톱 가능. **Admin은 주소창/쿠키/비밀번호 가림.**
> 신뢰 출처 칩이 안 보이면 ISR(최대 1시간) 지연 → 해당 식당 Admin 저장 1회(revalidate) 후 새로고침.

## 우선순위 A — 먼저 캡처 (one-pager·blog·shorts EP.01 필수)

| 순서 | 화면 | URL | 로그인 | 보여줄 포인트 | 파일명 | 쓸 곳 |
|------|------|-----|--------|---------------|--------|-------|
| A1 | 홈 | / | X | "부산 맛집, 어디서 봤는지까지" 히어로 + 카드 | 01-home.png | one-pager·blog 표지·shorts 컷1 |
| A2 | 상세(신뢰 출처) | /restaurants/tzuyang-nampo-ijaemo-pizza | X | "어디서 봤나요" + local 칩(비짓부산) + "추가 출처" + "출처 보기" 링크 | 04-detail-trust.png | **핵심 차별점**·shorts 컷4 |
| A3 | Admin 신뢰 출처 입력 | /admin/restaurants/tzuyang-nampo-ijaemo-pizza/edit (하단 "신뢰 출처") | O | source_kind/이름/URL/라벨/공개 토글 + 과장표현 방지 안내 | 10-admin-trust-input.png | **운영 자동화**·shorts 컷5 |

## 우선순위 B — 다음 캡처 (case study·영업자료 보강)

| 순서 | 화면 | URL | 로그인 | 보여줄 포인트 | 파일명 | 쓸 곳 |
|------|------|-----|--------|---------------|--------|-------|
| B1 | 상세(다중 출처) | /restaurants/hibab-haeundae-amsogalbi | X | 유튜브 칩 + local 칩 동시(미쉐린 staged는 미노출) | 05-detail-multi.png | blog·case study |
| B2 | 목록 | /restaurants | X | 지역 필터 + 카드(출처 칩) | 02-list.png | one-pager·case study |
| B3 | 검색 | /search | X | 추천 검색어 + "출처로 찾기" | 07-search.png | case study |
| B4 | Admin 후보 큐 | /admin/candidates | O | 후보 수집→검토→변환 흐름 | 08-admin-candidates.png | 영업자료(데이터 운영) |
| B5 | Admin 식당 수정 | /admin/restaurants/[slug]/edit | O | 편집 폼 + 빠른 붙여넣기 | 09-admin-edit.png | 영업자료(CMS 깊이) |

## 우선순위 C — 여유 시 (구조 증빙)

| 순서 | 항목 | 보여줄 포인트 | 파일명 | 쓸 곳 |
|------|------|---------------|--------|-------|
| C1 | 지도 | Kakao 지도 + 핀 | 06-map.png | case study |
| C2 | Supabase 테이블 | 5개 테이블 + RLS | 12-supabase-tables.png | 영업자료 |
| C3 | reports 폴더 | reports/*.md·csv 목록 | 14-reports.png | case study(감사 추적) |
| C4 | git log | commit 130+개·Phase 메시지 | 15-gitlog.png | 영업자료(작업 밀도) |

## 캡처 후 배치 가이드

- **one-pager(naonzip-final-onepager.md)**: A1 + A2 + (B2)
- **blog(naonzip-blog-final.md)**: A1(표지) → A2 → A3 순서로 본문 삽입, B1 보조
- **shorts EP.01(naonzip-shorts-episode-01.md)**: 컷1=A1, 컷4=A2(줌), 컷5=A3
- **영업자료(naonzip-ai-ops-onepage-sales.md)**: A3 + B4 + B5 + C2 (운영 도구가 실제로 돈다 증빙)

## 체크

- [x] A1~A3 캡처 완료 → one-pager/blog/shorts 1차 발행 가능 **(2026-06-10, PORT-P4)**
  - 실제 파일(계획과 파일명 다름, `docs/portfolio/assets/`에 저장):
    - A1 = `naonzip-a1-home.png`
    - A2 = `naonzip-a2-trust-source-detail.jpg` (※ .png 아닌 .jpg)
    - A3 = `naonzip-a3-admin-trust-source.png`
  - 문서 삽입 완료: final-onepager(A1·A2·A3) / blog-final(A1→A2→A3) /
    shorts-episode-01(컷별 매핑) / ai-ops-onepage-sales(증빙 목록)
- [ ] B1~B5 캡처 완료 → case study/영업자료 보강
- [ ] C1~C4 (선택)
- [x] Admin 캡처 시 민감정보(주소창/쿠키/비번) 가림 확인 (A3 — 주소창/쿠키 미포함 확인)
- [x] 과장 표현 없는지 최종 확인("돈 된다"/"시장 검증 완료"/"성공한 서비스" 금지)
