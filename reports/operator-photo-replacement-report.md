# 나온집 운영자 제공 실사진 교체 + 김미다멸 비공개 전환 (Phase IMG-F4)

> 생성일: 2026-06-07 · 운영자 제공 실사진으로 상유십이/할매김밥 썸네일 교체 + 김미다멸 본점 비공개 전환(삭제 아님).
> 이미지 파일 repo 밖(`C:\work\naonzip-thumbnail-input`). 비밀키 미출력. 앱 코드/스키마 무변경.

## 요약

- 작업 결과: 운영자 사진 2곳 교체 + 김미다멸 비공개 전환 완료
- 실사진 교체: **2** (상유십이·할매김밥 — 운영자 제공 실사진)
- 비공개 전환: **1** (김미다멸 본점, is_published true→false, 삭제 아님)
- 공개 식당 수: **79 → 78**
- 홈 상위 5개: 상유십이·할매김밥·원조가야밀면·구로마쯔(전부 실사진) + 금죽헌 금정산성점(신규 5위)
- fallback 여부: **홈 5위 금죽헌 1곳 썸네일 없음**(§11에 따라 보고만, 자동 보강 안 함)
- 김미다멸 공개 URL: **404**(정상)
- Storage 업로드: 2곳 교체(상유십이·할매김밥)
- DB 변경: thumbnail 2건 + 김미다멸 is_published=false 1건
- 생성/수정 파일: 2 (reports/)
- 앱 코드 변경 여부: 없음
- tsc 결과: 에러 0
- build 결과: 성공(정적 197페이지, 199→197 = 김미다멸 상세+OG 제거)
- commit: (아래 참조)
- push: master → origin/master
- 최종 판단: **A. 운영자 사진 교체 및 비식당 공개 해제 완료, 공유 테스트 가능** (단 홈 5위 금죽헌 이미지 보강은 선택)

---

## 1. 대상 처리 결과

| slug | 식당명 | action | before | after | thumbnail | status | note |
|---|---|---|---|---|---|---|---|
| live-today-suyeong-geumsin-jeonseon-sangyusibi | 금신전선 상유십이 | 썸네일 교체 | pub=true | pub=true | 일러스트→실사진 | replaced_with_operator_photo | 놋그릇 메밀국수 |
| live-today-donggu-halme-gimbap | 할매김밥 | 썸네일 교체 | pub=true | pub=true | 일러스트→실사진 | replaced_with_operator_photo | 김밥 단면 |
| 2tv-gijang-kimmida-myeol | 김미다멸 본점 | 비공개 전환 | pub=true | pub=false | 변경 없음 | unpublished_non_restaurant | 삭제 아님, 404 |
| wonjo-gaya-milmyeon | 원조가야밀면 | 유지 | pub=true | pub=true | 실사(유지) | verified | 미변경 |
| 2tv-gwangan-kuromatsu | 구로마쯔 | 유지 | pub=true | pub=true | 실사(유지) | verified | 미변경 |

---

## 2. 운영자 제공 사진 처리

| slug | 식당명 | input_file | output_file | image_check | upload_status |
|---|---|---|---|---|---|
| live-today-suyeong-geumsin-jeonseon-sangyusibi | 금신전선 상유십이 | live-today-suyeong-geumsin-jeonseon-sangyusibi.jpg (1280×1218, 491KB) | …sangyusibi.webp (1200×1142, 261KB) | 음식 중심·얼굴/워터마크 없음·메뉴 일치(메밀국수+양지+지단) | 교체 완료(stored 261214B) |
| live-today-donggu-halme-gimbap | 할매김밥 | live-today-donggu-halme-gimbap.jpg (900×900, 210KB) | …halme-gimbap.webp (900×900, 110KB) | 음식 중심·얼굴/워터마크 없음·메뉴 일치(김밥 단면) | 교체 완료(stored 110672B) |

- 운영자가 `C:\work\naonzip-thumbnail-input`에 직접 .jpg 2장을 넣어둠(파일명=slug 일치). 두 장 모두 육안 검증 통과.
- **기술 메모(중요)**: 벌크 스크립트의 `upload(upsert:true)`가 이 2개 **기존 객체**를 success 보고에도 실제로 덮어쓰지 못함. → Supabase Storage `update()`로 강제 교체 후 **download API로 실제 저장 바이트(261214B/110672B) 확인**(공개 URL CDN도 갱신됨). 임시 스크립트는 작업 후 삭제. (앞으로 기존 썸네일 교체 시 update() 또는 download 검증 권장.)

---

## 3. 김미다멸 비공개 전환

- slug: 2tv-gijang-kimmida-myeol
- 전환 전: is_published=true
- 전환 후: is_published=false
- UPDATE 영향 행: **1** (게이트: 대상 row 정확히 1개, 영향 1 확인)
- 공개 URL: /restaurants/2tv-gijang-kimmida-myeol → **404**(정상)
- 삭제 여부: **삭제 안 함**(row·restaurant_appearances·Storage 이미지 모두 보존). 재공개 가능.

---

## 4. 홈 상위 5개 재검증

| rank | slug | 식당명 | 방송일 | thumbnail | fallback |
|---:|---|---|---|---|---|
| 1 | live-today-suyeong-geumsin-jeonseon-sangyusibi | 금신전선 상유십이 | 2026-05 | 실사진 | 아니오 |
| 2 | live-today-donggu-halme-gimbap | 할매김밥 | 2026-05 | 실사진 | 아니오 |
| 3 | wonjo-gaya-milmyeon | 원조가야밀면 | 2026-05 | 실사진 | 아니오 |
| 4 | 2tv-gwangan-kuromatsu | 구로마쯔 | 2026-05 | 실사진 | 아니오 |
| 5 | 2tv-gumjeong-geumjukheon | 금죽헌 금정산성점 | 2026-05 | 없음 | **예(emoji)** |

- 김미다멸 홈/목록/검색/지도 노출 제외 확인(홈 5위권 밖, 공개 URL 404).
- 홈 1~4위 모두 실사진. **5위 금죽헌은 김미다멸이 빠지며 새로 진입했고 썸네일 없음** → §11에 따라 이번엔 보고만(자동 보강 안 함).

---

## 5. 공개 수 변화

- 전: 79
- 후: **78**
- 전체 restaurants 수: 94 (불변 — 삭제 없음)
- production 캐시/ISR: DB·Storage 즉시 반영. 목록 78곳·홈은 로컬 클린 빌드에서 확인됨. production은 CI 클린 빌드/ISR(1시간) 후 반영.

---

## 6. 검증 결과

- image URL 200: 상유십이 261,214B / 할매김밥 110,672B (실사진, download API + 공개 URL 모두 확인)
- 김미다멸 공개 URL: 404 (로컬 실측)
- 목록: 78곳 (로컬 실측)
- npx tsc --noEmit: 에러 0
- npm run build: 성공 (정적 197페이지, exit 0)
- git diff --stat: reports 2개 (신규)
- git status --short: reports 2개 외 변경 없음 (앱/이미지/env/package/schema 무변경)

---

## 7. commit / push 결과

- commit hash: (아래 커밋 단계)
- commit message: chore(data): replace operator photos and unpublish non-restaurant
- push 결과: master → origin/master

---

## 8. 다음 작업 제안

A. 홈 확인 후 **지인 공유 테스트 진행**(홈 1~4위 실사, 5위만 fallback)
B. **홈 5위 금죽헌 금정산성점** 이미지 보강(운영자 사진 제공 또는 SAFE 실사/일러스트)
C. 김미다멸 sitemap/SEO 캐시 반영 확인(배포 후)
D. 추가 식당 후보 수집

---

## 9. 최종 판단

A. 운영자 사진 교체 및 비식당 공개 해제 완료, 공유 테스트 가능 — 상유십이·할매김밥이 운영자 실사진으로 교체되어 홈 1~4위가 모두 실사진이 되었고, 김미다멸은 안전하게 비공개 전환(삭제 아님, 404)되었다. 홈 5위 금죽헌만 fallback이라, 원하면 사진 보강 후 공유하면 더 완성도가 높다(현재 상태로도 공유 가능).
