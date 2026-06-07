# 나온집 대표사진 업서트 가이드 (운영용)

운영자가 식당 사진(썸네일)을 **신규 등록** 또는 **교체**할 때 쓰는 안전 스크립트 사용법.

- 스크립트: `scripts/upsert-restaurant-thumbnails.mjs`
- 입력 폴더: `C:\work\naonzip-thumbnail-input`
- (기존 `scripts/upload-restaurant-thumbnails.mjs` 는 보존. 신규/교체 통합은 이 upsert 스크립트 사용 권장)

---

## 1. 사진 파일명 규칙

입력 폴더에 `{slug}.jpg` / `.jpeg` / `.png` / `.webp` 로 넣는다. 파일명은 식당 slug 와 **정확히** 일치해야 한다.

```
saengdal-haeundae-amisan.jpg
mulkkong-sikdang.png
saengdal-ssangdungyi-doejigukbap.webp
```

- slug 와 안 맞는 파일은 처리되지 않고 report 에 기록된다.
- 같은 slug 에 여러 확장자가 있으면 우선순위(jpg → jpeg → png → webp)로 1장만 쓰고 나머지는 "중복확장자 무시"로 기록한다.
- 스크립트가 webp(긴 변 ≤1200px, 품질 85)로 변환한다. 원본은 삭제하지 않는다.

---

## 2. 기본 사용 (항상 dry-run 먼저)

```
# 1) 무엇이 처리될지 미리보기 (Storage/DB/파일 변경 없음)
node scripts/upsert-restaurant-thumbnails.mjs

# 2) 실제 반영
node scripts/upsert-restaurant-thumbnails.mjs --apply
```

- 기본은 dry-run. `--apply` 가 있을 때만 실제로 업로드/DB 변경.
- 기본은 **공개 식당만**, **기존 썸네일 없는 식당만** 처리(신규 업로드).

---

## 3. 옵션

| 옵션 | 역할 | 기본 |
|---|---|---|
| (없음) | dry-run, 계획만 출력 | dry-run |
| `--apply` | 실제 Storage 업로드 + DB thumbnail 업데이트 | off |
| `--only slugA,slugB` | 해당 slug만 처리(쉼표 구분) | 전체 |
| `--replace` | 기존 썸네일이 있어도 교체(없으면 보유 식당은 skip) | off |
| `--include-private` | 비공개 식당도 처리 | 공개만 |
| `<경로>` | 입력 폴더 경로 변경 | `C:\work\naonzip-thumbnail-input` |

### 자주 쓰는 명령

```
# 특정 식당 1곳만 신규 업로드 미리보기
node scripts/upsert-restaurant-thumbnails.mjs --only saengdal-haeundae-amisan

# 특정 식당 1곳만 실제 신규 업로드
node scripts/upsert-restaurant-thumbnails.mjs --only saengdal-haeundae-amisan --apply

# 기존 썸네일을 새 사진으로 교체(권장: --only 와 함께)
node scripts/upsert-restaurant-thumbnails.mjs --only 2tv-gwangan-kuromatsu --replace --apply

# 비공개 식당까지 포함해서 미리보기
node scripts/upsert-restaurant-thumbnails.mjs --include-private
```

---

## 4. 동작/안전장치

- **신규**(썸네일 없음): `storage.upload` 로 생성 → `restaurants.thumbnail` = public URL.
- **교체**(`--replace`): `storage.update` 로 덮어쓰기(단순 upsert 만 믿지 않음) → 업로드 후 `storage.download` 로 실제 저장 바이트를 검증 → `thumbnail` URL 에 `?v=thumb-<날짜시간>` cache-bust 부여.
- DB UPDATE 는 대상 slug 단건, 영향 행 1만 허용.
- 비밀키는 출력하지 않음(존재 여부만).
- dry-run 은 Storage/DB/로컬 파일 어떤 것도 바꾸지 않음.
- 실행 시 `reports/thumbnail-upsert-result.{md,csv}` 생성.

---

## 5. 모바일에서 옛 이미지가 남을 때

같은 `main.webp` 경로를 교체하면 모바일 브라우저가 옛 이미지를 캐시할 수 있다. `--replace` 는 자동으로 thumbnail URL 에 `?v=` 를 붙여 새 URL 로 강제 재요청되게 한다.

그래도 옛 이미지가 보이면:

1. 모바일 홈 새로고침
2. 브라우저 탭 완전 종료 후 재접속
3. 시크릿 모드/다른 브라우저로 확인
4. 배포(또는 ISR 약 1시간) 반영 대기 — DB·Storage 는 이미 갱신됨

---

## 6. 주의

- 이미지는 repo 밖 입력 폴더에만 둔다(git 에 추가하지 않음).
- 사람 얼굴 중심/워터마크/저작권 불명 사진은 운영자가 사전에 걸러서 넣는다(스크립트는 운영자 제공 전제로 처리).
- 업로드 후 입력 폴더의 잔여 파일은 다음 실행 때 재처리될 수 있으니, 교체가 아니라면 정리하거나 `--only` 로 범위를 제한한다.
