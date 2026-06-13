# 2차 38개 썸네일 실제 반영 결과

- 작업일: 2026-06-12

## Summary

- 입력 폴더: `C:\work\naonzip-thumbnail-input` (apply 전 재확인: jpg 38개 정확, 중복 0, 1차 부산물 0, 만우장 0, 하위 폴더 0)
- 실행 명령: `node scripts/upsert-restaurant-thumbnails.mjs --apply` (--replace/--include-private/경로 인자 없음)
- 실제 업로드 여부: **완료** — Storage `restaurant-thumbnails` 버킷 `restaurants/{slug}/main.webp` 38건 신규 업로드(webp 변환, 긴 변 ≤1200 q85)
- DB thumbnail 반영 여부: **완료** — `restaurants.thumbnail` 38건 업데이트(신규 plain URL)
- 앱 코드 변경 여부: 없음

## Apply 결과 (스크립트 리포트 기준)

- 신규 업로드(uploaded_new): **38**
- 교체(replaced): 0
- skipped: 0
- failed: 0
- download 검증 실패: 0 (업로드 직후 download API 바이트 일치 — 전건 통과)
- thumbnail DB 반영 실패: 0 (영향 행 1 확인 — 전건 통과)

## DB 검증 (별도 read-only SELECT, 스크립트와 독립)

- 검증 대상 slug 수: 38 (누락 목록 No.31~68)
- thumbnail 채워진 slug 수: **38 / 38** — 전부 `…/restaurant-thumbnails/restaurants/{slug}/main.webp` 형식 일치
- thumbnail 누락 slug 수: 0
- 공개 식당 썸네일 보유 수: **90 / 91** (52 → 90, +38 정확히 일치)
- 공개 사진 누락 잔여 수: **1 (만우장뿐)**
- 만우장 제외 여부: **확인** — 입력 파일 0건, 대상 미포함
- 만우장 thumbnail 유지 여부: **확인** — `sungsik-gwangalli-manujang` thumbnail=null, is_published=true 그대로(미수정)

## 주의 사항

- ISR 갱신까지 최대 1시간 걸릴 수 있음 (홈/목록/상세 화면 반영 지연은 정상)
- 만우장은 폐업 검증 후보로 별도 유지 (closed-business-candidates.md)
- 이번 작업은 신규 맛집 추가가 아님 (기존 공개 식당 thumbnail만 반영)
- 입력 폴더에 APPLY 부산물 `{slug}.webp` 38개 생성됨(원본 보존, repo 밖 — 정상)
- **사진 보강 프로젝트 사실상 완료**: 1차 29 + 2차 38 = 67건 반영, 공개 91곳 중 90곳 썸네일 보유

## 사용자 메모 (후속 데이터 정정 후보 — 이번 작업 미수행)

- 히밥 청사포 회센타(hibab-cheongsa-hoe-center): 식당명 "청사포 도희네 조개구이"가 맞다는 메모 → 식당명 수정 검토
- 해운대암소갈비(hibab-haeundae-amsogalbi): 가격 재검토
- 양가네양곱창(baekban-haeundae-yangs-yanggopchang): 주소 재검토
