# 나온집 신규 10곳 썸네일 자동 보강 (Phase IMG-F1)

> 생성일: 2026-06-07 · 신규 공개 10곳 우선. **SAFE 이미지만** 다운로드→webp→Storage 업로드→thumbnail 갱신. REVIEW/UNSAFE는 기록만.
> 이미지 파일은 repo 밖(`C:\work\naonzip-thumbnail-input`)에만 저장. 비밀키 미출력.

## 요약

- 조사 대상: 신규 공개 10곳 (전부 thumbnail null로 시작)
- **SAFE 업로드: 1곳** (다리집)
- REVIEW(기록만): 7곳 (삼성갈미조개·상국이네·동방밀면·동삼동불짬뽕·수타혜미칼국수·블랑제리 라센·동춘이만두)
- no_candidate: 2곳 (해진아나고·만우장 — 공식 출처 없음, 플랫폼만)
- UNSAFE 강행: 0
- 다운로드 파일: 다리집 1건 webp (raw jpg는 검증 후 삭제)
- Storage 업로드: 1건 (restaurants/tzuyang-gwangalli-darijip/main.webp)
- DB thumbnail 업데이트: 1건 (다리집)
- 공개 thumbnail 보유: 13 → **14 (+1)**
- 신규 10곳 thumbnail: 1/10 보유
- 앱 코드 변경: 없음 / DB 변경: thumbnail 1건만 / Storage 변경: SAFE 1건만
- tsc: 0 / build: 성공(199페이지)
- 최종 판단: **B → A 혼합** — SAFE 1곳 반영, 나머지는 fallback 유지. 지인 공유 테스트는 진행 가능(이미지 없는 카드는 fallback 표시)

> 핵심: 이 10곳은 대부분 소규모 노포라 공식 홈페이지/공식 SNS가 거의 없어, 안전하게 쓸 SAFE 이미지가 매우 드물다(공식 사이트 보유: 다리집·삼성갈미조개 2곳뿐, 그중 음식 컷이 있는 곳은 다리집 1곳).

---

## 1. 대상별 결과

| status | slug | 식당명 | image_risk_level | source | uploaded_url | note |
|---|---|---|---|---|---|---|
| uploaded_safe | tzuyang-gwangalli-darijip | 다리집 | SAFE | 공식홈 darizip79.com | …/restaurants/tzuyang-gwangalli-darijip/main.webp | 떡볶이 공식 사진 |
| review_only | tzuyang-gangseo-samseong-galmijogae | 삼성갈미조개 | REVIEW | 공식홈(음식컷 없음) | — | 외관/배너만 |
| review_only | tzuyang-haeundae-sanggukine | 상국이네 | REVIEW | 공식SNS(로그인월)/SSG | — | 제품컷·접근불가 |
| review_only | tzuyang-yeongdo-dongbang-milmyeon | 동방밀면 | REVIEW | 기사(부산일보) | — | 핫링크 403 |
| review_only | tzuyang-yeongdo-dongsamdong-buljjampong | 동삼동불짬뽕 | REVIEW | 다이닝코드 | — | 플랫폼 |
| review_only | jeonhyun-namgu-suta-hyemi-kalguksu | 수타혜미칼국수 | REVIEW | 다이닝코드/방송 | — | 플랫폼/방송 |
| review_only | saengdal-gwangalli-boulangerie-lassence | 블랑제리 라센 | REVIEW | 다이닝코드 | — | 플랫폼 |
| review_only | tzuyang-seomyeon-dongchuni-mandu | 동춘이만두 | REVIEW | 다이닝코드 | — | 플랫폼 |
| no_candidate | sungsik-gwangalli-haejin-anago | 해진아나고 | none | 플랫폼만 | — | 공식 출처 없음 |
| no_candidate | sungsik-gwangalli-manujang | 만우장 | none | 플랫폼만 | — | 공식 출처 없음 |

---

## 2. 신규 10곳 결과

| slug | 식당명 | thumbnail_before | thumbnail_after | status | note |
|---|---|---|---|---|---|
| tzuyang-gwangalli-darijip | 다리집 | null | ✅ 있음 | uploaded_safe | 공식 사이트 떡볶이 사진 업로드 |
| tzuyang-gangseo-samseong-galmijogae | 삼성갈미조개 | null | null | review_only | 공식 음식 컷 없음 |
| tzuyang-haeundae-sanggukine | 상국이네 | null | null | review_only | 공식 SNS 접근불가 |
| tzuyang-yeongdo-dongbang-milmyeon | 동방밀면 | null | null | review_only | 기사 이미지뿐 |
| tzuyang-yeongdo-dongsamdong-buljjampong | 동삼동불짬뽕 | null | null | review_only | 플랫폼뿐 |
| jeonhyun-namgu-suta-hyemi-kalguksu | 수타혜미칼국수 | null | null | review_only | 플랫폼/방송뿐 |
| saengdal-gwangalli-boulangerie-lassence | 블랑제리 라센 | null | null | review_only | 플랫폼뿐 |
| tzuyang-seomyeon-dongchuni-mandu | 동춘이만두 | null | null | review_only | 플랫폼뿐 |
| sungsik-gwangalli-haejin-anago | 해진아나고 | null | null | no_candidate | 공식 출처 없음 |
| sungsik-gwangalli-manujang | 만우장 | null | null | no_candidate | 공식 출처 없음 |

---

## 3. 전체 thumbnail 상태

- published 총수: 79
- thumbnail 보유 전: 13
- thumbnail 보유 후: **14**
- 증가분: **+1**
- 미보유 수: 65 (신규 9곳 포함)

---

## 4. SAFE 이미지 상세

| slug | 식당명 | source_type | image_url | local_file | uploaded_url | SAFE 판단 이유 |
|---|---|---|---|---|---|---|
| tzuyang-gwangalli-darijip | 다리집 | 공식 홈페이지 | http://darizip79.com/default/img/business_2_1.jpg | C:\work\naonzip-thumbnail-input\tzuyang-gwangalli-darijip.webp | https://dnbkvchlytpvmtzisoux.supabase.co/storage/v1/object/public/restaurant-thumbnails/restaurants/tzuyang-gwangalli-darijip/main.webp | 식당 자체 도메인(darizip79.com, og:site_name "다리집 본점")이 호스팅하는 메뉴 페이지의 떡볶이(대표메뉴) 사진. 워터마크·사람 얼굴 없음 |

- **육안 검증**: 노란 접시의 떡볶이 클로즈업, 깔끔/선명. 변환 후(600×400 webp, 21.8KB) 재확인 완료. 공개 이미지 URL 200 image/webp 확인.
- **투명 고지**: 이미지 속 식기 테두리에 식당 자체 상호 "다리집"이 인쇄돼 있음(노란 접시·분홍 그릇 등 브랜드 식기에 일관 표기 → 제3자 워터마크가 아니라 식당 자체 브랜딩으로 판단해 업로드). 운영자가 원치 않으면 darizip79.com의 다른 메뉴 컷으로 교체 가능.

---

## 5. REVIEW/UNSAFE 이미지 상세

| slug | 식당명 | risk | source_type | image_url | skip 이유 |
|---|---|---|---|---|---|
| tzuyang-gangseo-samseong-galmijogae | 삼성갈미조개 | REVIEW | 공식홈(음식컷 없음) | ysamsung.79.ypage.kr | 공식 SAFE 사이트지만 갤러리=외관(이웃 점포 간판 노출)/건물/강풍경, 메뉴=텍스트 배너 → 깔끔한 음식/매장 단독 컷 없음 |
| tzuyang-haeundae-sanggukine | 상국이네 | REVIEW | 공식SNS/플랫폼 | instagram @sangcookine_official / ssg.com | 공식 인스타 로그인월 접근불가, SSG는 밀키트 제품컷(플랫폼 자산·운영주체 불명확) |
| tzuyang-yeongdo-dongbang-milmyeon | 동방밀면 | REVIEW | 기사 | busan.com 무봤나 기사 | 언론사 기사 본문 이미지(핫링크 403, 라이선스 언론사 귀속) |
| tzuyang-yeongdo-dongsamdong-buljjampong | 동삼동불짬뽕 | REVIEW | 플랫폼 | diningcode rid=ez7t77kVVXRv | 다이닝코드 프로필(플랫폼/사용자 업로드, 허락 불명) |
| jeonhyun-namgu-suta-hyemi-kalguksu | 수타혜미칼국수 | REVIEW | 플랫폼/방송 | diningcode 남구 손칼국수 | 다이닝코드=REVIEW, 전현무계획2 방송 캡처=UNSAFE |
| saengdal-gwangalli-boulangerie-lassence | 블랑제리 라센 | REVIEW | 플랫폼 | diningcode rid=i9NlGmkDZ8kX | 공식 채널 확인 실패, 다이닝코드=REVIEW, 방송 캡처=UNSAFE |
| tzuyang-seomyeon-dongchuni-mandu | 동춘이만두 | REVIEW | 플랫폼 | diningcode rid=KgHB4hQJezfT | 다이닝코드 프로필, 인스타/유튜브=UNSAFE |
| sungsik-gwangalli-haejin-anago | 해진아나고 | none | 플랫폼만 | diningcode rid=zjYAMLO4LFe1 | 공식 출처 없음, 플랫폼 프로필만 |
| sungsik-gwangalli-manujang | 만우장 | none | 플랫폼만 | siksinhot.com/P/396630 | 공식 출처 없음, 플랫폼 프로필만 |

> 절대 원칙 준수: 블로그/지도리뷰/개인 인스타/방송 캡처/워터마크/얼굴 중심/출처 불명 이미지는 다운로드·업로드 모두 안 함.

---

## 6. 생성/수정 파일

| 파일 | 내용 |
|---|---|
| reports/restaurant-thumbnail-fill-report.md | 썸네일 보강 결과(SAFE 업로드·REVIEW/UNSAFE 기록·전체 현황) |
| reports/restaurant-thumbnail-fill-report.csv | 11컬럼, 10행 |

> repo 밖: `C:\work\naonzip-thumbnail-input\tzuyang-gwangalli-darijip.webp` 추가(업로드 완료분 보관). 다운로드 raw jpg는 검증 후 삭제.

---

## 7. 검증 결과

- dry-run: 1건 planned (tzuyang-gwangalli-darijip), skip 0
- apply: 1건 success (Storage 업로드 + thumbnail UPDATE)
- 공개 이미지 URL: 200 image/webp
- npx tsc --noEmit: 에러 0
- npm run build: 성공 (정적 199페이지, exit 0)
- git diff --stat: reports 2개 (신규)
- git status --short: reports 2개 외 변경 없음 (앱/이미지/env/package/schema 무변경)

---

## 8. 운영자 조치 권장

- **즉시 효과 큰 보완**: 대장이 직접 찍은 음식 사진 제공 → `C:\work\naonzip-thumbnail-input\{slug}.webp`로 저장 후 `node scripts/upload-restaurant-thumbnails.mjs --apply`. (9곳: 삼성갈미조개·상국이네·동방밀면·동삼동불짬뽕·수타혜미칼국수·블랑제리 라센·동춘이만두·해진아나고·만우장)
- 공식 SNS 보유처(상국이네 인스타, 블랑제리 라센)는 사용 허락 받으면 SAFE로 전환 가능.
- 그 전까지 이미지 없는 카드는 fallback(이모지/플레이스홀더)로 정상 표시됨.

---

## 9. 다음 작업 제안

A. 남은 미썸네일은 fallback 유지하고 **지인 공유 테스트 진행** (이미지는 점진 보강) — 권장
B. 대장이 직접 음식 사진 제공 후 bulk upload (가장 임팩트 큼)
C. 공식 SNS 사용 허락 기반 추가 수집
D. 추가 식당 후보 수집 계속

---

## 10. 최종 판단

B. SAFE 이미지 부족, fallback 유지 후 테스트 권장 — 신규 10곳 중 공식 출처 음식 사진이 확보된 곳은 다리집 1곳뿐이라 1곳만 SAFE 업로드했다. 나머지 9곳은 안전 출처가 없어 fallback을 유지하며, 가장 효과적인 다음 단계는 **대장이 직접 음식 사진을 제공**하는 것이다. 이미지 부족이 공유 테스트를 막지는 않으므로 테스트는 병행 가능하다.
