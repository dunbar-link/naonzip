# 기존 업로드 입력 폴더 이동 결과

- 작업일: 2026-06-12
- 결정: 기존 업로드 입력 폴더(`C:\work\naonzip-thumbnail-input`) 사용 확정 (local-assets staging 안 폐기)

## Summary

- 신규 이미지 원본 폴더: `C:\work\naonzip\local-assets\restaurant-thumnails` (오타 폴더명 그대로, 이름 변경 안 함)
- 기존 업로드 입력 폴더: `C:\work\naonzip-thumbnail-input`
- 기존 잔여 이미지 archive 여부: **완료** (삭제 아님, 이동)
- 이동한 신규 이미지 수: **29** (jpg 27 / png 1 / jpeg 1)
- dry-run 실행 여부: **실행 완료** (`node scripts/upsert-restaurant-thumbnails.mjs`, 인자/`--apply`/`--replace` 없음)
- 실제 업로드 여부: **안 함** (dry-run은 Storage/DB/파일 변경 없음)
- DB 수정 여부: **없음** (dry-run의 restaurants SELECT 1회만)

## Archive 결과

- archive 폴더: `C:\work\naonzip-thumbnail-input-archive\2026-06-12-before-29-upload`
- archive 이동 파일 수: **32** (IMG-G6 잔여: webp 24 + jpg 8) — 전부 이동, 삭제 0
- 기존 입력 폴더 루트 정리 여부: 완료 — 이동 후 루트엔 `이미지업로드방법.txt`(텍스트 메모, 이미지 아님·스크립트 미인식) 1개만 잔류
- 하위 폴더: 원래 없음 (건드린 것 없음)

## 신규 이미지 이동 결과

- 이동 전(원본 폴더) 파일 수: 29
- 이동 후 원본 폴더 잔여: 0 (폴더 자체는 삭제하지 않고 유지)
- 최종 입력 폴더 루트 이미지 수: **29** (정확히 신규분만)
- 파일명 문제: 없음 (전부 slug 그대로, 변경 없음)
- 확장자 문제: 없음 (jpg/jpeg/png — 전부 허용 확장자, 변경 없음)
- 중복 문제: 없음 (slug당 1파일)

## dry-run 결과

- 실행 명령: `node scripts/upsert-restaurant-thumbnails.mjs` (기본 입력 폴더, dry-run)
- dry_run_planned_new: **29** ✅
- dry_run_planned_replace: 0
- skipped: 0 (skipped_missing_row / skipped_private / skipped_has_thumbnail / skipped_bad_image 전부 0)
- failed: 0
- slug mismatch: 0 (29개 slug 전부 restaurants에서 조회됨)
- 해상도 경고: 0 (400x300 미만 없음)
- 업로드 가능 여부: **가능 — 29건 전부 신규 업로드 준비 완료**

## 갱신된 스크립트 리포트

- `reports/thumbnail-upsert-result.md` — DRY-RUN, status 분포 dry_run_planned_new=29 (덮어씀)
- `reports/thumbnail-upsert-result.csv` — 29행 (덮어씀)
- 둘 다 git 커밋하지 않음 (워킹트리 변경 상태로 유지)

## 다음 단계

dry-run이 정확히 신규 29건 + 실패 0이므로, 다음 작업에서 아래로 실제 반영한다.

```
node scripts/upsert-restaurant-thumbnails.mjs --apply
```

- 동작: webp 변환(긴 변 ≤1200, q85) → Storage `restaurants/{slug}/main.webp` 신규 upload →
  download 바이트 검증 → `restaurants.thumbnail` URL 반영(29건)
- 반영 후 홈/목록/상세는 ISR(최대 1시간) 주기로 갱신됨
- 만우장(sungsik-gwangalli-manujang)은 이번 29건에 미포함 — 폐업 검증 후보 별도 처리(closed-business-candidates.md)
