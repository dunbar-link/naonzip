# 2차 썸네일 dry-run 결과

- 작업일: 2026-06-12

## Summary

- 입력 폴더: `C:\work\naonzip-thumbnail-input`
- 예상 파일 수: 38 (공개 사진 누락 목록 No.31~No.68, 만우장은 1차에 이어 계속 제외)
- 실제 이미지 파일 수: **38** (예상과 정확히 일치)
- dry-run 실행 여부: 실행 완료 (`node scripts/upsert-restaurant-thumbnails.mjs`, 인자/`--apply`/`--replace`/`--include-private` 없음)
- 실제 업로드 여부: **안 함** (dry-run은 Storage/DB/파일 변경 없음)
- DB 수정 여부: **없음** (dry-run의 restaurants SELECT 1회만)

## 입력 폴더 확인

- 이미지 파일 수: 38
- 확장자별 개수: jpg 38 (jpeg/png/webp 0)
- 파일명 문제: 없음 (전부 slug 규칙, 누락 목록 No.31~68과 38/38 완전 일치)
- 중복 문제: 없음 (slug당 1파일)
- 1차 부산물 혼입 여부: **없음** — 1차 원본 29개·APPLY 부산물 webp 29개 모두 사용자 정리 완료, 1차 slug 0건
- 만우장 포함 여부: **없음** (sungsik-gwangalli-manujang 파일 0건)
- 비공개 식당 slug 혼입: 없음 (38개 전부 공개 식당)
- archive 혼입: 없음 (archive는 별도 폴더, 하위 폴더 없음)

## dry-run 결과

- dry_run_planned_new: **38** ✅
- dry_run_planned_replace: 0
- skipped: 0 (missing_row/private/has_thumbnail/bad_image 전부 0 — 1차 완료 slug가 안 섞였다는 교차 증거)
- failed: 0
- slug mismatch: 0 (38개 전부 restaurants 조회 성공)
- 해상도 경고: 0 (400x300 미만 없음)
- 업로드 가능 여부: **가능 — 38건 전부 신규 업로드 준비 완료**

## 갱신된 스크립트 리포트

- `reports/thumbnail-upsert-result.md` — DRY-RUN, dry_run_planned_new=38 (덮어씀, 미커밋)
- `reports/thumbnail-upsert-result.csv` — 38행 (덮어씀, 미커밋)

## 다음 단계

dry-run 결과가 정확히 신규 38건이고 실패가 없으므로, 다음 작업에서:

```
node scripts/upsert-restaurant-thumbnails.mjs --apply
```

→ webp 변환 → Storage `restaurants/{slug}/main.webp` 신규 업로드 → download 바이트 검증 →
`restaurants.thumbnail` 38건 반영. 완료 시 공개 식당 썸네일 보유 52 → 90곳
(공개 91곳 중 만우장 1곳만 남음 — 폐업 검증 후 처리).
