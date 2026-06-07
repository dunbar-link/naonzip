# 나온집 모바일 이미지 캐시 무효화 (Phase IMG-F6)

> 생성일: 2026-06-07 · 실사진 교체분이 같은 main.webp 경로라 모바일 브라우저 캐시가 옛 일러스트를 표시 → DB thumbnail URL에 version query 추가로 캐시 무효화. **Storage·이미지 재업로드 없음, 앱 코드 무변경.**

## 요약

- 작업 결과: 대상 3곳 thumbnail URL에 `?v=imgf6-real-photo-20260607` 추가(캐시 무효화)
- 캐시 무효화 대상: **3곳** (상유십이·할매김밥·구로마쯔)
- DB thumbnail 업데이트: 3건 (URL query만, 각 영향 행 1)
- Storage 변경 여부: **없음**(파일/재업로드 없음)
- 공개 식당 수: **78 유지**
- 김미다멸 상태: 비공개 유지(is_published=false)
- 홈 상위 5개: 전부 thumbnail 보유(fallback 0). 1·2·4위 version query 부착
- fallback 여부: 0
- 생성/수정 파일: 2 (reports/)
- 앱 코드 변경 여부: 없음
- tsc 결과: 에러 0
- build 결과: 성공(정적 197페이지)
- commit: (아래 참조)
- push: master → origin/master
- 최종 판단: **A. 모바일 캐시 무효화 완료, 모바일 재확인 필요**

> 원리: RestaurantImage가 `<img src={thumbnail}>`로 렌더하므로 thumbnail URL이 `...main.webp?v=...`로 바뀌면 모바일 브라우저는 **새 URL = 캐시 미스 → 새 이미지(실사진) 재fetch**. Storage 객체는 이미 실사진(IMG-F4에서 download API로 검증)이라, 쿼리 붙은 URL도 실사진을 200으로 반환함(확인 완료).

---

## 1. 대상별 처리 결과

| slug | 식당명 | before | after | status | note |
|---|---|---|---|---|---|
| live-today-suyeong-geumsin-jeonseon-sangyusibi | 금신전선 상유십이 | main.webp | main.webp?v=imgf6-real-photo-20260607 | cache_busted | 영향 1, 공개 URL 261KB 실사 |
| live-today-donggu-halme-gimbap | 할매김밥 | main.webp | main.webp?v=imgf6-real-photo-20260607 | cache_busted | 영향 1, 공개 URL 110KB 실사 |
| 2tv-gwangan-kuromatsu | 구로마쯔 | main.webp | main.webp?v=imgf6-real-photo-20260607 | cache_busted | 영향 1, 공개 URL 60KB 실사 |
| 2tv-gumjeong-geumjukheon | 금죽헌 금정산성점 | main.webp | main.webp | checked_no_change | 신규 객체(IMG-F5), 캐시 문제 없음 → 변경 안 함 |
| wonjo-gaya-milmyeon | 원조가야밀면 | main.webp | main.webp | checked_no_change | 대상 외, 변경 안 함 |

---

## 2. 홈 상위 5개 확인

| rank | slug | 식당명 | thumbnail_has_version | fallback |
|---:|---|---|---|---|
| 1 | live-today-suyeong-geumsin-jeonseon-sangyusibi | 금신전선 상유십이 | 예 | 아니오 |
| 2 | live-today-donggu-halme-gimbap | 할매김밥 | 예 | 아니오 |
| 3 | wonjo-gaya-milmyeon | 원조가야밀면 | 아니오(변경 안 함) | 아니오 |
| 4 | 2tv-gwangan-kuromatsu | 구로마쯔 | 예 | 아니오 |
| 5 | 2tv-gumjeong-geumjukheon | 금죽헌 금정산성점 | 아니오(신규) | 아니오 |

- 홈 상위 5개 thumbnail null = 0. 캐시 무효화 필요 대상(상유십이·할매김밥·구로마쯔)만 version query 부착.

---

## 3. 검증 결과

- public image URL 200: 3곳 모두 쿼리 포함 URL이 200 image/webp + 실사진 크기(261KB/110KB/60KB)
- 공개 식당 수: 78 (유지)
- 김미다멸 404: 비공개 유지(is_published=false). 본 단계 공개상태 변경 없음
- npx tsc --noEmit: 에러 0
- npm run build: 성공 (정적 197페이지, exit 0)
- git diff --stat: reports 2개 (신규)
- git status --short: reports 2개 외 변경 없음 (앱/이미지/env/package/schema/Storage 무변경)

---

## 4. commit / push 결과

- commit hash: (아래 커밋 단계)
- commit message: chore(data): bust mobile thumbnail cache
- push 결과: master → origin/master

---

## 5. 모바일 확인 요청

운영자는 Vercel 배포(또는 ISR revalidate) 후 모바일에서 아래를 확인한다.

1. 홈 새로고침 → 상유십이/할매김밥이 실사진으로 보이는지
2. 그래도 옛 이미지면 브라우저 탭 완전 종료 후 재접속
3. 그래도 옛 이미지면 시크릿 모드 또는 다른 브라우저로 확인
4. 참고: 공개 페이지(목록/홈)는 ISR(1시간) 또는 재배포 후 새 URL이 반영됨. DB·Storage는 이미 실사진.

---

## 6. 최종 판단

A. 모바일 캐시 무효화 완료, 모바일 재확인 필요 — 실사 교체 3곳(상유십이·할매김밥·구로마쯔)의 thumbnail URL에 version query를 붙여 모바일 브라우저가 새 URL로 실사진을 재fetch하도록 했다. Storage·앱 코드 변경 없이 DB URL만 수정. 배포/ISR 반영 후 모바일에서 새로고침으로 확인하면 된다.
