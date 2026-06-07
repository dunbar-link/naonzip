# 나온집 홈 첫 화면 상위 5개 썸네일 집중 보강 (Phase IMG-F2)

> 생성일: 2026-06-07 · 홈 상위 5개 중 thumbnail 없는 4개만 집중 보강. SAFE 실사 우선, 없으면 자체 음식 일러스트 생성.
> 이미지 파일은 repo 밖(`C:\work\naonzip-thumbnail-input`). 비밀키 미출력. 앱 코드/스키마 무변경.

## 요약

- 홈 상위 5개(방송일 최신순): 금신전선 상유십이 · 할매김밥 · 원조가야밀면 · 구로마쯔 · 김미다멸 본점
- 대상(thumbnail 미보유): **4곳** (원조가야밀면은 기존 이미지 보유 → 제외/유지)
- SAFE 실제 이미지: **0곳** (4곳 모두 공식 실사 없음 — 구로마쯔만 공식 인스타=REVIEW)
- 자체 제작 일러스트: **4곳** (SVG→webp, 실제 음식에 맞춤)
- Storage 업로드: 4건 / DB thumbnail 업데이트: 4건
- 공개 thumbnail 보유: 14 → **18 (+4)**
- 홈 상위 5개 thumbnail null: 4 → **0**
- 홈 검증: 홈 HTML에 5개 카드 전부 `<img>` 썸네일 렌더 확인
- 앱 코드 변경: 없음 / DB 변경: thumbnail 4건만 / Storage 변경: 4건만
- tsc: 0 / build: 성공(199페이지)
- 최종 판단: **A. 홈 첫 화면 이미지 보강 완료, 공유 테스트 가능**

---

## 1. 홈 상위 5개 확인

| rank | slug | 식당명 | 방송일 | thumbnail_before | 대상 여부 |
|---:|---|---|---|---|---|
| 1 | live-today-suyeong-geumsin-jeonseon-sangyusibi | 금신전선 상유십이 | 2026-05-29 | 없음 | ✅ 대상 |
| 2 | live-today-donggu-halme-gimbap | 할매김밥 | 2026-05-29 | 없음 | ✅ 대상 |
| 3 | wonjo-gaya-milmyeon | 원조가야밀면 | 2026-05-25 | 있음 | ❌ 유지 |
| 4 | 2tv-gwangan-kuromatsu | 구로마쯔 | 2026-05-16 | 없음 | ✅ 대상 |
| 5 | 2tv-gijang-kimmida-myeol | 김미다멸 본점 | 2026-05-16 | 없음 | ✅ 대상 |

> 산출 방식: 코드(HomeClient = appearedAt 최신순 slice 5) 재현 + DB SELECT. 화면 추정 아님.

---

## 2. 이미지 보강 결과

| slug | 식당명 | image_type | source_type | uploaded_url | status | note |
|---|---|---|---|---|---|---|
| live-today-suyeong-geumsin-jeonseon-sangyusibi | 금신전선 상유십이 | 일러스트 | 자체제작 | …/sangyusibi/main.webp | uploaded_generated_illustration | 국수/곰탕 |
| live-today-donggu-halme-gimbap | 할매김밥 | 일러스트 | 자체제작 | …/halme-gimbap/main.webp | uploaded_generated_illustration | 김밥 |
| wonjo-gaya-milmyeon | 원조가야밀면 | 기존 | existing | …/wonjo-gaya-milmyeon/main.webp | already_has_thumbnail | 유지 |
| 2tv-gwangan-kuromatsu | 구로마쯔 | 일러스트 | 자체제작 | …/kuromatsu/main.webp | uploaded_generated_illustration | 철판 스테이크 |
| 2tv-gijang-kimmida-myeol | 김미다멸 본점 | 일러스트 | 자체제작 | …/kimmida-myeol/main.webp | uploaded_generated_illustration | 미역국+김 |

---

## 3. 생성 이미지 상세

| slug | 식당명 | 메뉴 기준(실제 확인) | local_file | size | note |
|---|---|---|---|---|---|
| live-today-suyeong-geumsin-jeonseon-sangyusibi | 금신전선 상유십이 | 자가제면 국수/육개장/곰탕 (회·스시 아님) | tzuyang… 아님 → live-today-suyeong-geumsin-jeonseon-sangyusibi.webp | 1200×900, ~30KB | 따끈한 국수 한 그릇(면·고기·계란·대파·젓가락) |
| live-today-donggu-halme-gimbap | 할매김밥 | 옛날 김밥/유부초밥 | live-today-donggu-halme-gimbap.webp | 1200×900, ~23KB | 김밥 단면 3개 + 통김밥 |
| 2tv-gwangan-kuromatsu | 구로마쯔 | 일식 철판요리/소고기 스테이크/전복·관자 | 2tv-gwangan-kuromatsu.webp | 1200×900, ~19KB | 철판 위 스테이크+새우+관자+가니쉬 |
| 2tv-gijang-kimmida-myeol | 김미다멸 본점 | 기장미역 미역국 + 곱창김 | 2tv-gijang-kimmida-myeol.webp | 1200×900, ~22KB | 미역국 그릇 + 김 스택 |

- 스타일: 따뜻한 크림 배경의 플랫 음식 일러스트. **사진풍 과장 없음**(실사 오해 방지). 텍스트/로고/상표/방송로고/사람 얼굴/저작권 캐릭터 없음.
- 구성: 음식 중앙 배치(카드 object-cover 중앙 crop 대응). 모두 육안 검증 완료.
- 제작: 임시 빌드 스크립트(SVG 작성 → sharp로 webp 변환). 스크립트는 작업 후 삭제(repo 미반영). package 미설치(sharp 기존 사용).

---

## 4. 업로드/DB 반영 검증

- dry-run: 4건 planned, skip/error 0
- apply: 4건 success (Storage 업로드 + thumbnail UPDATE)
- thumbnail 업데이트 수: 4
- 홈 상위 5개 thumbnail null 수 before: 4
- 홈 상위 5개 thumbnail null 수 after: **0**
- 공개 thumbnail 보유: 14 → 18
- 공개 이미지 URL: 4건 전부 200 image/webp

---

## 5. 홈 표시 검증 (로컬 next start)

- 카드 이미지 표시: 홈 HTML에 상위 5개 카드 전부 `restaurants/{slug}/main.webp` `<img>` 렌더 확인 (4 신규 + 원조가야밀면)
- crop 상태: 음식 중앙 배치로 object-cover(≈정사각) crop 시 음식이 가운데 표시
- 원조가야밀면 기존 이미지 유지: ✅ (건드리지 않음)
- fallback 남은 카드: 홈 상위 5개에는 0개 (emoji fallback 없음)
- 신규 이미지 사진 오해 여부: 플랫 일러스트라 실제 사진으로 오해 소지 낮음
- production 캐시/배포 이슈: production은 CI 클린 빌드/ISR(1시간) 후 반영(DB·Storage는 이미 반영 완료)

---

## 6. 생성/수정 파일

| 파일 | 내용 |
|---|---|
| reports/home-thumbnail-fill-report.md | 홈 상위 5개 보강 결과 |
| reports/home-thumbnail-fill-report.csv | 12컬럼, 5행 |

> repo 밖 `C:\work\naonzip-thumbnail-input\`에 신규 4개 webp 보관(업로드 완료분). 임시 생성 스크립트·임시 폴더는 삭제.

---

## 7. 검증 결과

- npx tsc --noEmit: 에러 0
- npm run build: 성공 (정적 199페이지, exit 0)
- git diff --stat: reports 2개 (신규)
- git status --short: reports 2개 외 변경 없음 (앱/이미지/env/package/schema 무변경)

---

## 8. 다음 작업 제안

A. **홈 이미지 보강 완료 → 지인 공유 테스트 진행** (권장)
B. 생성 일러스트 품질이 마음에 들면 같은 방식으로 나머지 미썸네일(약 61곳) 점진 보강
C. 대장이 직접 음식 사진 제공 시 실사로 교체
D. 추가 식당 후보 수집

---

## 9. 최종 판단

A. 홈 첫 화면 이미지 보강 완료, 공유 테스트 가능 — 홈 상위 5개 카드가 모두 음식 이미지(실사 1 + 일러스트 4)로 채워져 emoji fallback이 사라졌다. 일러스트는 실제 메뉴에 맞춰 제작했고 사진으로 오해되지 않는 플랫 스타일이다. 원하면 추후 실사로 교체 가능.
