# 나온집 PORT-P1 — 포트폴리오 정리 요약 (운영자/ChatGPT 확인용)

- 작성일: 2026-06-09
- 목적: 나온집을 "AI 운영형 서비스 제작 사례"로 정리. 사업화 확장이 아닌 포트폴리오/콘텐츠 자산화.
- 본문 문서: `docs/portfolio/naonzip-case-study.md` / 타임라인: `reports/portfolio-p1-timeline.csv`

## 1. 현재 상태 요약

- 운영 URL: https://naonzip.vercel.app · GitHub: dunbar-link/naonzip(master) · commit 129개
- 공개 식당 91 / 전체 107 · 정적 223페이지 · 최신 commit 622b0a1(PORT-P1 직전)
- 스택: Next.js 16 App Router + React 19 + Tailwind v4 + Supabase(RLS) + Kakao Map + Vercel(ISR)
- 신뢰 출처: 비짓부산 local 2건 공개 + 미쉐린 guide 3건 staged + operator 샘플 1 (상세 라이브 노출)

## 2. 주요 Phase 타임라인 (요약)

- 기초: Next 앱 + slug SEO 라우트(4ba44a8) → Supabase 레이어 전환(18ecfe8~f1aa23d)
- SEO/탐색: 구조화 데이터·OG·ISR(955b097/fb042d9/536d685) + 랜딩(program/area/creator/category) + 검색
- 방송 출연 1:N: appearances 스키마/읽기/이력(25d8502/1e4eef0/705e1f6)
- Admin CMS: 제보·후보큐·변환·게시·편집·삭제·빠른등록(fa3be6c/cbefe33/4088f1f/b71ea2a/58cb8df …)
- 데이터 운영: 후보 수집~지오코딩~공개(DATA-G1 a9124e2 / G3 221a1c4 / G4 864d167 / G5 d4766c1)
- 이미지: 안전 썸네일 파이프라인 + 운영자 실사진(IMG-G6 49b1ca1)
- UX 톤 정렬: 상세 압축+출처 칩(UX-H1 667885a) / 공개 카피 큐레이션 톤(UX-H2 4a36195)
- 신뢰 출처: 설계 H3(cf51413) → 적용·런타임 H4(2bab64d) → Admin CRUD H5(1f1a2aa) →
  상세 표시 H6(a419d7d) → 링크 검증 H7(무커밋) → 후보 리포트 H8(f53708b) → import H9(622b0a1)
- PORT-P1: 본 포트폴리오 정리(docs/reports만)

## 3. 핵심 산출물

- 공개 서비스: 홈/목록/상세/검색/지도/저장 + 지역·프로그램·크리에이터·카테고리 랜딩
- Admin CMS: 후보→식당 변환, 게시 워크플로, 편집, 신뢰 출처 CRUD, 제보 큐
- 데이터 파이프라인: candidate_queue → 검토 → 변환 → preflight → 공개 (+감사용 reports)
- 신뢰 출처 시스템: restaurant_trust_sources(설계~import 끝단) + 상세 "추가 출처"/출처 보기
- 문서/리포트: docs(썸네일·trust 구조·portfolio), reports(데이터/이미지/trust 후보·import 등)

## 4. 포트폴리오로 보여줄 강점

- 기획자 1인 + AI(Claude Code)로 **운영 가능한 풀스택 서비스 + CMS + 데이터 파이프라인** 구축
- AI가 데이터 수집·DB/RLS 설계·UI·Admin·SEO·이미지·신뢰출처까지 Phase 단위로 실행/검증/문서화
- 안전장치: 변경 파일 명시 stage, secret 비출력, fallback-safe, 운영 DB 신중, reports 감사 추적
- 매 Phase tsc/build(223/223) + 프리렌더 grep 검증으로 "실제 노출"까지 확인

## 5. 멈춰야 할 확장 (의도적 비추진)

- 예약/웨이팅 기능, 식당 광고/B2B 수익모델, 전국 확장, 대량 외부 데이터/이미지 수집
- 이유: 1인 기준 ROI 낮음·제휴/법무/비용 선행 필요. 포트폴리오 가치가 더 큼.

## 6. 다음 추천

- A. 포트폴리오/콘텐츠화(현 방향): case study → 쇼츠/블로그/영업자료로 자산화  ← 추천
- B. 니치 유지·소폭 개선: 미쉐린 staged 공개 전환, 신뢰 출처 운영자 입력 확대, 썸네일 backlog
- C. (비추천) 정면 사업화: 자원·제휴 선행 필요
