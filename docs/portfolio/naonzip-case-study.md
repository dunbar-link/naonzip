# 나온집(Naonzip) — AI 운영형 서비스 제작 사례 (Case Study)

> 기획자 1인이 Claude Code(AI)와 함께 데이터 수집·DB 설계·UI·Admin CMS·SEO·이미지 운영·신뢰 출처
> 구조까지 만든 "AI 운영형 서비스 제작" 사례. 사람은 판단/방향, AI는 실행/검증/문서를 맡았다.

- 운영 URL: https://naonzip.vercel.app
- GitHub: dunbar-link/naonzip (master)
- 규모: 공개 식당 91곳 / 전체 107곳 / 정적 223페이지 / commit 129개
- 작성일: 2026-06-09 (Phase PORT-P1)

---

## 1. 프로젝트 개요

나온집은 부산에서 **방송·유튜브·가이드 등 "출처"에 나온 맛집**을 모아, 사용자가 "어디 / 뭐 먹음 /
왜 믿음 / 어떻게 감"을 빠르게 판단하고 길찾기·공유로 연결하는 모바일 웹/PWA다.

차별점은 **"어디서 봤는지(출처)"를 신뢰 신호로 전면화**한 것이다. 예약 플랫폼(캐치테이블 등)과
정면 경쟁하지 않고, "출처와 함께 빠르게 고르는 부산 맛집 큐레이션"으로 포지셔닝했다.

제작은 **사용자(기획·판단·방향 전환·최종 승인) + Claude Code(조사·구현·검증·문서)** 협업으로
진행됐다. AI가 데이터 후보 수집부터 DB 설계, RLS/마이그레이션, UI, Admin CMS, SEO, 이미지 운영,
신뢰 출처 구조/리포트까지 Phase 단위로 주도했다.

## 2. 문제 정의

- 부산 맛집 정보가 방송/유튜브/블로그에 흩어져 있고, 소비될 때 **"어디서 본 집인지" 신뢰 근거가
  사라진다.**
- 예약·웨이팅 인프라가 필요한 플랫폼과의 정면 경쟁은 1인 제작 기준 비현실적이다.
- 초기 사용자 피드백: "방송맛집만으론 신뢰가 약하다", "예약 기능이 없다", "돈이 안 될 것 같다".
- → 결론: 경쟁을 피하고 차별점을 세운다. **"출처가 남아 있는 부산 맛집"** 으로 신뢰를 설계한다.

## 3. 핵심 기능

- **공개 화면**: 홈 / 목록(지역 필터) / 상세(압축) / 검색(동의어·필드 가중치·핵심필드 게이트) /
  지도(Kakao) / 저장(localStorage) / 지역·프로그램·크리에이터·카테고리 랜딩(SEO).
- **상세페이지**: 썸네일 → 핵심정보(지역·카테고리·메뉴) → **출처 칩** → 가격 → 한 줄 설명 →
  핵심 CTA(카카오맵·전화·공유) → 위치 → "어디서 봤나요"(대표 출처 + 방송 details 접힘) →
  **"추가 출처"(신뢰 출처)** → 제보 → 관련 맛집.
- **신뢰 출처**: 방송/유튜브 + 가이드(미쉐린)·로컬(비짓부산)·예약·블로그·운영자확인 칩 + "출처 보기" 링크.
- **Admin CMS**: 후보 큐 수집→검토→변환→게시, 편집, 신뢰 출처 CRUD, 제보 큐, 빠른 등록(붙여넣기 파싱).
- **SEO**: JSON-LD(Restaurant/Breadcrumb/WebSite+SearchAction), 동적 OG 이미지, ISR, sitemap, 랜딩 intro.

## 4. 기술 스택

- **프론트/런타임**: Next.js 16.2.6 App Router, React 19, Tailwind CSS v4, TypeScript.
- **데이터/인프라**: Supabase(Postgres + RLS + service_role), Kakao Map(JS SDK + REST 지오코딩).
- **배포**: Vercel, ISR(revalidate 3600s), 정적 223페이지(상세 91 + OG 91 + 랜딩/루트).

## 5. 데이터 운영 구조

- **테이블**: `restaurants`(공개=anon+is_published, 쓰기=service_role) + `restaurant_appearances`(방송
  출연 1:N, 대표 방송은 어댑터가 최신 선정) + `candidate_queue`(후보 큐) + `restaurant_reports`(제보).
- **후보 파이프라인**: 후보 수집 → `candidate_queue`(PENDING/VERIFIED/REJECTED + 변환 추적) →
  운영자 검토 → `restaurants` 변환(비공개) → 공개 전 preflight → 공개 전환.
- **좌표**: Kakao REST 지오코딩 + 부산 범위 검증(좌표 추정·0,0 차단). 공개 게이트에서 재검증.
- **안전 운영**: mock fallback(Supabase 미설정 시), 1회성 import/검증 스크립트는 실행 후 삭제하고
  `reports/*.{md,csv}`만 커밋(감사 추적). 운영 DB 직접 변경은 신중(미적용 migration은 문서로 분리).

## 6. 이미지 운영 구조

- **저작권 안전 원칙**: 운영자 실사진 / 재사용 가능 공개 라이선스 / 직접 생성 placeholder만 사용.
  블로그·지도리뷰·인스타·캐치테이블·네이버 이미지의 무단 다운로드·재호스팅 금지.
- **파이프라인**: Supabase Storage 업로드(upsert 함정 — `update()`+download 검증), 모바일 캐시
  무효화(`?v=` 쿼리), 상단 우선 채움. 무썸네일은 카테고리 이모지 fallback으로 안전 표시.
- 현재 신규 공개 13곳 중 상단 4곳 실사진 완료, 9곳 backlog.

## 7. Admin / CMS 구조

- **인증**: 단일 비밀번호 → HMAC-SHA256 쿠키 세션(Edge-safe), proxy `/admin/:path*` 보호, 각
  server action에서 쿠키 재인증(우회 방어). service_role은 server 전용(클라 import 시 throw 가드).
- **기능**: 후보 큐 / 후보→식당 변환(+방송 출연 생성) / 게시·비공개 토글(필수값·좌표 공개 게이트) /
  편집(수정·공개 분리) / 비공개 draft 삭제(3중 방어) / **신뢰 출처 CRUD** / 제보 큐 / 빠른 등록.
- **무결성**: slug UNIQUE + 자기제외 중복검사, race 방어 WHERE, revalidatePath로 공개 캐시 무효화.

## 8. 신뢰 출처 구조 (TRUST arc, H3~H9)

- **테이블** `restaurant_trust_sources`(1:N): `source_kind`(tv/youtube/guide/local/reservation/blog/
  operator/other) + source_name/url/title/note/`trust_label`/`verified_at`/`is_public` + updated_at 트리거.
- **RLS**: 공개=`is_public=true` AND 부모 `is_published=true`(anon) / service_role 전체. appearances를
  **대체하지 않고 보완**한다.
- **파이프라인**: H3 설계+타입+resolver 확장 → H4 운영DB 적용+런타임 fallback-safe 조회 →
  H5 Admin CRUD UI → H6 상세 "추가 출처" 표시 → H7 source_url 링크 끝단 검증 → H8 후보 리포트 →
  H9 후보 5건 안전 import.
- **현재 데이터**: 비짓부산(local) 2건 공개 + 미쉐린(guide) 3건 staged(is_public=false, 운영자 확인 대기)
  + operator 샘플 1. 상세에 local 칩·"추가 출처"·"출처 보기" 라이브 노출.
- **정책**: 과장 신뢰어("검증 완료/최고/믿을 수 있는/보장") 금지. 사실 라벨만(미쉐린 빕구르망 / 부산
  공식 관광 소개 등). 외부 본문/리뷰/이미지 복제 금지.

## 9. 자동화 / Claude Code 협업 방식

- **역할 분담**: 사용자 = 기획·우선순위·방향 전환·최종 승인 / Claude Code = **조사 → 계획 → 구현 →
  검증 → 커밋** 의 Phase 단위 실행.
- **Subagent 프로토콜**: 각 Phase를 A(조사)/B(계획)/C(구현)/D(검증)/E(커밋)로 일관 수행.
- **AI 주도 영역**: 공개 웹 후보 수집(검색 수준), DB 스키마·RLS·마이그레이션 설계, UI 컴포넌트,
  Admin CMS server action, SEO 구조, 이미지 운영 스크립트, 신뢰 출처 구조/리포트.
- **안전장치**: `git add .` 금지·변경 파일 명시 stage, secret 비출력(env 샌드박스), 운영 DB 변경 신중
  (자동 DDL 불가 시 문서로 분리), **fallback-safe**(새 테이블 없어도 build/runtime 정상), 데이터
  변경분은 코드 커밋 없이 reports만 기록.

## 10. 검증 방식

- 매 Phase 필수: `git status` / `npx tsc --noEmit` / `npm run build`(정적 223페이지 유지).
- **프리렌더 HTML grep**으로 실제 노출 검증: 칩/톤(youtube=red, tv=blue, guide=emerald, local=amber,
  operator=teal)/링크 속성(target=_blank, rel=noopener noreferrer)/미노출 필드(source_note) 확인.
- 운영 DB read-only 확인: 테이블 존재/row count/RLS를 service_role·anon 양쪽으로 is_public 가시성 검증.
- **끝단 검증**: 데이터 1건 넣고 라이브 노출 확인 후 유지/복원 판단(예: H7은 검증 후 복원).
- **운영 학습 기록**: PostgREST는 DDL 불가(마이그레이션은 SQL Editor 수동) / 직접 INSERT는 Next 데이터
  캐시를 무효화하지 않아 `.next/cache` 클리어 후 재빌드로 확인(운영은 ISR/revalidatePath로 반영).

## 11. 성과

- 운영 가능한 **작은 풀스택 서비스 + Admin CMS + 데이터 파이프라인** 완성(공개 91곳, 정적 223페이지).
- **신뢰 출처 파이프라인 끝단까지 동작**: 설계→적용→입력→조회→칩→링크→실데이터 노출.
- SEO 구조(JSON-LD/OG/ISR/랜딩 intro) + 모바일 우선 UX + "출처 기반 큐레이션" 톤 일관화.
- 129 commit, Phase 단위 문서/리포트로 **감사 추적 가능한 운영 기록**.
- "AI가 서비스 운영 자동화를 어디까지 수행하는가"의 구체적·재현 가능한 사례.

## 12. 한계

- **예약/웨이팅 기능 없음** → 예약 플랫폼과 경쟁 불가.
- **B2B 수익모델 약함** → 식당 광고/제휴 없음.
- **실제 트래픽/수익 검증 없음**.
- 이미지·출처 **저작권은 지속 정책 관리 필요**.
- 신뢰 출처 데이터는 소량(운영자 수동 확장 필요). 미쉐린 등은 봇 차단(403)으로 자동 본문 검증 한계.
- 웹검색이 US 기반이라 한국 플랫폼(블루리본/캐치테이블) 정밀도 한계.

## 13. 사업성 판단

- 정면 사업화(예약·광고·전국 확장)는 **시간·인력·비용·제휴**가 필요해 현 단계 ROI가 낮다.
- 기능 확장보다 **"AI 운영형 제작 사례"로서의 가치**가 크다고 판단 → 방향 전환(포트폴리오화).
- 지역 큐레이션 + 신뢰 출처는 니치로 유지 가능하나, 수익화는 별도 과제(검증 안 됨).

## 14. 포트폴리오 관점 가치

- **AI(Claude Code)로 기획자 1인이 실제 운영 가능한 풀스택 서비스 + CMS + 데이터 파이프라인을 구축**한 사례.
- 데이터 수집~검증~운영, RLS/마이그레이션, SEO, 이미지 저작권 운영, 신뢰 구조 설계까지 "AI 운영실"
  수준의 자동화를 시연.
- 강조 메시지: **사람 = 판단/방향, AI = 실행/검증/문서.** 승인·검증·롤백·문서의 안전장치와 함께.
- 재사용: AI 운영실/DIFM 영업자료, 유튜브 쇼츠("AI가 맛집 앱을 이렇게 운영한다"), 블로그 case study 소재.

## 15. 향후 선택지

- **A. 포트폴리오/콘텐츠화(현 방향)**: case study + 쇼츠/블로그로 "AI 운영 사례" 자산화. (권장)
- **B. 니치 유지·소폭 개선**: 신뢰 출처 운영자 입력 확대, 미쉐린 staged 공개 전환, 썸네일 backlog 채움.
- **C. (비추천) 정면 사업화**: 예약/광고/전국 확장 — 자원·제휴·법무가 선행돼야 함.
