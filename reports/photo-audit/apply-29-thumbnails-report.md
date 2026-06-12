# 29개 썸네일 실제 반영 결과

- 작업일: 2026-06-12

## Summary

- 입력 폴더: `C:\work\naonzip-thumbnail-input` (apply 전 재확인: 이미지 29개 정확, 중복 0, 하위 폴더 0, archive 32개 분리 무결)
- 실행 명령: `node scripts/upsert-restaurant-thumbnails.mjs --apply` (--replace/--include-private 미사용, 경로 인자 없음)
- 실제 업로드 여부: **완료** — Storage `restaurant-thumbnails` 버킷 `restaurants/{slug}/main.webp` 29건 신규 업로드(webp 변환, 긴 변 ≤1200 q85)
- DB thumbnail 반영 여부: **완료** — `restaurants.thumbnail` 29건 업데이트(신규라 plain URL, cache-bust 불필요)
- 앱 코드 변경 여부: 없음

## Apply 결과 (스크립트 리포트 기준)

- 신규 업로드(uploaded_new): **29**
- 교체(replaced): 0
- skipped: 0
- failed: 0
- download 검증 실패: 0 (스크립트가 업로드 직후 download API로 바이트 일치 검증 — 전건 통과)
- thumbnail DB 반영 실패: 0 (영향 행 1 확인 — 전건 통과)

## DB 검증 (별도 read-only SELECT, 스크립트와 독립)

- 검증 대상 slug 수: 29
- thumbnail 채워진 slug 수: **29 / 29** — 전부 `…/storage/v1/object/public/restaurant-thumbnails/restaurants/{slug}/main.webp` 형식 일치
- thumbnail 누락 slug 수: 0
- 만우장 제외 여부: **확인** — `sungsik-gwangalli-manujang` thumbnail=null, is_published=true 그대로(미수정)
- 부가 확인: 공개 식당 썸네일 보유 23 → **52곳** (91곳 중, +29 정확히 일치) / 공개 사진 누락 잔여 **39곳**

## 주의 사항

- ISR 갱신까지 최대 1시간 걸릴 수 있음 (홈/목록/상세 화면 반영 지연은 정상)
- 만우장은 폐업 검증 후보로 별도 유지 (reports/photo-audit/closed-business-candidates.md)
- 이번 작업은 신규 맛집 추가가 아님 (기존 공개 식당의 thumbnail 컬럼만 반영)
- 입력 폴더에는 APPLY 부산물로 `{slug}.webp` 변환본 29개가 생성됨(원본 보존, repo 밖 — 정상)

## 다음 단계 후보

1. 공개 사진 누락 목록 31번 이후(잔여 39곳) 사진 계속 수집
2. 만우장 폐업 여부 최종 검증 → 확인 시 Admin 공개 토글로 비공개
3. 기존 DB 주소/전화/가격 신뢰도 감사 시작
