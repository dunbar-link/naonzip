# 나온집 포트폴리오 화면 캡처 체크리스트 (PORT-P2)

> 운영자가 직접 캡처하는 가이드. 자동 생성하지 않는다(실패 시 무리하지 말 것).
> 캡처에 실제 운영 데이터가 보여도 무방하나, **Admin 화면은 비밀번호/세션 노출에 주의**(주소창·쿠키 가림).
> 권장: 모바일 폭(약 390~430px)으로 캡처해 실제 모바일 UX가 드러나게.

## 공개 화면

| # | 화면 | 경로 | 캡처 목적 | 보여줄 포인트 | 추천 파일명 |
|---|------|------|-----------|---------------|-------------|
| 1 | 홈 | / | 첫인상·정체성 | "부산 맛집, 어디서 봤는지까지" 히어로 + 카드 | 01-home.png |
| 2 | 목록 | /restaurants | 큐레이션 규모 | 지역 필터 + 카드 리스트(출처 칩) | 02-list.png |
| 3 | 상세(기본) | /restaurants/wonjo-gaya-milmyeon | 상세 구조 압축 | 썸네일+핵심정보+출처 칩+CTA(지도/전화/공유) | 03-detail-basic.png |
| 4 | 상세(신뢰 출처) | /restaurants/tzuyang-nampo-ijaemo-pizza | **핵심 차별점** | "어디서 봤나요" + local 칩(비짓부산) + "추가 출처" + "출처 보기" 링크 | 04-detail-trust.png |
| 5 | 상세(다중 출처) | /restaurants/hibab-haeundae-amsogalbi | 출처 다양성 | 유튜브 칩 + local 칩 동시(미쉐린은 비공개라 미노출) | 05-detail-multi.png |
| 6 | 지도 | /map | 위치 탐색 | Kakao 지도 + 핀 + 하단 안내 | 06-map.png |
| 7 | 검색 | /search | 탐색 UX | 추천 검색어 + "출처로 찾기" 빈화면 | 07-search.png |

## 관리자(Admin) 화면 — 로그인 필요

| # | 화면 | 경로 | 캡처 목적 | 보여줄 포인트 | 추천 파일명 |
|---|------|------|-----------|---------------|-------------|
| 8 | 후보 큐 | /admin/candidates | 데이터 운영 | 후보 수집→검토→변환 흐름 | 08-admin-candidates.png |
| 9 | 식당 수정 | /admin/restaurants/[slug]/edit | CMS 깊이 | 23필드 편집 폼 + 빠른 붙여넣기 | 09-admin-edit.png |
| 10 | 신뢰 출처 입력 UI | /admin/restaurants/[slug]/edit (하단 "신뢰 출처" 섹션) | **운영 자동화 핵심** | source_kind/이름/URL/라벨/공개 토글 + 과장표현 방지 안내 | 10-admin-trust-input.png |
| 11 | 제보 큐 | /admin/reports | 운영 루프 | 사용자 제보 → 상태 관리 | 11-admin-reports.png |

## 구조 설명용 (선택, 다이어그램/대시보드 캡처)

| # | 항목 | 캡처 목적 | 보여줄 포인트 | 추천 파일명 |
|---|------|-----------|---------------|-------------|
| 12 | Supabase 테이블 | 데이터 구조 증빙 | restaurants/appearances/candidate_queue/reports/trust_sources(RLS) | 12-supabase-tables.png |
| 13 | Storage | 이미지 운영 | 썸네일 버킷 구조(저작권 안전 원칙) | 13-storage.png |
| 14 | reports 폴더 | 감사 추적 | reports/*.md·csv 목록(데이터/trust/포트폴리오) | 14-reports.png |
| 15 | git log/그래프 | 작업 밀도 | commit 129개·Phase 단위 메시지 | 15-gitlog.png |

## 캡처 후 활용

- one-pager/blog: 1·4·10 중심(차별점 + AI 운영)
- 쇼츠: 3→4→10 전환(상세 → 신뢰 출처 → 관리자 입력)으로 "출처가 칩으로 뜨는" 장면 강조
- 영업자료: 8·9·10·12로 "운영 도구가 실제로 돈다" 증빙

> 참고: 신뢰 출처 칩이 화면에 안 보이면, 운영 사이트는 ISR(최대 1시간) 반영 지연일 수 있음.
> 즉시 확인은 해당 식당 Admin에서 저장 1회(revalidate) 후 새로고침.
