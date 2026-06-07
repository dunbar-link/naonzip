# 나온집 홈 5위 금죽헌 실사진 보강 (Phase IMG-F5)

> 생성일: 2026-06-07 · 홈 상위 5개 마지막 fallback(금죽헌)을 운영자 제공 실사진으로 보강.
> 이미지 파일 repo 밖(`C:\work\naonzip-thumbnail-input`). 비밀키 미출력. 앱 코드/스키마 무변경.

## 요약

- 작업 결과: 금죽헌 금정산성점 썸네일 실사진 보강 완료 → **홈 상위 5개 전부 실사진(fallback 0)**
- 대상: 2tv-gumjeong-geumjukheon / 금죽헌 금정산성점
- 실사진 교체: 1 (운영자 제공)
- 공개 식당 수: **78 유지**
- 홈 상위 5개: 상유십이·할매김밥·원조가야밀면·구로마쯔·금죽헌 (전부 실사진)
- fallback 여부: **0**
- Storage 업로드: 1건(신규 객체 생성)
- DB thumbnail 업데이트: 1건
- 김미다멸 상태: 비공개 유지(is_published=false, 404)
- 생성/수정 파일: 2 (reports/)
- 앱 코드 변경 여부: 없음
- tsc 결과: 에러 0
- build 결과: 성공(정적 197페이지)
- commit: (아래 참조)
- push: master → origin/master
- 최종 판단: **A. 홈 첫 화면 5개 실사진 완료, 지인 공유 테스트 진행 가능**

---

## 1. 대상 처리 결과

| slug | 식당명 | before | after | status | note |
|---|---|---|---|---|---|
| 2tv-gumjeong-geumjukheon | 금죽헌 금정산성점 | thumbnail 없음(null) | 실사진(main.webp 146KB) | filled_with_operator_photo | 소불고기 전골 실사(반찬·채소), 메뉴 일치 |

---

## 2. 홈 상위 5개 재검증

| rank | slug | 식당명 | thumbnail | fallback |
|---:|---|---|---|---|
| 1 | live-today-suyeong-geumsin-jeonseon-sangyusibi | 금신전선 상유십이 | 실사진 | 아니오 |
| 2 | live-today-donggu-halme-gimbap | 할매김밥 | 실사진 | 아니오 |
| 3 | wonjo-gaya-milmyeon | 원조가야밀면 | 실사진 | 아니오 |
| 4 | 2tv-gwangan-kuromatsu | 구로마쯔 | 실사진 | 아니오 |
| 5 | 2tv-gumjeong-geumjukheon | 금죽헌 금정산성점 | 실사진 | 아니오 |

- **홈 상위 5개 thumbnail null = 0개.** 첫 화면 emoji fallback 없음.

---

## 3. 검증 결과

- image URL 200: 금죽헌 200 image/webp 146,488B (download API 저장 바이트 = 공개 URL 일치 → 신규 반영 확인)
- 공개 식당 수: 78 (유지)
- 김미다멸 404: 비공개 유지(is_published=false) — 공개 URL 404 (IMG-F4에서 확인, 본 단계 변경 없음)
- npx tsc --noEmit: 에러 0
- npm run build: 성공 (정적 197페이지, exit 0)
- git diff --stat: reports 2개 (신규)
- git status --short: reports 2개 외 변경 없음 (앱/이미지/env/package/schema 무변경)

---

## 4. commit / push 결과

- commit hash: (아래 커밋 단계)
- commit message: chore(data): fill final home thumbnail
- push 결과: master → origin/master

---

## 5. 최종 판단

A. 홈 첫 화면 5개 실사진 완료, 지인 공유 테스트 진행 가능 — 홈 상위 5개가 모두 운영자/공식 실사진으로 채워져 첫 화면에 fallback이 없다. 공개 78곳, 김미다멸 비공개 유지. 공유 테스트 준비 완료.
