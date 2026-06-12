# 나온집 이미지 폴더 구조 점검 (업로드 전)

- 점검일: 2026-06-10 (read-only — DB/Storage/git 변경 없음)

## 1. 확인한 이미지 관련 폴더

| 경로 | 상태 | 내용 |
|---|---|---|
| `C:\work\naonzip\local-assets\restaurant-thumnails` | **존재 (⚠ 폴더명 오타: b 누락)** | 사용자가 넣은 이미지 29개 |
| `C:\work\naonzip\local-assets\restaurant-thumbnails` | 없음 | 가이드가 안내했던 정식 명칭 — 미생성 |
| `C:\work\naonzip\public\` | 존재 | Next 기본 svg 5개뿐. **식당 이미지 없음** |
| `C:\work\naonzip\public\images`, `public\restaurants` | 없음 | — |
| `C:\work\naonzip\docs\portfolio\assets` | 존재 | 포트폴리오 캡처 3장(용도 다름) |
| `C:\work\naonzip-thumbnail-input` (repo 밖) | 존재 | **기존 업로드 입력 폴더** — IMG-G6 때 쓰던 원본+변환 webp 33개 |

## 2. "기존 식당 이미지 폴더"의 실체

사용자 의문("기존 식당 이미지 폴더가 이미 있는데 왜 새 폴더?")에 대한 답:

- **서비스에 표시되는 식당 이미지는 repo 안 폴더가 아니라 Supabase Storage**
  (`restaurant-thumbnails` 버킷, `restaurants/{slug}/main.webp`)에 있다. repo 안에는 식당 이미지 폴더가 원래 없다.
- 과거 업로드 작업(IMG-G6 등)의 **입력(staging) 폴더는 repo 밖** `C:\work\naonzip-thumbnail-input`이었다.
  (스크립트 기본값이며, "입력 이미지는 repo 밖" 설계 원칙 때문)
- 사진 보강 가이드(photo-upload-guide.md)가 안내한 `local-assets\restaurant-thumbnails`는
  기존 입력 폴더 관례를 반영하지 못한 **새 staging 경로 제안**이었다. 둘 다 "업로드 전 임시 폴더"이고,
  스크립트는 경로 override를 지원하므로 어느 쪽이든 동작한다.

## 3. 기존 업로드 스크립트 관례 (scripts/upsert-restaurant-thumbnails.mjs — 읽기만, 미실행)

| 항목 | 값 |
|---|---|
| 기본 입력 폴더 | `C:\work\naonzip-thumbnail-input` (positional 인자로 **임의 경로 override 가능**) |
| 허용 확장자 | `.jpg` `.jpeg` `.png` `.webp` (같은 slug 중복 시 jpg > jpeg > png > webp 우선) |
| 파일명 매칭 | 파일명(확장자 제외) = `restaurants.slug` |
| Storage | bucket `restaurant-thumbnails`, 경로 `restaurants/{slug}/main.webp` (webp 변환: 긴 변 ≤1200, q85) |
| DB 컬럼 | `restaurants.thumbnail` (신규=plain URL, 교체=`?v=` cache-bust) |
| 기본 모드 | **dry-run** (Storage/DB/파일 변경 없음). 실제 반영은 `--apply` |
| 옵션 | `--only slugA,slugB` / `--replace`(기존 썸네일 교체) / `--include-private` |
| 검증 | 신규=upload·교체=update 후 **download 바이트 재검증**, DB update 영향 행 1 확인, 400x300 미만 경고 |
| 리포트 | `reports/thumbnail-upsert-result.{md,csv}` 덮어쓰기 |
| ⚠ 부산물 | **APPLY 시 입력 폴더에 `{slug}.webp` 변환본을 함께 저장** (원본 유지) |

## 4. A안 vs B안

| | A안: 기존 폴더 재사용 | B안: local-assets staging 유지 |
|---|---|---|
| 방법 | 29개 파일을 `C:\work\naonzip-thumbnail-input`으로 이동 | 현재 폴더 그대로, 스크립트에 경로 인자 전달 |
| 장점 | 스크립트 기본값 그대로·webp 부산물이 repo 밖에 생김(원 설계 원칙) | 파일 이동 불필요·프로젝트 옆이라 관리 직관적 |
| 단점 | 기존 33개(구 입력+webp)와 섞임 → `--only`로 한정 필요 | APPLY 시 repo 안(local-assets)에 webp 부산물 생성(untracked) → **절대 git add 금지** 유지 필요 |

## 5. 추천 (Claude Code 판단)

**B안 추천** — 파일이 이미 들어가 있고, 스크립트가 경로 override를 공식 지원하며, 구 폴더와 섞이지 않아 깔끔하다.
단 2가지 조건:

1. **폴더명 오타는 그대로 둬도 동작하지만**(스크립트에 실제 경로를 넘기면 됨), 혼동 방지를 위해
   다음 단계에서 `restaurant-thumnails` → `restaurant-thumbnails` 로 이름 변경 권장(가이드 문서와 일치).
2. `local-assets/` 는 **계속 untracked로 유지**하고 절대 커밋하지 않는다(원본+webp 부산물 포함).

다음 단계 실행 예(아직 실행하지 말 것):

```
# 1) dry-run (변경 없음, 계획 검증)
node scripts/upsert-restaurant-thumbnails.mjs "C:\work\naonzip\local-assets\restaurant-thumbnails"

# 2) 결과 확인 후 실제 반영
node scripts/upsert-restaurant-thumbnails.mjs "C:\work\naonzip\local-assets\restaurant-thumbnails" --apply
```
